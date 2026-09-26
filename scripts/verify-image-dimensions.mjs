/**
 * Assert that every `<img>` in the built site declares explicit dimensions.
 *
 *   npm run verify:image-dimensions
 *
 * WHY THIS EXISTS
 * ---------------
 * Lighthouse has an audit for exactly this - `unsized-images`, "Image elements
 * have explicit `width` and `height`" - and it is right. But it is weight 0 in
 * the performance category, so it cannot move a category score, and
 * `audit:all` gates on category scores alone (scripts/audit-all.mjs). An image
 * that loses its dimensions on one route therefore passes the entire audit
 * suite while producing the failure the audit exists to catch: the page
 * reflowing when the image finally loads.
 *
 * CLS is already asserted at 0 on every route, so this is not closing an open
 * hole - it is the second line of defence for the case the shift is too small
 * to register, and for the route nobody re-audits after a template change.
 *
 * WHY dist/ AND NOT src/
 * ----------------------
 * dist/ is the bytes that ship. Checking it covers all 19 routes and both
 * resolution forms in one pass, needs no browser, and cannot be fooled by a
 * component that is never rendered. Lighthouse can only see one route per run
 * and only after hydration, which is why this class of defect is easy to miss.
 */
import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const DIST = path.join(ROOT, 'dist')

if (!fs.existsSync(path.join(DIST, 'index.html'))) {
  console.error('  dist/ not found - run `npm run build` first.')
  process.exit(1)
}

/**
 * Collapse the two resolution forms to one route.
 *
 *   about.html        -> about
 *   about/index.html  -> about
 *   index.html        -> /
 *   404.html          -> 404
 *
 * Each route is written twice on purpose (see src/routes.manifest.js), so
 * without this every image would be counted and reported twice.
 */
function routeKey(rel) {
  const s = rel.replace(/\\/g, '/').replace(/\/?index\.html$/, '').replace(/\.html$/, '')
  return s || '/'
}

function htmlFiles(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name)
    if (fs.statSync(p).isDirectory()) htmlFiles(p, out)
    else if (name.endsWith('.html')) out.push(p)
  }
  return out
}

// A floor, so this guard cannot pass by matching nothing. If a prerender or
// markup change ever stopped emitting images, "0 offenders" would be a silent
// pass over a check that had stopped checking anything. Measured: 47 images
// across 20 pages, so the floor sits well below the real count.
const MIN_IMAGES = 20

const failures = []
const perRoute = new Map()
let imageCount = 0
let lazyCount = 0

for (const file of htmlFiles(DIST)) {
  const route = routeKey(path.relative(DIST, file))
  if (perRoute.has(route)) continue

  const html = fs.readFileSync(file, 'utf8')
  let total = 0
  let unsized = 0

  for (const m of html.matchAll(/<img\b[^>]*>/gi)) {
    const tag = m[0]
    imageCount++
    total++
    if (/\sloading=["']lazy["']/i.test(tag)) lazyCount++

    const hasWidth = /\swidth=["']?\d+/i.test(tag)
    const hasHeight = /\sheight=["']?\d+/i.test(tag)
    if (hasWidth && hasHeight) continue

    unsized++
    const src = (tag.match(/\ssrc=["']([^"']+)["']/i) || [])[1] || '(no src)'
    const missing = [hasWidth ? null : 'width', hasHeight ? null : 'height']
      .filter(Boolean)
      .join(' + ')
    failures.push(
      `${route}: <img src="${src}"> is missing ${missing}. ` +
        'It will reflow the page when it loads. Give it explicit width and height.'
    )
  }

  perRoute.set(route, { total, unsized })
}

// --- report ----------------------------------------------------------------
const pad = (v, n) => String(v).padEnd(n)

console.log(`\nverifying image dimensions\n${'-'.repeat(64)}`)
console.log(`${pad('page', 34)}${pad('images', 8)}unsized`)
console.log('-'.repeat(64))
for (const [route, { total, unsized }] of [...perRoute].sort(([a], [b]) => a.localeCompare(b))) {
  console.log(pad(route, 34) + pad(total, 8) + (unsized ? `${unsized} unsized` : 'ok'))
}
console.log('-'.repeat(64))
console.log(
  `${perRoute.size} pages, ${imageCount} images (${lazyCount} lazy-loaded), ` +
    `${failures.length} without explicit dimensions`
)
console.log('')

if (imageCount < MIN_IMAGES) {
  failures.push(
    `only ${imageCount} images found across ${perRoute.size} pages, expected at least ` +
      `${MIN_IMAGES}. The check may have stopped matching - investigate before trusting a pass.`
  )
}

if (failures.length) {
  console.log(`${'x'.repeat(64)}\nFAILED (${failures.length})`)
  for (const f of failures) console.log(`  - ${f}`)
  console.log('')
  process.exit(1)
}

console.log(`${'='.repeat(64)}`)
console.log(
  'PASSED - every image declares width and height, so no image can cause a layout shift\n'
)
