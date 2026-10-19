/**
 * Assert the service taxonomy's shape, and that its consumers derive from it.
 *
 *   npm run verify:taxonomy
 *
 * WHY THIS EXISTS
 * ---------------
 * `src/data/services.js` holds the one authoritative `category` per service.
 * ServicesTabs and Home used to re-state that taxonomy by hand; both now read
 * `serviceIndex`, so this check is structural: it proves they derive, and it
 * checks the data itself.
 *
 * A copied taxonomy is a second source of truth with no compiler. The failure
 * mode is silent and user-visible: reclassifying a service in services.js moves
 * it in the navbar dropdown and changes the eyebrow on its detail page - both
 * derived - while /services keeps showing the old grouping. A visitor comparing
 * the navbar against the services page sees two different taxonomies on one
 * site. Nothing fails: the build succeeds, the pages are non-empty and titles
 * are unique.
 */
import fs from 'node:fs'
import path from 'node:path'
import { failures, pad, finish } from './lib/verify.mjs'

const ROOT = process.cwd()

const read = (...p) => fs.readFileSync(path.join(ROOT, ...p), 'utf8')

// --- 1. the source of truth -------------------------------------------------
// Split the serviceSections array into object chunks and read id + category
// from each. A formatting change that breaks this produces zero services, which
// the floor below turns into a loud failure rather than a vacuous pass.
const servicesSrc = read('src', 'data', 'services.js')
const sectionsBlock = servicesSrc.slice(
  servicesSrc.indexOf('export const serviceSections = [')
)

const categories = new Map()
for (const chunk of sectionsBlock.split(/\n {2}\{/).slice(1)) {
  const id = chunk.match(/\bid:\s*'([^']+)'/)?.[1]
  const category = chunk.match(/\bcategory:\s*'([^']+)'/)?.[1]
  if (id && category) categories.set(id, category)
}

const disciplineIds = new Set(
  [...servicesSrc.matchAll(/\{\s*id:\s*'([a-z-]+)',\s*label:/g)].map((m) => m[1])
)

// --- 2. The components that render the taxonomy -----------------------------
// Both derive the catalogue from serviceIndex at runtime, so there is no list
// here to parse. What is worth asserting is structural - that they really do
// derive, because a hardcoded number is exactly the failure that let the
// homepage claim 13 services while the careers page counted them.
const tabsSrc = read('src', 'components', 'ServicesTabs.jsx')
if (!/import\s*\{[^}]*\bserviceIndex\b[^}]*\}/.test(tabsSrc)) {
  failures.push(
    'ServicesTabs.jsx does not import serviceIndex - the tabs must be derived from the ' +
      'taxonomy. A hand-copied list is a second source of truth.'
  )
}
if (/\banchor:\s*'/.test(tabsSrc)) {
  failures.push(
    'ServicesTabs.jsx still carries hand-written anchor entries - remove them and read ' +
      'the ids from serviceIndex.'
  )
}

const homeSrc = read('src', 'pages', 'Home.jsx')
if (!/\bserviceIndex\b/.test(homeSrc)) {
  failures.push(
    'Home.jsx does not reference serviceIndex - the "Services Under One Roof" figure must ' +
      'be counted from the taxonomy, not typed in.'
  )
}
const hardcodedStat = homeSrc.match(
  /target:\s*(\d+)\s*,\s*suffix:\s*''\s*,\s*label:\s*'Services Under One Roof'/
)
if (hardcodedStat) {
  failures.push(
    `Home.jsx hardcodes the service count as ${hardcodedStat[1]}. Count serviceIndex ` +
      'instead, so a new service moves the number on its own.'
  )
}

// --- report ----------------------------------------------------------------

console.log(`\nverifying service taxonomy\n${'-'.repeat(64)}`)
console.log(`${pad('service', 34)}discipline`)
console.log('-'.repeat(64))

// Every service is in the catalogue and the tabs render that catalogue, so
// membership is a property of the data rather than of a copied list. What is
// still worth printing is the grouping each service lands under.
for (const [id, category] of categories) {
  console.log(pad(id, 34) + category)
}

// Group ids are a closed set: they are labels with a fixed vocabulary, and a
// typo produces a tab nobody can select rather than an error.
for (const g of new Set(categories.values())) {
  if (g && !disciplineIds.has(g)) {
    failures.push(`"${g}" is used as a category but is not a declared discipline.`)
  }
}

// A discipline with no services renders an empty tab and an empty dropdown
// section. Reclassifying the last service out of a discipline causes it.
for (const d of disciplineIds) {
  const n = [...categories.values()].filter((c) => c === d).length
  if (n === 0) failures.push(`discipline "${d}" has no services, so its tab would render empty.`)
}

console.log('-'.repeat(64))
console.log(
  `${categories.size} services across ${disciplineIds.size} disciplines, ` +
    `${failures.length} disagreements\n`
)

// A floor, so a parser that stops matching fails loudly instead of passing a
// check that has stopped checking anything.
if (categories.size < 13 || disciplineIds.size < 4) {
  failures.push(
    `parsed ${categories.size} services and ${disciplineIds.size} disciplines - ` +
      'expected at least 13/4. A file shape changed; re-check the parsing before ' +
      'trusting this result.'
  )
}

finish('services.js, ServicesTabs and the homepage count agree')
