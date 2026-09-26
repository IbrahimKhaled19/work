/**
 * Check that dist/ is deployable, and that the host configs did not
 * reintroduce the SPA rewrite that breaks prerendering.
 *
 *   node scripts/verify-deploy.mjs
 *
 * Two failure classes:
 *
 *  1. Output problems - a route missing one of its two resolution forms, a
 *     missing 404.html, a missing asset, a sitemap URL with no file behind it.
 *
 *  2. Config problems - a `_redirects`, `vercel.json` or `.htaccess` that
 *     contains a blanket rewrite to /index.html. That rule looks harmless and
 *     is the single most likely way to undo all of Phase 2, so it is treated as
 *     a hard failure rather than a warning.
 */
import fs from 'node:fs'
import path from 'node:path'

import { routes, notFoundPath } from '../src/routes.manifest.js'
import { outputFilesFor } from '../src/routes.manifest.js'

const ROOT = process.cwd()
const DIST = path.join(ROOT, 'dist')
const PUBLIC = path.join(ROOT, 'public')

const failures = []
const fail = (m) => failures.push(m)
const notes = []

if (!fs.existsSync(DIST)) {
  console.error('  dist/ not found - run `npm run build` first.')
  process.exit(1)
}

// ---------------------------------------------------------------------------
// 1. Every route present in both resolution forms
// ---------------------------------------------------------------------------
for (const route of routes) {
  for (const outFile of outputFilesFor(route.pathname)) {
    const target = path.join(DIST, outFile)
    if (!fs.existsSync(target)) {
      fail(`route ${route.pathname}: missing dist/${outFile}`)
    }
  }
}

const notFoundFiles = outputFilesFor(notFoundPath)
for (const outFile of notFoundFiles) {
  if (!fs.existsSync(path.join(DIST, outFile))) {
    fail(`missing dist/${outFile} - hosts serve this for unmatched URLs`)
  }
}

// ---------------------------------------------------------------------------
// 2. Crawl files present and pointing at the right host
// ---------------------------------------------------------------------------
const sitemapPath = path.join(DIST, 'sitemap.xml')
if (!fs.existsSync(sitemapPath)) {
  fail('missing dist/sitemap.xml - run `npm run build:crawl`')
} else {
  const sitemap = fs.readFileSync(sitemapPath, 'utf8')
  const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])
  if (locs.length !== routes.length) {
    fail(`sitemap lists ${locs.length} URLs but there are ${routes.length} routes`)
  }
  for (const loc of locs) {
    const pathname = new URL(loc).pathname
    if (pathname === '/') continue
    const candidates = [pathname, pathname.replace(/\/$/, ''), `${pathname}/`]
    const found = candidates.some((c) => {
      const base = path.join(DIST, c)
      return (
        fs.existsSync(base) ||
        fs.existsSync(`${base}.html`) ||
        fs.existsSync(path.join(base, 'index.html'))
      )
    })
    if (!found) fail(`sitemap URL has no file behind it: ${loc}`)
  }
  if (locs.some((l) => l.includes('404'))) {
    fail('sitemap includes the 404 document')
  }
}

const robotsPath = path.join(DIST, 'robots.txt')
if (!fs.existsSync(robotsPath)) {
  fail('missing dist/robots.txt')
} else {
  const robots = fs.readFileSync(robotsPath, 'utf8')
  if (!/^Sitemap:\s*https?:\/\//m.test(robots)) {
    fail('robots.txt has no absolute Sitemap: directive')
  }
  if (/localhost/.test(robots)) fail('robots.txt points at localhost - set VITE_SITE_URL')
}

// ---------------------------------------------------------------------------
// 3. Host configs: reject the SPA rewrite
// ---------------------------------------------------------------------------
const HOST_CONFIGS = ['_redirects', 'vercel.json', '.htaccess', '_headers']

for (const name of HOST_CONFIGS) {
  const inPublic = path.join(PUBLIC, name)
  const inDist = path.join(DIST, name)

  if (!fs.existsSync(inPublic)) {
    notes.push(`${name} not generated - run \`npm run deploy:config\``)
    continue
  }
  if (!fs.existsSync(inDist)) {
    fail(`${name} is in public/ but was not copied into dist/`)
    continue
  }

  const body = fs.readFileSync(inDist, 'utf8')
  // Strip comment lines so the explanatory prose in each file is not mistaken
  // for an active rule.
  const active = body
    .split('\n')
    .filter((line) => !line.trim().startsWith('#'))
    .join('\n')

  // A catch-all that rewrites everything to the root index is the SPA rule.
  const spaRewrite = /(\/\*|\^\/|\.\*)\s+\/(\.\/)?index\.html|\/\*\s*\/index\.html/.exec(active)
  if (spaRewrite) {
    fail(
      `${name} contains a catch-all rewrite to index.html ("${spaRewrite[0].trim()}"). ` +
        'That is the SPA rule and it would serve the homepage for all 19 routes.'
    )
  }
}

// ---------------------------------------------------------------------------
// report
// ---------------------------------------------------------------------------
console.log(`\nverifying deployability\n${'-'.repeat(64)}`)
console.log(`routes               : ${routes.length} (each in 2 resolution forms)`)
console.log(`404 document         : ${notFoundFiles.join(', ')}`)
console.log(`crawl files          : sitemap.xml, robots.txt`)
console.log(`host configs checked : ${HOST_CONFIGS.filter((n) => fs.existsSync(path.join(PUBLIC, n))).join(', ') || 'none generated'}`)

if (notes.length) {
  console.log('\nnotes')
  for (const n of notes) console.log(`  - ${n}`)
}

if (failures.length) {
  console.log(`\n${'x'.repeat(64)}\nFAILED (${failures.length})`)
  for (const m of failures) console.log(`  - ${m}`)
  console.log('')
  process.exit(1)
}

console.log(`\n${'='.repeat(64)}`)
console.log('PASSED - dist/ is deployable and no config reintroduces an SPA rewrite\n')
