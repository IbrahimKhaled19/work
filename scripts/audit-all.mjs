/**
 * Audit every route, not just the homepage.
 *
 *   npm run audit:all
 *
 * `npm run audit` measures one URL. That is the right number to quote for the
 * site's most important page, and it is the only one anyone will ever look at.
 * It is also the number most likely to hide a problem: a template-level change
 * can wreck one route and leave the other eighteen untouched.
 *
 * The 13 service pages are the reason. They are the pages that earn traffic, they
 * carry the Service and OfferCatalog structured data, and each one is a separate
 * prerendered document that can differ from its siblings. They were never
 * measured.
 *
 * Every route is audited here and scored against thresholds, so a regression
 * names the route that caused it. Exits non-zero if any route falls below.
 */
import { spawn, spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const ROOT = process.cwd()
const PORT = Number(process.env.AUDIT_PORT || 4185)
const OUT = path.join(os.tmpdir(), 'lighthouse-all')
const LIGHTHOUSE = process.env.LIGHTHOUSE_VERSION || '12'

// Thresholds for the home page. Other routes get a looser performance bar
// because they are not the landing page, but SEO and accessibility are absolute:
// there is no acceptable value for either on any page.
const GATE = {
  '/': { performance: 90, seo: 100, accessibility: 95, bestPractices: 95 },
  default: { performance: 70, seo: 100, accessibility: 95, bestPractices: 95 },
}

// --- routes -----------------------------------------------------------------
const { routes } = await import(pathToFileURL(path.join(ROOT, 'src', 'routes.manifest.js')).href)
function pathToFileURL(p) {
  return new URL(`file://${p.replace(/\\/g, '/')}`)
}

const targets = [
  { path: '/', name: 'home' },
  ...routes
    .filter((r) => r.type === 'service')
    .map((r) => ({ path: r.pathname, name: 'service' })),
  { path: '/services', name: 'listing' },
  { path: '/about', name: 'static' },
  { path: '/contact', name: 'static' },
]

if (!fs.existsSync(path.join(ROOT, 'dist', 'index.html'))) {
  console.error('  dist/ not found - run `npm run build` first.')
  process.exit(1)
}

const chrome =
  process.env.CHROME_PATH ||
  [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome',
  ].find((p) => fs.existsSync(p))
if (!chrome) {
  console.error('  Chrome not found. Set CHROME_PATH.')
  process.exit(1)
}
process.env.CHROME_PATH = chrome

// --- serve ------------------------------------------------------------------
const server = spawn(process.execPath, ['scripts/serve-dist.mjs', String(PORT)], {
  stdio: 'ignore',
})
const cleanup = () => !server.killed && server.kill()
process.on('exit', cleanup)

const waitForServer = async () => {
  for (let i = 0; i < 40; i += 1) {
    try {
      const res = await fetch(`http://localhost:${PORT}/`, { method: 'HEAD' })
      if (res.ok || res.status === 404) return true
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 250))
  }
  return false
}
if (!(await waitForServer())) {
  console.error(`  serve-dist did not come up on ${PORT}`)
  cleanup()
  process.exit(1)
}

// --- audit each route -------------------------------------------------------
const pad = (v, n) => String(v).padEnd(n)
const rpad = (v, n) => String(v).padStart(n)
const NPX = process.platform === 'win32' ? 'npx.cmd' : 'npx'

console.log(`\nAuditing ${targets.length} routes (Lighthouse ${LIGHTHOUSE})...\n`)

const rows = []
const failures = []

for (const [i, t] of targets.entries()) {
  const url = `http://localhost:${PORT}${t.path}`
  const outFile = path.join(OUT, `${i}.json`)
  fs.mkdirSync(OUT, { recursive: true })

  const result = spawnSync(
    NPX,
    [
      '--yes',
      `lighthouse@${LIGHTHOUSE}`,
      url,
      '--output=json',
      `--output-path=${outFile}`,
      '--chrome-flags=--headless=new --no-sandbox',
      '--only-categories=performance,accessibility,best-practices,seo',
      '--quiet',
    ],
    { stdio: 'ignore', env: process.env, shell: process.platform === 'win32' }
  )

  if (result.status !== 0 || !fs.existsSync(outFile)) {
    rows.push({ path: t.path, error: 'audit failed to run' })
    failures.push(`${t.path}: Lighthouse did not produce a report`)
    continue
  }

  const report = JSON.parse(fs.readFileSync(outFile, 'utf8'))
  const score = (id) => {
    const c = report.categories[id]
    return c && c.score !== null ? Math.round(c.score * 100) : null
  }
  const metrics = report.audits?.metrics?.details?.items?.[0] || {}

  const row = {
    path: t.path,
    performance: score('performance'),
    accessibility: score('accessibility'),
    bestPractices: score('best-practices'),
    seo: score('seo'),
    lcp: metrics.largestContentfulPaint ? Math.round(metrics.largestContentfulPaint) : null,
    cls: metrics.cumulativeLayoutShift ?? null,
  }
  rows.push(row)

  const gate = GATE[t.path] || GATE.default
  for (const [key, min] of Object.entries(gate)) {
    const value = row[key]
    if (value === null) {
      failures.push(`${t.path}: ${key} scored null`)
    } else if (value < min) {
      failures.push(`${t.path}: ${key} ${value} is below the ${min} threshold`)
    }
  }

  process.stdout.write(`  [${i + 1}/${targets.length}] ${t.path.padEnd(42)} perf ${rpad(row.performance, 3)}\r`)
}

cleanup()

// --- report -----------------------------------------------------------------
console.log(`\nauditing every route\n${'-'.repeat(76)}`)
console.log(`${pad('route', 40)}${rpad('perf', 6)}${rpad('a11y', 6)}${rpad('best', 6)}${rpad('seo', 5)}${rpad('LCP', 8)}${rpad('CLS', 7)}`)
console.log('-'.repeat(76))
for (const r of rows) {
  if (r.error) {
    console.log(pad(r.path, 40) + rpad('ERR', 6))
    continue
  }
  console.log(
    pad(r.path.length > 38 ? r.path.slice(0, 37) + '…' : r.path, 40) +
      rpad(r.performance, 6) +
      rpad(r.accessibility, 6) +
      rpad(r.bestPractices, 6) +
      rpad(r.seo, 5) +
      rpad(r.lcp ? r.lcp + 'ms' : '-', 8) +
      rpad(r.cls ?? '-', 7)
  )
}
console.log('-'.repeat(76))

const ok = rows.filter((r) => !r.error)
const avg = (k) => Math.round(ok.reduce((s, r) => s + r[k], 0) / ok.length)
const worst = (k) => ok.reduce((m, r) => (r[k] < m[k] ? r : m), ok[0])
console.log(
  `${pad(`${ok.length} routes`, 40)}${rpad(avg('performance'), 6)}${rpad(
    avg('accessibility'),
    6
  )}${rpad(avg('bestPractices'), 6)}${rpad(avg('seo'), 5)}   (average)`
)
console.log(
  `${pad('worst route', 40)}${rpad(worst('performance').performance, 6)}${rpad(
    worst('accessibility').accessibility,
    6
  )}${rpad(worst('bestPractices').bestPractices, 6)}${rpad(worst('seo').seo, 5)}   ${
    worst('performance').path
  }`
)
console.log('')

if (failures.length) {
  console.log(`${'x'.repeat(76)}\nFAILED (${failures.length})`)
  for (const f of failures) console.log(`  - ${f}`)
  console.log('')
  process.exit(1)
}

console.log(`${'='.repeat(76)}`)
console.log(`PASSED - all ${ok.length} routes meet their thresholds\n`)
