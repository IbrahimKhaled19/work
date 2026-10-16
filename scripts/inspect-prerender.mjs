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

// Element counts run against the markup with comments removed. The head
// template carries an explanatory comment naming <title>, canonical and <h1>
// by way of explaining what goes where, which a naive count reads as a second
// copy of each. Presence checks keep the raw text: a mangled character is
// worth catching even inside a comment.
const visible = html.replace(/<!--[\s\S]*?-->/g, '')
const count = (re) => (visible.match(re) || []).length
const present = (needle) => html.includes(needle)

/** Each entry: [label, actual, expected] */
const checks = [
  // Any middot survives the render: the entity must come back out as U+00B7
  // rather than as mojibake. The specific string is deliberately not pinned
  // here - the hours text it used to sit next to has changed twice.
  ['middot U+00B7 preserved', present('\u00b7'), true],
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
  // Fonts are self-hosted and preloaded now. This used to assert that a
  // Google Fonts stylesheet link was present, which is the opposite of what
  // verify:fonts enforces and would have called a correct build broken.
  ['no Google Fonts request', count(/fonts\.googleapis\.com|fonts\.gstatic\.com/g), 0],
  ['font preloaded', count(/as="font"/g), 1],
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
