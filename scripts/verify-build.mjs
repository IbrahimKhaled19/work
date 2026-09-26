/**
 * Validate the built output in dist/.
 *
 * This is the guard that makes the prerender a permanent property rather than a
 * one-time fix. It fails the build if any route regresses to the failure modes
 * that matter:
 *
 *   - an empty <body> (the client-rendered-SPA problem Phase 2 exists to solve)
 *   - a duplicate <title> or <canonical> across routes
 *   - a missing or unparseable JSON-LD block
 *   - an asset reference that does not exist on disk
 *   - a page still marked index, follow when it is the 404
 *
 *   node scripts/verify-build.mjs
 */
import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const DIST = path.join(ROOT, 'dist')

if (!fs.existsSync(DIST)) {
  console.error('  dist/ not found - run `npm run build` first.')
  process.exit(1)
}

const failures = []
const fail = (m) => failures.push(m)

function walk(dir) {
  const out = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) out.push(...walk(full))
    else out.push(full)
  }
  return out
}

const htmlFiles = walk(DIST).filter((f) => f.endsWith('.html'))
if (htmlFiles.length === 0) {
  console.error('  no HTML files in dist/')
  process.exit(1)
}

const titles = new Map()
const canonicals = new Map()
const assetRefs = new Set()
let totalText = 0

for (const file of htmlFiles) {
  const rel = path.relative(DIST, file).replace(/\\/g, '/')
  const html = fs.readFileSync(file, 'utf8')
  const isNotFound = rel === '404.html'

  // --- content present --------------------------------------------------
  const body = html.slice(html.indexOf('<body'))
  const text = body
    .replace(/<script[\s\S]*?<\/script>/g, ' ')
    .replace(/<style[\s\S]*?<\/style>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  if (text.length < 300) {
    fail(`${rel}: only ${text.length} characters of body text - looks like an empty shell`)
  }
  totalText += text.length

  // --- title ------------------------------------------------------------
  const title = html.match(/<title>([\s\S]*?)<\/title>/)?.[1]?.trim()
  if (!title) fail(`${rel}: no <title>`)
  else if (titles.has(title)) fail(`${rel}: duplicate title with ${titles.get(title)} - "${title}"`)
  else titles.set(title, rel)

  // --- canonical --------------------------------------------------------
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1]
  if (!canonical) fail(`${rel}: no canonical`)
  else if (canonicals.has(canonical)) {
    fail(`${rel}: duplicate canonical with ${canonicals.get(canonical)} - ${canonical}`)
  } else {
    canonicals.set(canonical, rel)
    if (canonical.startsWith('http://localhost')) {
      fail(`${rel}: canonical points at localhost - set VITE_SITE_URL`)
    }
  }

  // --- robots -----------------------------------------------------------
  const robots = html.match(/<meta name="robots" content="([^"]+)"/)?.[1] || ''
  if (isNotFound && !robots.includes('noindex')) {
    fail(`${rel}: 404 page must be noindex, got "${robots}"`)
  }
  if (!isNotFound && !robots.includes('index')) {
    fail(`${rel}: indexable page has robots "${robots}"`)
  }

  // --- JSON-LD ----------------------------------------------------------
  const ldMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)
  if (isNotFound) {
    if (ldMatch) fail(`${rel}: 404 page should not carry JSON-LD`)
  } else if (!ldMatch) {
    fail(`${rel}: no JSON-LD block`)
  } else {
    try {
      const parsed = JSON.parse(ldMatch[1].replace(/\\u003c/g, '<'))
      if (parsed['@context'] !== 'https://schema.org') fail(`${rel}: bad JSON-LD @context`)
      if (!Array.isArray(parsed['@graph'])) fail(`${rel}: JSON-LD @graph missing`)
    } catch (error) {
      fail(`${rel}: JSON-LD does not parse - ${error.message}`)
    }
  }

  // --- asset references -------------------------------------------------
  for (const m of html.matchAll(/(?:src|href)="(\/[^"]+)"/g)) {
    const url = m[1]
    if (url.startsWith('//') || url.startsWith('/api/')) continue
    assetRefs.add(url.split('?')[0])
  }
}

// Every locally-referenced asset must exist on disk.
for (const ref of assetRefs) {
  const target = path.join(DIST, decodeURIComponent(ref))
  const ok = fs.existsSync(target) || fs.existsSync(path.join(target, 'index.html'))
  if (!ok) fail(`referenced asset does not exist in dist/: ${ref}`)
}

// --- report --------------------------------------------------------------
console.log(`\nverifying dist/\n${'-'.repeat(60)}`)
console.log(`html files         : ${htmlFiles.length}`)
console.log(`unique titles      : ${titles.size}`)
console.log(`unique canonicals  : ${canonicals.size}`)
console.log(`asset refs checked : ${assetRefs.size}`)
console.log(`body text rendered : ${totalText.toLocaleString()} characters`)

if (failures.length) {
  console.log(`\n${'x'.repeat(60)}\nFAILED (${failures.length})`)
  for (const m of failures) console.log(`  - ${m}`)
  console.log('')
  process.exit(1)
}

console.log(`\n${'='.repeat(60)}\nPASSED - all build output assertions hold\n`)
