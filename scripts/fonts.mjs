/**
 * Self-host Montserrat: fetch, subset, vendor, and generate the @font-face CSS.
 *
 *   npm run fonts
 *
 * WHY
 * ---
 * The site loaded Montserrat from Google Fonts:
 *
 *   <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;...">
 *
 * That stylesheet link is render-blocking. It sits in the critical path, so the
 * browser cannot paint until it has been fetched from a third-party origin,
 * parsed, and the fonts it references resolved. Lighthouse measured the cost at
 * 600 ms, and the LCP phase breakdown showed 85% of the LCP as *render delay*
 * on an image that had already finished loading - the page could not draw what
 * it already had.
 *
 * Self-hosting removes the third-party round trip, and declaring the fonts in
 * our own stylesheet removes the blocking request entirely, because
 * scripts/prerender.mjs already inlines the whole stylesheet into every
 * prerendered document. The woff2 files then load via @font-face, which the
 * preload scanner finds in the inlined CSS without a blocking <link>.
 *
 * SUBSETTING, AND WHY THIS IS 2 FILES RATHER THAN 10
 * --------------------------------------------------
 * Montserrat v31 as served by Google Fonts is a VARIABLE font: one file per
 * subset covering the whole 100-900 weight axis, and the separate `wght@400;
 * 600; 700; ...` requests all resolve to the same underlying woff2. Verified
 * by hashing the downloads - montserrat-400-latin.woff2 and
 * montserrat-800-latin.woff2 are byte-identical.
 *
 * Requesting each weight separately therefore downloads the same file five
 * times: 530 KiB of duplicates, of which 4/5 is waste, and the browser would
 * still hold five copies in memory.
 *
 * So the script deduplicates by URL and emits a single @font-face per subset
 * with a `font-weight` RANGE. The browser then instantiates the weights it
 * needs from one file. This is the documented and recommended way to serve
 * Montserrat, and it is also what makes the preload below worthwhile: 37 KiB
 * covers every weight on the page instead of 37 KiB per weight.
 *
 * Google also serves 5 subsets (cyrillic, cyrillic-ext, vietnamese, latin-ext,
 * latin). The site's content is latin-only, verified by scanning every string
 * in src/ for Arabic, Hebrew and CJK codepoints, so only latin and latin-ext
 * are vendored. latin-ext is kept because client and partner names may carry
 * accented characters, and a missing glyph falls back to a different typeface
 * mid-word.
 *
 * The generated CSS is committed rather than built, so the build needs no
 * network access and cannot fail on a Google outage. Re-run this script only
 * when the font or the weight list changes.
 */
import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const FONT_DIR = path.join(ROOT, 'public', 'fonts')
const CSS_OUT = path.join(ROOT, 'src', 'fonts.css')

// A modern desktop UA is required: without it Google serves legacy TTF/EOT
// instead of woff2, which is the whole point of the exercise.
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'

const FAMILY = 'Montserrat'
const WEIGHTS = [400, 600, 700, 800, 900]
const KEEP_SUBSETS = ['latin', 'latin-ext']

// Weights visible in the first screenful, preloaded in index.html.
//   400 - body copy and the hero lead paragraph
//   800 - the h1 and every section heading (index.css sets h1..h6 to 800)
// The other three load on demand as the visitor scrolls.
export const PRELOAD_WEIGHTS = [400, 800]

const CSS_URL =
  `https://fonts.googleapis.com/css2?family=${FAMILY}` +
  `:wght@${WEIGHTS.join(';')}&display=swap`

// --- fetch -----------------------------------------------------------------
console.log(`\nfetching ${CSS_URL}`)
const res = await fetch(CSS_URL, { headers: { 'User-Agent': UA } })
if (!res.ok) {
  console.error(`  HTTP ${res.status} from Google Fonts`)
  process.exit(1)
}
const source = await res.text()

// --- parse -----------------------------------------------------------------
// Each @font-face is preceded by a /* subset */ comment. Parse them in order
// and keep only the subsets this site can actually render.
const blocks = [...source.matchAll(/\/\*\s*([\w-]+)\s*\*\/\s*(@font-face\s*\{[^}]*\})/g)]
if (blocks.length === 0) {
  console.error('  no @font-face blocks found - has the Google Fonts format changed?')
  process.exit(1)
}

const candidates = []
for (const [, subset, face] of blocks) {
  if (!KEEP_SUBSETS.includes(subset)) continue

  const weight = Number(face.match(/font-weight:\s*(\d+)/)?.[1])
  const url = face.match(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+\.woff2)\)/)?.[1]
  const range = face.match(/unicode-range:\s*([^;]+);/)?.[1]?.trim()
  const style = face.match(/font-style:\s*(\w+)/)?.[1] || 'normal'

  if (!weight || !url) continue
  candidates.push({ subset, weight, url, range, style })
}

