/**
 * Negative tests for verify-hours.mjs.
 *
 * verify-hours is the guard that keeps the withdrawn claims - the 24/7
 * availability, the one-hour response promise, the old Mon-Sat 08:00-18:00
 * schedule - from coming back, and that keeps the published hours agreeing
 * with site.js. A guard that has only ever passed is indistinguishable from
 * one that does not work, so each case below publishes one of those defects
 * on purpose and asserts the verifier reports it.
 *
 *   node scripts/verify-hours.test.mjs
 *
 * Mutates a copy in a temp directory, never dist/ or src/.
 */
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { spawnSync } from 'node:child_process'

const ROOT = process.cwd()
const VERIFIER = path.join(ROOT, 'scripts', 'verify-hours.mjs')
const DIST = path.join(ROOT, 'dist')

if (!fs.existsSync(DIST)) {
  console.error('  dist/ not found - run `npm run build` first.')
  process.exit(1)
}

/**
 * Run the verifier against a mutated copy.
 *
 * The verifier reads dist/ AND src/ relative to cwd but imports site.js
 * relative to its own file, so dist- and source-only cases run the real
 * verifier with a temp cwd, and the source cases get a temp copy of scripts/
 * as well - which is what makes the import resolve to the copied site.js
 * rather than the real one.
 */
function runAgainst({ mutateDist, mutateSrc } = {}) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'hours-neg-'))
  fs.cpSync(DIST, path.join(tmp, 'dist'), { recursive: true })
  fs.cpSync(path.join(ROOT, 'src'), path.join(tmp, 'src'), { recursive: true })

  let verifier = VERIFIER
  if (mutateSrc) {
    fs.cpSync(path.join(ROOT, 'scripts'), path.join(tmp, 'scripts'), { recursive: true })
    mutateSrc(tmp)
    verifier = path.join(tmp, 'scripts', 'verify-hours.mjs')
  }
  if (mutateDist) mutateDist(path.join(tmp, 'dist'))

  const result = spawnSync(process.execPath, [verifier], { cwd: tmp, encoding: 'utf8' })
  fs.rmSync(tmp, { recursive: true, force: true })
  return { status: result.status, output: result.stdout + result.stderr }
}

const edit = (distDir, page, fn) => {
  const file = path.join(distDir, page)
  const html = fs.readFileSync(file, 'utf8')
  fs.writeFileSync(file, fn(html), 'utf8')
}

/**
 * Rewrite the openingHoursSpecification inside a page's JSON-LD.
 *
 * Parsed rather than regex-matched: the array contains a nested dayOfWeek
 * array, so a non-greedy `\[...\]` would stop at the wrong bracket. Everything
 * else in the document is left alone, so the only thing that can fail is the
 * comparison against site.hours.
 */
function editHoursSpec(distDir, page, fn) {
  const file = path.join(distDir, page)
  const html = fs.readFileSync(file, 'utf8')
  const replaced = html.replace(
    /(<script type="application\/ld\+json">)([\s\S]*?)(<\/script>)/,
    (m, open, body, close) => {
      const doc = JSON.parse(body)
      const nodes = Array.isArray(doc) ? doc : doc['@graph'] ?? [doc]
      const node = nodes.find((n) => n.openingHoursSpecification)
      if (!node) throw new Error(`no node with openingHoursSpecification in ${page}`)
      node.openingHoursSpecification = fn([].concat(node.openingHoursSpecification))
      return open + JSON.stringify(doc) + close
    }
  )
  if (replaced === html) throw new Error(`could not locate JSON-LD in ${page}`)
  fs.writeFileSync(file, replaced, 'utf8')
}

const CASES = [
  {
    name: 'a withdrawn availability claim on a page',
    expect: 'the withdrawn round-the-clock claim',
    mutateDist: (d) =>
      edit(d, 'about.html', (html) => html.replace('</h1>', '</h1><p>24/7 emergency response</p>')),
  },
  {
    name: 'the withdrawn one-hour response promise',
    expect: 'the withdrawn 1-hour response claim',
    mutateDist: (d) =>
      edit(d, 'contact.html', (html) => html.replace('</h1>', '</h1><p>Reply within one hour</p>')),
  },
  {
    name: 'published JSON-LD hours that disagree with site.js',
    expect: 'JSON-LD opens is "10:00"',
    mutateDist: (d) =>
      editHoursSpec(d, 'index.html', (spec) => {
        spec[0].opens = '10:00'
        return spec
      }),
  },
  {
    name: 'a day list in the JSON-LD that disagrees with site.js',
    expect: 'JSON-LD dayOfWeek is',
    mutateDist: (d) =>
      editHoursSpec(d, 'index.html', (spec) => {
        // Thursday dropped: six days in the source, five in the markup.
        spec[0].dayOfWeek = spec[0].dayOfWeek.filter((day) => day !== 'Thursday')
        return spec
      }),
  },
  {
    name: 'a component hardcoding the old schedule back into the source',
    expect: 'a hardcoded day range',
    mutateSrc: (tmp) => {
      // Injected as code, not as a comment: the source pass deliberately skips
      // comments so that documenting a withdrawn value is not a failure.
      const file = path.join(tmp, 'src', 'pages', 'Contact.jsx')
      fs.appendFileSync(file, `\nconst OLD_HOURS = 'Mon-Sat 08:00-18:00'\n`, 'utf8')
    },
  },
]

// --- the control: unmutated dist/ must pass --------------------------------
console.log(`\nnegative tests for verify-hours.mjs\n${'-'.repeat(64)}`)

const control = runAgainst()
const controlOk = control.status === 0
console.log(`  ${controlOk ? 'ok  ' : 'FAIL'} control: unmutated dist/ passes`)
if (!controlOk) {
  console.log(control.output.split('\n').slice(0, 20).join('\n'))
  process.exit(1)
}

// --- run the cases ---------------------------------------------------------
let passed = 0
const failed = []

for (const c of CASES) {
  const { status, output } = runAgainst(c)
  const detected = status !== 0
  const messageSeen = output.includes(c.expect)

  if (detected && messageSeen) {
    passed += 1
    console.log(`  ok    catches ${c.name}`)
  } else if (detected) {
    passed += 1
    console.log(`  ok    catches ${c.name}  (different wording than expected)`)
  } else {
    failed.push(c.name)
    console.log(`  MISS  ${c.name} - the verifier passed a build it should reject`)
  }
}

console.log('-'.repeat(64))
console.log(`  ${passed}/${CASES.length} negative cases caught`)
console.log('')

if (failed.length) {
  console.log(`  MISSED: ${failed.join(', ')}`)
  console.log('')
  process.exit(1)
}

console.log(`${'='.repeat(64)}`)
console.log('PASSED - the hours guard rejects every defect it claims to catch\n')
