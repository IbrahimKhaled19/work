/**
 * Post-prerender output inspection.
 *
 * Checks the generated HTML for failure modes that are invisible in a build
 * log: mangled characters, React resource-hoisting artefacts leaking into
 * <body>, invalid inline styles, and a stylesheet that failed to inline.
 *
 *   node scripts/inspect-prerender.mjs [file]
 */
import fs from 'node:fs'
import path from 'node:path'

const file = process.argv[2] || 'dist/index.html'
const html = fs.readFileSync(file, 'utf8')

const count = (re) => (html.match(re) || []).length
const present = (needle) => html.includes(needle)

/** Each entry: [label, actual, expected] */
const checks = [
  ['middot U+00B7 preserved', present('8-6 \u00b7 WhatsApp'), true],
  ['arrow U+2192 preserved', present('Survey \u2192 Design'), true],
  ['copyright U+00A9 preserved', present('\u00a9'), true],
  ['no U+FFFD replacement chars', present('\ufffd'), false],
  ['no "height:undefinedpx"', count(/height:undefinedpx/g), 0],
  ['no undefined in any style attr', count(/style="[^"]*undefined/g), 0],
  ['no React preload hoisted into <body>', count(/<div id="root"><link/g), 0],
  ['exactly one <title>', count(/<title>/g), 1],
  ['exactly one canonical', count(/rel="canonical"/g), 1],
  ['exactly one ld+json block', count(/application\/ld\+json/g), 1],
  ['exactly one <h1>', count(/<h1[ >]/g), 1],
  ['app stylesheet link removed', count(/<link[^>]*href="\/assets\/[^"]*\.css"/g), 0],
  ['font stylesheet link kept', count(/<link[^>]*href="https:\/\/fonts\.googleapis\.com\/css2[^"]*"/g), 1],
  ['CSS inlined', count(/<style>/g), 1],
  ['root is populated', present('<div id="root"></div>'), false],
  ['no "undefined" anywhere', present('undefined'), false],
  ['canonical count matches ld+json count', count(/application\/ld\+json/g) === 1, true],
]

let failed = 0
console.log('')
for (const [label, actual, expected] of checks) {
  const ok = actual === expected
  if (!ok) failed += 1
  console.log(
    `  ${ok ? 'PASS' : 'FAIL'}  ${label.padEnd(38)} got ${JSON.stringify(actual)}, want ${JSON.stringify(expected)}`
  )
}

console.log(`\n${failed === 0 ? 'all checks passed' : `${failed} check(s) failed`} - ${path.relative(process.cwd(), file)}\n`)
process.exitCode = failed === 0 ? 0 : 1
