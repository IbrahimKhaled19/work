/**
 * Assert the published opening hours are single-sourced and correct, and that
 * no withdrawn availability claim is still published.
 *
 *   npm run verify:hours
 *
 * SCOPE, and why it is wider than the name
 * ----------------------------------------
 * The name says hours because the single-source assertion is the substantive
 * part. It also owns the list of withdrawn claims, because they are the same
 * failure seen from the other side: a commitment the business has backed out
 * of, still printed on a page. Currently that list is the one-hour response
 * promise, the round-the-clock / 24-7 availability claim, the previous
 * Mon-Sat 08:00-18:00 schedule, and the "monthly inspections" phrasing. All
 * four were removed by hand across a dozen files.
 *
 * WHY THE HOURS EXISTED IN SIX PLACES
 * -----------------------------------
 * src/seo/site.js declared them as the intended single source, but nothing
 * read that block, so jsonld.js hardcoded its own dayOfWeek list and
 * opens/closes, and Home, Contact, Footer, CTA, About and Gallery each
 * hardcoded a prose copy. Changing the hours meant finding all six by hand,
 * and missing one failed nothing - it just published a contradiction.
 *
 * That matters more than a normal duplicate. The JSON-LD copy is what Google
 * reads for local results, so a stale openingHoursSpecification misreports
 * when the business is open, and no other check in this repo looks at it.
 *
 * All six now derive from site.hours, so this guard is mostly a brake on that
 * being undone.
 *
 * It checks dist/ as well as src/. dist/ is the ground truth - it is what
 * ships, and it is what Google reads - but scanning only dist meant a
 * regression in a component went unnoticed until the next build, which is
 * exactly the window where it is cheapest to catch. The source pass skips
 * comments: a guard that fails because someone documented the old value in a
 * comment is a guard people learn to disable, which is worse than none.
 */
import fs from 'node:fs'
import path from 'node:path'

import site from '../src/seo/site.js'

const ROOT = process.cwd()
const DIST = path.join(ROOT, 'dist')
const failures = []

// --- 1. the source is internally coherent ---------------------------------
const { hours } = site

if (!hours || typeof hours !== 'object') {
  failures.push('site.hours is missing - it is the single source for the hours')
} else {
  const days = hours.days?.long
  if (!Array.isArray(days) || days.length === 0) {
    failures.push('site.hours.days.long is missing or empty')
  } else {
    // The published range is Saturday to Thursday, which is six consecutive
    // days ending Thursday. Asserted rather than trusted, because a wrong
    // day list here propagates straight into the structured data.
    const expected = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday']
    if (JSON.stringify(days) !== JSON.stringify(expected)) {
      failures.push(
        `site.hours.days.long is ${JSON.stringify(days)}, expected ${JSON.stringify(expected)}`
      )
    }
  }

  if (hours.days?.schema !== 'Sa-Th') {
    failures.push(`site.hours.days.schema is "${hours.days?.schema}", expected "Sa-Th"`)
  }

  for (const key of ['opens', 'closes']) {
    const v = hours[key]
    if (!/^\d{2}:\d{2}$/.test(v ?? '')) {
      failures.push(`site.hours.${key} is "${v}", expected HH:MM`)
    } else if (Number(v.slice(0, 2)) > 23 || Number(v.slice(3)) > 59) {
      failures.push(`site.hours.${key} is "${v}", which is not a real time`)
    }
  }

  if (/^\d{2}:\d{2}$/.test(hours.opens ?? '') && /^\d{2}:\d{2}$/.test(hours.closes ?? '')) {
    if (hours.opens >= hours.closes) {
      failures.push(`site.hours opens (${hours.opens}) at or after it closes (${hours.closes})`)
    }
  }

  for (const key of ['display', 'inline', 'short']) {
    if (!hours[key]) failures.push(`site.hours.${key} is missing - a component renders it`)
  }
}

// --- 2. the published JSON-LD agrees with the source -----------------------
// Redundant while jsonld.js derives from site.hours, which is the point: it
// fails the moment someone hardcodes a day list or a time back into the
// structured data.
if (!fs.existsSync(path.join(DIST, 'index.html'))) {
  console.error('  dist/ not found - run `npm run build` first.')
  process.exit(1)
}

