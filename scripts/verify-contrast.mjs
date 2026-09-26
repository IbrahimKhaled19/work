/**
 * Contrast guard for the design tokens in src/index.css.
 *
 *   npm run verify:contrast
 *
 * WHY THIS EXISTS
 * ---------------
 * Lighthouse found `#cc2643` text on `#e9e9ed` at 4.41:1 where WCAG AA requires
 * 4.5:1 - a failure of 0.09. It was invisible in review because the red reads
 * as "the brand colour" and the surface reads as "a light grey", and nobody
 * computes the ratio by eye. The same token is used as a text colour in 39
 * rules, so the fix had to be in the token rather than in the one class axe
 * happened to flag.
 *
 * WHAT IT CHECKS, AND WHAT IT DOES NOT
 * ------------------------------------
 * This checks a declared list of foreground/background token pairs that are
 * known to occur in the design. It cannot prove that every element on every
 * page has sufficient contrast: resolving an element's effective background
 * through arbitrary nesting is not tractable by static analysis of the
 * stylesheet. So this is a floor, not a ceiling - `npm run audit` (axe via
 * Lighthouse) remains the authority on the rendered pages.
 *
 * The value here is that the floor is enforced at build time and cannot rot
 * silently, and the pair list reads as a specification of the palette's
 * accessibility contract rather than as trivia.
 */
import fs from 'node:fs'
import path from 'node:path'

const CSS = path.join(process.cwd(), 'src', 'index.css')

if (!fs.existsSync(CSS)) {
  console.error(`  ${CSS} not found`)
  process.exit(1)
}

const css = fs.readFileSync(CSS, 'utf8')

// --- read the tokens -------------------------------------------------------
// Values come in two shapes: a literal `#hex`, or `rgb(var(--name-rgb))`
// referring to a space-separated channel triple. The second form exists so the
// translucent tints in the stylesheet (`rgb(var(--red-rgb) / 0.18)`) cannot
// drift away from the solid colour they are tints of. Both must resolve to a
// concrete hex before they can be checked, so this is a real resolver rather
// than a regex.
const raw = new Map()
const rootBlock = css.match(/:root\s*\{([\s\S]*?)\n\}/)
if (!rootBlock) {
  console.error('  no :root block found in src/index.css')
  process.exit(1)
}
for (const line of rootBlock[1].split('\n')) {
  const m = line.match(/^\s*(--[\w-]+)\s*:\s*([^;]+);/)
  if (m) raw.set(m[1], m[2].trim())
}

const tokens = new Map()
const resolving = new Set()

function resolve(name) {
  if (tokens.has(name)) return tokens.get(name)
  if (!raw.has(name)) return null
  if (resolving.has(name)) {
    throw new Error(`circular token reference: ${[...resolving].join(' -> ')} -> ${name}`)
  }
  resolving.add(name)

  const value = raw.get(name)
  let hex = null

  if (/^#[0-9a-fA-F]{3,8}$/.test(value)) {
    hex = value.toLowerCase()
  } else if (/^\d+\s+\d+\s+\d+$/.test(value)) {
    const [r, g, b] = value.split(/\s+/).map(Number)
    hex = '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')
  } else {
    // rgb(var(--x)) or rgb(var(--x) / 0.5) - resolve the inner token.
    const ref = value.match(/^rgb\(\s*var\(\s*(--[\w-]+)\s*\)/)
    if (ref) hex = resolve(ref[1])
  }

  resolving.delete(name)
  if (hex) tokens.set(name, hex)
  return hex
}

// --- contrast maths (WCAG 2.1 relative luminance) --------------------------
const channel = (c) => {
  const v = c / 255
  return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
}
const luminance = (hex) => {
  const n = parseInt(hex.slice(1), 16)
  return (
    0.2126 * channel((n >> 16) & 255) +
    0.7152 * channel((n >> 8) & 255) +
    0.0722 * channel(n & 255)
  )
}
const ratio = (a, b) => {
  const [x, y] = [luminance(a), luminance(b)]
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)
}

