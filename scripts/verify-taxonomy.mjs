/**
 * Assert that every hand-copied rendering of the service taxonomy agrees with
 * the single source of truth.
 *
 *   npm run verify:taxonomy
 *
 * WHY THIS EXISTS
 * ---------------
 * `src/data/services.js` holds the one authoritative `category` per service.
 * Three other files re-state that taxonomy by hand:
 *
 *   ServicesTabs.jsx   the discipline groups on /services
 *   Gallery.jsx        a `group` per project, using the same discipline ids
 *   Navbar.jsx         derives from `category` - correct by construction
 *
 * Deriving is cheap for one consumer and gets abandoned the moment a second
 * consumer needs different copy, which is exactly what happened twice: the
 * tabs carry tab-specific descriptions and the gallery carries project
 * titles, so both were copied rather than derived. A copied taxonomy is a
 * second source of truth with no compiler.
 *
 * The failure mode is silent and user-visible. Reclassifying a service in
 * services.js moves it in the navbar dropdown and changes the eyebrow on its
 * detail page - both derived - while /services and /gallery keep showing the
 * old grouping. A visitor comparing the navbar against the services page sees
 * two different taxonomies on one site. Nothing fails: the build succeeds, the
 * pages are non-empty, titles are unique, and all eleven other checks pass,
 * because none of them read these files.
 *
 * So they are compared directly. Changing a category is then a three-file edit
 * and the fourth file is a build error rather than a contradiction.
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
// Neither ServicesTabs nor Home hand-copies the catalogue any more: both derive
// it from serviceIndex at runtime, so there is nothing here to parse and nothing
// here to fall out of step. What is left to assert is structural - that they
// really do derive, because a hardcoded number is exactly the failure that let
// the homepage claim 13 services while the careers page counted them.
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

// --- 3. Gallery.jsx ---------------------------------------------------------
const gallerySrc = read('src', 'pages', 'Gallery.jsx')
const galleryGroups = []
for (const line of gallerySrc.split('\n')) {
  const serviceId = line.match(/\bserviceId:\s*'([^']+)'/)?.[1]
  if (!serviceId) continue
  const group = line.match(/\bgroup:\s*'([^']+)'/)?.[1]
  galleryGroups.push({ serviceId, group })
}

// --- report ----------------------------------------------------------------

console.log(`\nverifying service taxonomy\n${'-'.repeat(64)}`)
console.log(`${pad('service', 34)}${pad('discipline', 12)}gallery`)
console.log('-'.repeat(64))

// Every service is in the catalogue and the tabs now render that catalogue, so
// membership is a property of the data rather than of a copied list. What is
// still worth printing is the grouping each service lands under.
for (const [id, category] of categories) {
  const gallery = galleryGroups.find((g) => g.serviceId === id)
  console.log(pad(id, 34) + pad(category, 12) + (gallery ? gallery.group : '-'))
}

for (const { serviceId, group } of galleryGroups) {
  if (!categories.has(serviceId)) {
    failures.push(`Gallery.jsx points at unknown service "${serviceId}".`)
    continue
  }
  if (group !== categories.get(serviceId)) {
    failures.push(
      `${serviceId}: services.js says "${categories.get(serviceId)}" but Gallery.jsx ` +
        `groups it under "${group}". The same project would appear in two filter tabs.`
    )
  }
}

// Group ids are a closed set: they are labels with a fixed vocabulary, and a
// typo produces a filter nobody can select rather than an error.
const usedGroups = new Set([
  ...categories.values(),
  ...galleryGroups.map((g) => g.group),
])
for (const g of usedGroups) {
  if (g && !disciplineIds.has(g)) {
    failures.push(`"${g}" is used as a group but is not a declared discipline.`)
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
  `${categories.size} services, all rendered from the taxonomy by ServicesTabs and Home, ` +
    `${galleryGroups.length} gallery projects, ${failures.length} disagreements\n`
)

// A floor, so a parser that stops matching fails loudly instead of passing a
// check that has stopped checking anything.
if (categories.size < 13 || disciplineIds.size < 4 || galleryGroups.length < 13) {
  failures.push(
    `parsed ${categories.size} services, ${disciplineIds.size} disciplines and ` +
      `${galleryGroups.length} gallery rows - expected at least 13/4/13. A file shape ` +
      'changed; re-check the parsing before trusting this result.'
  )
}

finish('services.js, the tabs, the homepage count and the gallery filters agree')