const indexHtml = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8')
let ldNodes = []
for (const m of indexHtml.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
  try {
    const parsed = JSON.parse(m[1])
    ldNodes = ldNodes.concat(Array.isArray(parsed) ? parsed : parsed['@graph'] ?? [parsed])
  } catch {
    failures.push('a JSON-LD block in dist/index.html is not valid JSON')
  }
}

const withHours = ldNodes.filter((n) => n.openingHoursSpecification)
if (withHours.length === 0) {
  failures.push('no JSON-LD node publishes openingHoursSpecification - the hours are not machine-readable')
} else {
  for (const node of withHours) {
    for (const spec of [].concat(node.openingHoursSpecification)) {
      if (JSON.stringify(spec.dayOfWeek) !== JSON.stringify(hours.days?.long)) {
        failures.push(
          `JSON-LD dayOfWeek is ${JSON.stringify(spec.dayOfWeek)}, ` +
            `but site.hours.days.long is ${JSON.stringify(hours.days?.long)}`
        )
      }
      if (spec.opens !== hours.opens) {
        failures.push(`JSON-LD opens is "${spec.opens}", but site.hours.opens is "${hours.opens}"`)
      }
      if (spec.closes !== hours.closes) {
        failures.push(`JSON-LD closes is "${spec.closes}", but site.hours.closes is "${hours.closes}"`)
      }
    }
  }
}

// --- 3. nothing withdrawn or stale is still published ----------------------
// The response-time claim and the previous weekday range were both removed by
// hand across six files. A comment explaining the removal is fine and is not
// checked here, because this reads dist, which has no comments.
const BANNED = [
  ['the withdrawn 1-hour response claim', /\b(?:1|one)\s+hour\b/i],
  ['the withdrawn round-the-clock claim', /24\s*[-/]\s*7\b/i],
  ['the withdrawn "round-the-clock" claim', /round[-\s]the[-\s]clock/i],
  ['the previous Mon-Sat range', /Mon[-\u2013]Sat/i],
  ['the previous Schema.org Mon-Sat code', /Mo-Sa\b/],
  ['the previous 8:00 AM opening', /\b8:00\s*AM\b/i],
  ['the previous 6:00 PM closing', /\b6:00\s*PM\b/i],
  ['the previous 08:00 opening', /\b08:00\b/],
  ['the previous 18:00 closing', /\b18:00\b/],
  ['the withdrawn "monthly inspections" phrase', /monthly inspections/i],
]

function htmlFiles(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name)
    if (fs.statSync(p).isDirectory()) htmlFiles(p, out)
    else if (name.endsWith('.html')) out.push(p)
  }
  return out
}

const files = htmlFiles(DIST)
let scannedChars = 0
for (const file of files) {
  // The head carries the same hours in the JSON-LD and the meta tags, so the
  // whole document is scanned, not just the body.
  const text = fs.readFileSync(file, 'utf8')
  scannedChars += text.length
  for (const [label, re] of BANNED) {
    const m = text.match(re)
    if (m) {
      failures.push(
        `${path.relative(DIST, file).replace(/\\/g, '/')} still contains ${label}: "${m[0]}"`
      )
    }
  }
}

// --- 4. and nothing hardcoded them back into the source -------------------
// A component that writes the hours out in full is the original defect. The
// day and time values are checked here rather than the prose forms, because
// the prose forms legitimately vary in punctuation between call sites.
const SOURCE_BANNED = [
  ['a hardcoded day range', /Mon[-\u2013]Sat|Mo-Sa\b|Sat[-\u2013]Thu|Sa-Th\b/],
  ['a hardcoded opening time', /\b0?8:00\b/],
  ['a hardcoded closing time', /\b18:00\b|\b6:00\s*PM\b/i],
  ['a hardcoded hours label', /8:00\s*AM/i],
  ['the withdrawn response claim', /\b(?:1|one)\s+hour\b/i],
  ['the withdrawn round-the-clock claim', /24\s*[-/]\s*7\b/i],
  ['the withdrawn "round-the-clock" claim', /round[-\s]the[-\s]clock/i],
  ['the withdrawn "monthly inspections" phrase', /monthly inspections/i],
]

