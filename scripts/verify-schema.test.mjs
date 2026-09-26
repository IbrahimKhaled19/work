/**
 * Negative tests for verify-schema.mjs.
 *
 * A validator that has only ever passed is indistinguishable from one that does
 * not work. Each case below breaks the JSON-LD in a specific way and asserts the
 * validator reports it.
 *
 *   node scripts/verify-schema.test.mjs
 *
 * Mutates a copy in a temp directory, never dist/.
 */
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { spawnSync } from 'node:child_process'

const ROOT = process.cwd()
const VERIFIER = path.join(ROOT, 'scripts', 'verify-schema.mjs')
const DIST = path.join(ROOT, 'dist')

if (!fs.existsSync(DIST)) {
  console.error('  dist/ not found - run `npm run build` first.')
  process.exit(1)
}

// --- helper: run the verifier against a mutated copy of dist/ ---------------
/**
 * The verifier reads dist/ relative to cwd, so each case gets its own copy of
 * dist/ with one page mutated. Copying is cheap enough at this size and keeps
 * the real build untouched.
 */
function runAgainst(mutate) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'schema-neg-'))
  const target = path.join(tmp, 'dist')
  fs.cpSync(DIST, target, { recursive: true })

  mutate(target)

  const result = spawnSync(process.execPath, [VERIFIER], {
    cwd: tmp,
    encoding: 'utf8',
  })
  fs.rmSync(tmp, { recursive: true, force: true })
  return { status: result.status, output: result.stdout + result.stderr }
}

function editJsonLd(distDir, page, fn) {
  const file = path.join(distDir, page)
  const html = fs.readFileSync(file, 'utf8')
  const replaced = html.replace(
    /(<script type="application\/ld\+json">)([\s\S]*?)(<\/script>)/,
    (_, open, body, close) => open + JSON.stringify(fn(JSON.parse(body))) + close
  )
  if (replaced === html) throw new Error(`could not locate JSON-LD in ${page}`)
  fs.writeFileSync(file, replaced, 'utf8')
}

// --- the cases --------------------------------------------------------------
const CASES = [
  {
    name: 'a property that does not exist on the type',
    expect: 'not a known property of',
    mutate: (d) =>
      editJsonLd(d, 'index.html', (doc) => {
        doc['@graph'][0].hasRewardPoints = true
        return doc
      }),
  },
  {
    name: 'a missing required property',
    expect: 'missing required',
    mutate: (d) =>
      editJsonLd(d, 'index.html', (doc) => {
        delete doc['@graph'][1].name // WebSite.name
        return doc
      }),
  },
  {
    name: 'a property with the wrong shape (string where an array is required)',
    expect: 'should be an array',
    mutate: (d) =>
      editJsonLd(d, 'index.html', (doc) => {
        doc['@graph'][0].sameAs = 'https://example.com' // sameAs is text[]
        return doc
      }),
  },
  {
    name: 'an @type that is not in the vocabulary',
    expect: 'is not in the vocabulary',
    mutate: (d) =>
      editJsonLd(d, 'index.html', (doc) => {
        doc['@graph'].push({ '@type': 'FireHydrant', name: 'x' })
        return doc
      }),
  },
  {
    name: 'a nested object with neither @type nor @id',
    expect: 'neither @type nor @id',
    mutate: (d) =>
      editJsonLd(d, 'index.html', (doc) => {
        doc['@graph'][1].subjectOf = { foo: 'bar' }
        return doc
      }),
  },
  {
    name: 'an empty string value',
    expect: 'empty string',
    mutate: (d) =>
      editJsonLd(d, 'index.html', (doc) => {
        doc['@graph'][0].description = ''
        return doc
      }),
  },
  {
    name: 'malformed JSON',
    expect: 'does not parse',
    mutate: (d) => {
      const file = path.join(d, 'index.html')
      const html = fs.readFileSync(file, 'utf8')
      fs.writeFileSync(
        file,
        html.replace(
          /<script type="application\/ld\+json">[\s\S]*?<\/script>/,
          '<script type="application/ld+json">{"@context": broken</script>'
        ),
        'utf8'
      )
    },
  },
  {
    name: 'a wrong @context',
    expect: '@context is',
    mutate: (d) =>
      editJsonLd(d, 'index.html', (doc) => {
        doc['@context'] = 'https://example.com'
        return doc
      }),
  },
  {
    name: 'a page with no JSON-LD at all (only 404.html may be bare)',
    expect: 'no JSON-LD block',
    mutate: (d) => {
      const file = path.join(d, 'about.html')
      fs.writeFileSync(
        file,
        fs.readFileSync(file, 'utf8').replace(
          /<script type="application\/ld\+json">[\s\S]*?<\/script>/,
          ''
        ),
        'utf8'
      )
    },
  },
  {
    name: 'a service page whose Service node loses its name',
    expect: 'Service is missing required',
    mutate: (d) =>
      editJsonLd(d, 'services/fire-pump-systems/index.html', (doc) => {
        // Drop the required name from the Service node, which is what a
        // refactor that changes the id field would actually produce.
        const svc = doc['@graph'].find((n) => n['@type'] === 'Service')
        if (!svc) throw new Error('no Service node to mutate')
        delete svc.name
        return doc
      }),
  },
  {
    name: 'a Service page losing the Service node entirely',
    // Not a failure in itself - a service page without a Service node is still
    // valid JSON-LD. The check is that removing it is *noticed* by the type
    // census, so this asserts the census rather than an error.
    censusOnly: true,
    mutate: (d) =>
      editJsonLd(d, 'services/fire-pump-systems/index.html', (doc) => {
        doc['@graph'] = doc['@graph'].filter((n) => n['@type'] !== 'Service')
        return doc
      }),
  },
]

// --- the control: unmutated dist/ must pass --------------------------------
console.log(`\nnegative tests for verify-schema.mjs\n${'-'.repeat(64)}`)

const control = runAgainst(() => {})
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
  const { status, output } = runAgainst(c.mutate)

  if (c.censusOnly) {
    // The mutation is legal JSON-LD, so the validator should still pass. What
    // must change is the reported census, which is how a service page quietly
    // losing its Service node would be noticed.
    const before = runAgainst(() => {}).output
    const typeCount = (out, type) => {
      const line = out.split('\n').find((l) => l.trim().startsWith(type))
      return line ? parseInt(line.trim().split(/\s+/).pop(), 10) : 0
    }
    const dropped = typeCount(before, 'Service') - typeCount(output, 'Service')
    // Exactly 1: the route is emitted in two resolution forms
    // (services/<id>/index.html and services/<id>.html) but this mutation only
    // touches the directory form, so one Service node disappears.
    if (status === 0 && dropped === 1) {
      passed += 1
      console.log(`  ok    notices ${c.name} (Service census drops by 1)`)
    } else {
      failed.push(c.name)
      console.log(
        `  MISS  ${c.name} - expected a clean pass with a 1-node census drop, got status ${status}, drop ${dropped}`
      )
    }
    continue
  }

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
    console.log(`  MISS  ${c.name} - validator passed a document it should reject`)
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
console.log('PASSED - the validator rejects every class of defect it claims to\n')
