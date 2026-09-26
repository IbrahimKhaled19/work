/**
 * Measure what splitting the services data would actually save.
 *
 *   npm run measure:services
 *
 * Phase 5 Task 5.3 is explicitly gated on measurement rather than effort:
 * `src/data/services.js` is 42 KB of prose imported by Navbar, Footer,
 * Services, Gallery, ServiceDetail AND the SEO layer, so all 13 services'
 * descriptions are in the critical path of every page. The plan's own note is
 * that prose compresses well, so the win should be confirmed before
 * restructuring anything.
 *
 * This measures it three ways, because the answer differs by each:
 *
 *   1. as shipped        - the whole file gzipped, which is what the network
 *                          actually transfers today
 *   2. the light index   - what Navbar and Footer would need if a slim index
 *                          were extracted (id, title, category, short only)
 *   3. the residue       - what would remain in the lazy chunk, for the pages
 *                          that genuinely need the full prose
 *
 * The relevant number is NOT the raw file size. It is the difference between
 * what a visitor downloads to render the first screenful and what they
 * download to render everything, because a visitor who never opens a service
 * detail page should never pay for the prose on it.
 */
import fs from 'node:fs'
import path from 'node:path'
import zlib from 'node:zlib'

const ROOT = process.cwd()
const FILE = path.join(ROOT, 'src', 'data', 'services.js')
const source = fs.readFileSync(FILE, 'utf8')

// Normalise line endings before any structural matching. This file is CRLF in
// the working tree (git core.autocrlf), so every pattern anchored on a bare \n
// silently matched nothing and the measurement reported a confident 0 KiB win.
// That is the worst possible failure mode for a measurement: it looks like a
// result rather than an error.
const sourceNormalized = source.replace(/\r\n/g, '\n')

// --- gzipped size, the number that actually crosses the network ------------
const gz = (s) => zlib.gzipSync(Buffer.from(s, 'utf8'), { level: 9 }).length

// --- what Navbar and Footer actually read ----------------------------------
// Traced from the call sites, not guessed:
//   Navbar.jsx  serviceSections.filter(s => s.category === d.id)  -> category
//               then s.id and s.title for the link
//   Footer.jsx  serviceSections.map(s => ...)                     -> s.id, s.title
//   routeMeta.js serviceMeta()                                    -> title, text
//
// So four keys, not three. `text` is needed because routeMeta.js builds each
// service page's meta description from it, and routeMeta.js is imported by
// Seo.jsx, so it is in the client bundle on every page. Leaving `text` in the
// full module would drag all 13 services' prose back into the critical path
// through the SEO layer even after Navbar and Footer were decoupled.
//
// That is the part that is easy to miss: decoupling the two obvious call sites
// is not sufficient, because the SEO layer reaches the same data.
const STRUCTURAL_KEYS = ['id', 'title', 'category', 'text']

// Enumerated from the source rather than hand-listed, so adding a new prose
// key to a service entry cannot silently escape the measurement.
const PROSE_KEYS = [
  ...new Set([...sourceNormalized.matchAll(/^ {4}([a-zA-Z]+):/gm)].map((m) => m[1])),
].filter((k) => !STRUCTURAL_KEYS.includes(k))

// Build the light index by deleting prose keys from the real source, rather
// than by re-typing the data. That way the measurement cannot drift from the
// data it is measuring.
let light = sourceNormalized
const unmatched = []
for (const key of PROSE_KEYS) {
  // A prose value is a quoted string, or an array/object literal spanning
  // lines that closes at the entry's own indentation. Anchoring the closing
  // delimiter to 4 spaces stops the match running past the end of one entry
  // into the next.
  const re = new RegExp(
    `^ {4}${key}:[ \\t]*(?:'[^']*'|"[^"]*"|\\[[\\s\\S]*?\\n {4}\\],|\\{[\\s\\S]*?\\n {4}\\}),?\\n`,
    'gm'
  )
  const before = light.length
  light = light.replace(re, '')
  if (light.length === before) unmatched.push(key)
}