if (candidates.length === 0) {
  console.error('  no usable woff2 faces - refusing to write an empty fonts.css')
  process.exit(1)
}

// Deduplicate by URL. Every weight of a given subset resolves to the same
// variable-font file, so one entry per URL carries the full weight range.
const byUrl = new Map()
for (const c of candidates) {
  const existing = byUrl.get(c.url)
  if (existing) {
    existing.weights.push(c.weight)
  } else {
    byUrl.set(c.url, { ...c, weights: [c.weight] })
  }
}

const wanted = [...byUrl.values()].map((entry) => ({
  ...entry,
  // The requested weights are the range the browser may instantiate from.
  weightRange: `${Math.min(...entry.weights)} ${Math.max(...entry.weights)}`,
}))

const duplicateCount = candidates.length - wanted.length
if (duplicateCount > 0) {
  console.log(
    `  ${candidates.length} faces collapse to ${wanted.length} unique files ` +
      `(${duplicateCount} duplicate variable-font downloads avoided)`
  )
}

// --- download --------------------------------------------------------------
fs.mkdirSync(FONT_DIR, { recursive: true })

let totalBytes = 0
const downloaded = []

for (const face of wanted) {
  // Named by subset only: one variable font per subset covers every weight.
  const file = `${FAMILY.toLowerCase()}-${face.subset}.woff2`
  const out = path.join(FONT_DIR, file)

  const fontRes = await fetch(face.url)
  if (!fontRes.ok) {
    console.error(`  HTTP ${fontRes.status} for ${face.url}`)
    process.exit(1)
  }
  const bytes = Buffer.from(await fontRes.arrayBuffer())
  fs.writeFileSync(out, bytes)

  totalBytes += bytes.length
  downloaded.push({ ...face, file, bytes: bytes.length })
}

// Remove woff2 files that are no longer in the weight list, so the vendored
// directory cannot accumulate orphans across runs.
for (const existing of fs.readdirSync(FONT_DIR)) {
  if (!existing.endsWith('.woff2')) continue
  if (!downloaded.some((d) => d.file === existing)) {
    fs.unlinkSync(path.join(FONT_DIR, existing))
    console.log(`  removed orphan ${existing}`)
  }
}

// --- generate CSS ----------------------------------------------------------
const css = `/*
 * Self-hosted Montserrat. Generated by scripts/fonts.mjs - do not edit by hand.
 *
 * Declared in the project's own stylesheet rather than loaded from Google,
 * because a third-party stylesheet link is render-blocking. Because
 * scripts/prerender.mjs inlines this file into every prerendered document,
 * the @font-face rules are discovered by the preload scanner with no blocking
 * request at all.
 *
 * One file per subset, not per weight: Montserrat v31 is a variable font, so a
 * single woff2 covers the whole weight axis and the browser instantiates what
 * it needs. The font-weight below is therefore a RANGE. Requesting the five
 * weights separately would download the same file five times.
 *
 * ${downloaded.length} files, ${KEEP_SUBSETS.join(' + ')} subsets, weights ${WEIGHTS.join('/')}.
 * font-display: swap means text paints immediately in the fallback face rather
 * than waiting on a font fetch, so a slow or failed font request costs a brief
 * restyle rather than a blank page.
 */

${downloaded
  .map(
    (d) => `/* ${d.subset} */
@font-face {
  font-family: '${FAMILY}';
  font-style: ${d.style};
  font-weight: ${d.weightRange};
  font-display: swap;
  src: url('/fonts/${d.file}') format('woff2');
  unicode-range: ${d.range};
}`
  )
  .join('\n\n')}
`

fs.writeFileSync(CSS_OUT, css, 'utf8')

// --- report ----------------------------------------------------------------
const pad = (v, n) => String(v).padEnd(n)
const rpad = (v, n) => String(v).padStart(n)

console.log(`\nvendored -> public/fonts/`)
console.log('-'.repeat(64))
console.log(`${pad('file', 30)}${pad('subset', 12)}${pad('weights', 10)}${rpad('bytes', 10)}`)
console.log('-'.repeat(64))
for (const d of downloaded) {
  console.log(
    pad(d.file, 30) + pad(d.subset, 12) + pad(d.weightRange, 10) + rpad(d.bytes.toLocaleString(), 10)
  )
}
console.log('-'.repeat(64))
console.log(
  `${pad(`${downloaded.length} files`, 30)}${pad('', 12)}${pad('', 10)}${rpad(
    (totalBytes / 1024).toFixed(1) + ' KiB',
    10
  )}`
)
console.log(`\nwrote src/fonts.css (${(css.length / 1024).toFixed(1)} KiB)`)
console.log(
  `preload in index.html: ${PRELOAD_WEIGHTS.map((w) => w).join(' and ')} - one file ` +
    `covers all ${WEIGHTS.length} weights\n`
)
