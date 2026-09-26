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

/**
 * The prerender writes each route twice - `<route>.html` and
 * `<route>/index.html` - so that the site resolves regardless of how the host
 * maps URLs to files. Both copies of a route are one route, so group them and
 * assert uniqueness per route rather than per file.
 */
const routeOf = (rel) => rel.replace(/\/index\.html$/, '.html')

const grouped = new Map()
for (const file of htmlFiles) {
  const rel = path.relative(DIST, file).replace(/\\/g, '/')
  const key = routeOf(rel)
  if (!grouped.has(key)) grouped.set(key, [])
  grouped.get(key).push(rel)
}

const titles = new Map()
const canonicals = new Map()
const assetRefs = new Set()
const absoluteRefs = new Set()
let totalText = 0
let fileCount = 0

for (const [route, files] of grouped) {
  const file = path.join(DIST, files[0])
  const html = fs.readFileSync(file, 'utf8')
  const isNotFound = route === '404.html'
  fileCount += files.length

  // Every copy of a route must be byte-identical, or the host will serve
  // different metadata depending on which form the visitor's URL resolves to.
  for (const other of files.slice(1)) {
    if (fs.readFileSync(path.join(DIST, other), 'utf8') !== html) {
      fail(`${route}: ${other} differs from ${files[0]} - the two URL forms must be identical`)
    }
  }

  // --- content present --------------------------------------------------
  const body = html.slice(html.indexOf('<body'))
  const text = body
    .replace(/<script[\s\S]*?<\/script>/g, ' ')
    .replace(/<style[\s\S]*?<\/style>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  if (text.length < 300) {
    fail(`${route}: only ${text.length} characters of body text - looks like an empty shell`)
  }
  totalText += text.length

  // --- title ------------------------------------------------------------
  const title = html.match(/<title>([\s\S]*?)<\/title>/)?.[1]?.trim()
  if (!title) fail(`${route}: no <title>`)
  else if (titles.has(title)) fail(`${route}: duplicate title with ${titles.get(title)} - "${title}"`)
  else titles.set(title, route)

  // --- canonical --------------------------------------------------------
  // The 404 must NOT have one: it is noindex, and a canonical there would
  // either point at a URL that does not exist or, worse, at a real page.
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1]
  if (isNotFound) {
    if (canonical) fail(`${route}: 404 page must not have a canonical - found ${canonical}`)
    if (/<meta property="og:url"/.test(html)) fail(`${route}: 404 page must not have an og:url`)
  } else if (!canonical) {
    fail(`${route}: no canonical`)
  } else if (canonicals.has(canonical)) {
    fail(`${route}: duplicate canonical with ${canonicals.get(canonical)} - ${canonical}`)
  } else {
    canonicals.set(canonical, route)
    if (canonical.startsWith('http://localhost')) {
      fail(`${route}: canonical points at localhost - set VITE_SITE_URL`)
    }
  }

  // --- robots -----------------------------------------------------------
  const robots = html.match(/<meta name="robots" content="([^"]+)"/)?.[1] || ''
  if (isNotFound && !robots.includes('noindex')) {
    fail(`${route}: 404 page must be noindex, got "${robots}"`)
  }
  if (!isNotFound && !robots.includes('index')) {
    fail(`${route}: indexable page has robots "${robots}"`)
  }

  // --- JSON-LD ----------------------------------------------------------
  const ldMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)
  if (isNotFound) {
    if (ldMatch) fail(`${route}: 404 page should not carry JSON-LD`)
  } else if (!ldMatch) {
    fail(`${route}: no JSON-LD block`)
  } else {
    try {
      const parsed = JSON.parse(ldMatch[1].replace(/\\u003c/g, '<'))
      if (parsed['@context'] !== 'https://schema.org') fail(`${route}: bad JSON-LD @context`)
      if (!Array.isArray(parsed['@graph'])) fail(`${route}: JSON-LD @graph missing`)
    } catch (error) {
      fail(`${route}: JSON-LD does not parse - ${error.message}`)
    }
  }

  // --- asset references -------------------------------------------------
  for (const m of html.matchAll(/(?:src|href)="(\/[^"]+)"/g)) {
    const url = m[1]
    if (url.startsWith('//') || url.startsWith('/api/')) continue
    assetRefs.add(url.split('?')[0])
  }

  // Absolute URLs are not covered by the root-relative sweep above, and an
  // og:image pointing at a path that does not exist is invisible until someone
  // shares a link. Check any absolute URL on our own origin resolves too.
  for (const m of html.matchAll(/(?:content|href)="(https?:\/\/[^"]+)"/g)) {
    const url = m[1]
    let parsed
    try {
      parsed = new URL(url)
    } catch {
      continue
    }
    // Only assert on our own origin; third-party URLs (fonts) are not ours.
    const siteOrigin = (canonical || '').match(/^https?:\/\/[^/]+/)?.[0]
    if (siteOrigin && parsed.origin === siteOrigin) {
      absoluteRefs.add(parsed.pathname)
    }
  }
}

// Every locally-referenced asset must exist on disk.
for (const ref of assetRefs) {
  const target = path.join(DIST, decodeURIComponent(ref))
  const ok = fs.existsSync(target) || fs.existsSync(path.join(target, 'index.html'))
  if (!ok) fail(`referenced asset does not exist in dist/: ${ref}`)
}

// Same for absolute URLs on our own origin (og:image, og:url siblings).
for (const ref of absoluteRefs) {
  if (ref === '/' || ref.endsWith('/')) continue
  const target = path.join(DIST, decodeURIComponent(ref))
  const ok = fs.existsSync(target) || fs.existsSync(path.join(target, 'index.html'))
  if (!ok) fail(`absolute URL points at a missing file: ${ref}`)
}

// --- report --------------------------------------------------------------
console.log(`\nverifying dist/\n${'-'.repeat(60)}`)
console.log(`routes             : ${grouped.size}`)
console.log(`html files         : ${fileCount} (${grouped.size} routes in 2 resolution forms)`)
console.log(`unique titles      : ${titles.size}`)
console.log(`unique canonicals  : ${canonicals.size} (404 excluded by design)`)
console.log(`asset refs checked : ${assetRefs.size} relative, ${absoluteRefs.size} absolute`)
console.log(`body text rendered : ${totalText.toLocaleString()} characters`)

if (failures.length) {
  console.log(`\n${'x'.repeat(60)}\nFAILED (${failures.length})`)
  for (const m of failures) console.log(`  - ${m}`)
  console.log('')
  process.exit(1)
}

console.log(`\n${'='.repeat(60)}\nPASSED - all build output assertions hold\n`)