// Every pair below is held to the full 4.5:1 for body text. Nothing here is
// claimed as "large text" - the 3:1 allowance is easy to lean on and defeats
// the point of the check.
const AA_TEXT = 4.5

// --- the pairs that occur in the design ------------------------------------
// 'large' is only claimed where the type is >= 24px, or >= 18.66px bold; every
// other pair is held to the full 4.5:1.
const PAIRS = [
  // Body and secondary text on the two light surfaces plus white cards.
  { fg: '--ink', bg: '--bg', where: 'body copy on --bg' },
  { fg: '--ink', bg: '--bg-alt', where: 'body copy on --bg-alt' },
  { fg: '--ink', bg: '#ffffff', where: 'body copy on white cards' },
  { fg: '--ink-soft', bg: '--bg', where: 'paragraphs' },
  { fg: '--ink-soft', bg: '--bg-alt', where: 'paragraphs on --bg-alt' },
  { fg: '--ink-soft', bg: '#ffffff', where: 'paragraphs on white cards' },
  { fg: '--muted', bg: '--bg', where: 'captions, meta' },
  { fg: '--muted', bg: '--bg-alt', where: 'captions on --bg-alt' },
  { fg: '--muted', bg: '#ffffff', where: 'captions on white cards' },

  // The brand red as a text colour - the pair that failed at 4.41.
  { fg: '--red', bg: '--bg', where: 'red text, 39 rules' },
  { fg: '--red', bg: '--bg-alt', where: '.card-link inside the tab panels' },
  { fg: '--red', bg: '#ffffff', where: 'red text on white cards' },

  // Inverted: white text on the red surfaces.
  { fg: '#ffffff', bg: '--red', where: 'white on red buttons/badges' },
  { fg: '#ffffff', bg: '--red-dark', where: 'white on the darker red' },
  { fg: '#ffffff', bg: '--ink', where: 'white on the dark sections' },
]

// --- run -------------------------------------------------------------------
const pad = (v, n) => String(v).padEnd(n)
const rpad = (v, n) => String(v).padStart(n)

const failures = []
const rows = []

for (const { fg, bg, where } of PAIRS) {
  const fgHex = fg.startsWith('#') ? fg : resolve(fg)
  const bgHex = bg.startsWith('#') ? bg : resolve(bg)

  if (!fgHex || !bgHex) {
    failures.push(`${fg} on ${bg}: token not found in :root (${!fgHex ? fg : bg})`)
    continue
  }

  const value = ratio(fgHex, bgHex)
  const pass = value >= AA_TEXT
  if (!pass) failures.push(`${fg} (${fgHex}) on ${bg} (${bgHex}) = ${value.toFixed(2)}:1, needs ${AA_TEXT}:1 - ${where}`)

  rows.push({ fg, bg, fgHex, bgHex, value, pass, where })
}

console.log(`\nverifying contrast in src/index.css\n${'-'.repeat(78)}`)
console.log(`${pad('pair', 30)}${pad('colours', 20)}${rpad('ratio', 8)}${rpad('min', 7)}   where`)
console.log('-'.repeat(78))
for (const row of rows) {
  const colours = `${row.fgHex} on ${row.bgHex}`
  console.log(
    pad(`${row.fg} on ${row.bg}`, 30) +
      pad(colours, 20) +
      rpad(row.value.toFixed(2), 8) +
      rpad(AA_TEXT.toFixed(1), 7) +
      '   ' +
      (row.pass ? '' : 'FAIL  ') +
      row.where
  )
}
console.log('-'.repeat(78))
console.log(
  `${pad(`${rows.length} declared pairs`, 30)}${pad('', 20)}${rpad('', 8)}${rpad('', 7)}   ` +
    `${rows.filter((r) => r.pass).length} pass, ${rows.filter((r) => !r.pass).length} fail`
)
console.log('')

if (failures.length) {
  console.log(`${'x'.repeat(78)}\nFAILED (${failures.length})`)
  for (const m of failures) console.log(`  - ${m}`)
  console.log('')
  process.exit(1)
}

console.log(`${'='.repeat(78)}`)
console.log('PASSED - every declared token pair meets WCAG AA for body text\n')