function sourceFiles(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name)
    if (fs.statSync(p).isDirectory()) sourceFiles(p, out)
    else if (/\.(js|jsx)$/.test(name)) out.push(p)
  }
  return out
}

/**
 * Blank out comment content, preserving line structure.
 *
 * Needed because a guard that fires on someone documenting the old value in a
 * comment is a guard people learn to disable. A line-prefix test is not enough
 * for this codebase: comments appear as `//`, `/* *\/`, and JSX `{/* *\/}`,
 * and the last of those does not start its line with a marker. It also has to
 * be string-aware, because `https://wa.me/...` contains `//` that is not a
 * comment and would otherwise swallow the rest of the line.
 *
 * Not a full parser: a `//` inside a template literal's expression would be
 * treated as a comment. That can only cause a miss, never a false failure, and
 * the dist/ pass would still catch the result.
 */
function stripComments(src) {
  const out = []
  let i = 0
  let quote = null
  const n = src.length
  while (i < n) {
    const c = src[i]
    const next = src[i + 1]
    if (quote) {
      if (c === '\\') {
        out.push('  ')
        i += 2
        continue
      }
      out.push(c)
      if (c === quote) quote = null
      i++
      continue
    }
    if (c === '/' && next === '/') {
      while (i < n && src[i] !== '\n') {
        out.push(' ')
        i++
      }
      continue
    }
    if (c === '/' && next === '*') {
      while (i < n && !(src[i] === '*' && src[i + 1] === '/')) {
        out.push(src[i] === '\n' ? '\n' : ' ')
        i++
      }
      out.push('  ')
      i += 2
      continue
    }
    if (c === '"' || c === "'" || c === '`') {
      quote = c
    }
    out.push(c)
    i++
  }
  return out.join('')
}

// site.js holds the values themselves, so it is exempt from the pass below.
// The structural checks above already assert they are the correct ones.
const SSOT = path.join(ROOT, 'src', 'seo', 'site.js')

let sourceCount = 0
for (const file of sourceFiles(path.join(ROOT, 'src'))) {
  if (path.resolve(file) === path.resolve(SSOT)) continue
  sourceCount++
  stripComments(fs.readFileSync(file, 'utf8'))
    .split('\n')
    .forEach((line, i) => {
      for (const [label, re] of SOURCE_BANNED) {
        const m = line.match(re)
        if (m) {
          failures.push(
            `${path.relative(ROOT, file).replace(/\\/g, '/')}:${i + 1} hardcodes ${label} ` +
              `("${m[0]}") - import it from site.hours instead`
          )
        }
      }
    })
}

// Floors, so this cannot pass by matching nothing.
if (files.length < 30) {
  failures.push(`only ${files.length} built pages found, expected at least 30 - the scan may be broken`)
}
if (scannedChars < 500_000) {
  failures.push(`only ${scannedChars} characters scanned, expected at least 500,000`)
}
if (sourceCount < 20) {
  failures.push(`only ${sourceCount} source files scanned, expected at least 20 - the scan may be broken`)
}

// --- report ----------------------------------------------------------------
const pad = (v, n) => String(v).padEnd(n)

console.log(`\nverifying opening hours\n${'-'.repeat(64)}`)
console.log(`${pad('source', 14)}${site.hours.days?.schema}  ${hours.opens}-${hours.closes}`)
console.log(`${pad('display', 14)}${hours.display}`)
console.log(`${pad('inline', 14)}${hours.inline}`)
console.log(`${pad('short', 14)}${hours.short}`)
console.log('-'.repeat(64))
console.log(`${files.length} built pages scanned, ${scannedChars.toLocaleString()} characters`)
console.log(`${sourceCount} source files scanned for hardcoded hours`)
console.log('')

if (failures.length) {
  console.log(`${'x'.repeat(64)}\nFAILED (${failures.length})`)
  for (const f of [...new Set(failures)]) console.log(`  - ${f}`)
  console.log('')
  process.exit(1)
}

console.log('='.repeat(64))
console.log(
  'PASSED - the hours have one source, the JSON-LD agrees with it, and no withdrawn claim is published\n'
)