// Sanity: the light version must still be valid JS and still contain the keys
// the navbar reads. A measurement of a broken artefact is worse than none.
const lightIsValid = light.length > 0 && light.length < sourceNormalized.length
const stillHasTitles = (light.match(/\btitle:/g) || []).length
const originalTitles = (sourceNormalized.match(/\btitle:/g) || []).length

// --- report ----------------------------------------------------------------
const pad = (v, n) => String(v).padEnd(n)
const rpad = (v, n) => String(v).padStart(n)
const kib = (n) => (n / 1024).toFixed(1) + ' KiB'

const rows = [
  {
    label: 'as shipped (all prose)',
    raw: sourceNormalized.length,
    gz: gz(sourceNormalized),
    note: 'what every page downloads today',
  },
  {
    label: 'light index (no prose)',
    raw: light.length,
    gz: gz(light),
    note: 'what Navbar/Footer would need',
  },
  {
    label: 'residue (lazy chunk)',
    raw: sourceNormalized.length - light.length,
    gz: null,
    note: 'loaded only by pages that show the prose',
  },
]

console.log(`\nmeasuring src/data/services.js\n${'-'.repeat(74)}`)
console.log(`${pad('', 26)}${rpad('raw', 10)}${rpad('gzipped', 12)}   note`)
console.log('-'.repeat(74))

for (const r of rows) {
  console.log(
    pad(r.label, 26) + rpad(kib(r.raw), 10) + rpad(r.gz === null ? '-' : kib(r.gz), 12) + '   ' + r.note
  )
}
console.log('-'.repeat(74))

// --- the actual finding ----------------------------------------------------
const gzShipped = gz(source)
const gzLight = gz(light)
const savedGz = gzShipped - gzLight
const pct = (savedGz / gzShipped) * 100

console.log('')
console.log(`  shipped gzipped        ${kib(gzShipped)}`)
console.log(`  light index gzipped    ${kib(gzLight)}`)
console.log(`  avoided per visitor    ${kib(savedGz)}  (${pct.toFixed(1)}%)`)
console.log('')

// --- validity --------------------------------------------------------------
if (unmatched.length) {
  console.log(
    `\n  ERROR: no match for prose key(s): ${unmatched.join(', ')}. ` +
      'The stripping regex and the file disagree, so the numbers below are void.'
  )
  console.log('')
  process.exit(1)
}

if (!lightIsValid) {
  console.log('  ERROR: the stripped variant did not shrink - check the key list.')
  console.log('')
  process.exit(1)
}

if (stillHasTitles !== originalTitles) {
  console.log(
    `  WARNING: title count changed (${originalTitles} -> ${stillHasTitles}). ` +
      'The light index must keep every title, or the navbar would lose links.'
  )
  console.log('')
  process.exit(1)
}

console.log(`  structural keys kept: ${STRUCTURAL_KEYS.join(', ')}`)
console.log(`  prose keys stripped : ${PROSE_KEYS.join(', ')}`)

// --- is it worth it? -------------------------------------------------------
// The judgement the plan asks for. A 1-2 KiB win is not worth restructuring
// five import sites and adding a second module that must stay in sync.
const WORTH_IT_KIB = 4
const verdict = savedGz / 1024 >= WORTH_IT_KIB

console.log('')
console.log(
  verdict
    ? `  VERDICT: worth doing. ${kib(savedGz)} off every page load is above the` +
        `\n           ${WORTH_IT_KIB} KiB threshold for restructuring five call sites.`
    : `  VERDICT: not worth the restructuring. ${kib(savedGz)} is below the` +
        `\n           ${WORTH_IT_KIB} KiB threshold - prose compresses too well for` +
        `\n           this to matter, and a second module would be a sync hazard.`
)
console.log(
  '  Note: routeMeta.js is in the client bundle via Seo.jsx and needs `text`,' +
    '\n        so the light index must keep it - decoupling Navbar/Footer alone' +
    '\n        would not remove the prose from the critical path.'
)
console.log('')
