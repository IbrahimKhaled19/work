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

const ROOT = process.cwd()
const failures = []

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

// --- 2. ServicesTabs.jsx ---------------------------------------------------
// Only group objects carry an `id`; the service entries carry `anchor`. So
// scanning for both and pairing each anchor with the most recent id is exact
// for this file's structure, and a structural change surfaces as a mismatch.
const tabsSrc = read('src', 'components', 'ServicesTabs.jsx')
const tabGroups = new Map()
let currentGroup = null
for (const m of tabsSrc.matchAll(/\bid:\s*'([^']+)'|anchor:\s*'([^']+)'/g)) {
  if (m[1]) currentGroup = m[1]
  else if (m[2]) {
    if (!tabGroups.has(m[2])) tabGroups.set(m[2], [])
    tabGroups.get(m[2]).push(currentGroup)
  }
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
const pad = (v, n) => String(v).padEnd(n)

console.log(`\nverifying service taxonomy\n${'-'.repeat(64)}`)
console.log(`${pad('service', 34)}${pad('source', 12)}${pad('tabs', 12)}gallery`)
console.log('-'.repeat(64))

for (const [id, category] of categories) {
  const claimed = tabGroups.get(id)
  if (!claimed) {
    failures.push(`${id}: absent from ServicesTabs.jsx - it would vanish from the /services tabs.`)
  } else if (claimed.length > 1) {
    failures.push(`${id}: listed in ${claimed.length} ServicesTabs groups (${claimed.join(', ')}).`)
  } else if (claimed[0] !== category) {
    failures.push(
      `${id}: services.js says "${category}" but ServicesTabs.jsx files it under ` +
        `"${claimed[0]}". The navbar and the services page would show different taxonomies.`
    )
  }

  for (const g of tabGroups.keys()) {
    if (!categories.has(g)) failures.push(`ServicesTabs.jsx lists unknown service "${g}".`)
  }
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

for (const [id, groups] of tabGroups) {
  const row = categories.get(id) || 'MISSING'
  const gallery = galleryGroups.find((g) => g.serviceId === id)
  console.log(
    pad(id, 34) +
      pad(row, 12) +
      pad(groups[0] || 'absent', 12) +
      (gallery ? gallery.group : '-')
  )
}

// Group ids are a closed set: they are labels with a fixed vocabulary, and a
// typo produces a filter nobody can select rather than an error.
const usedGroups = new Set([
  ...[...tabGroups.values()].flat(),
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
  `${categories.size} services, ${tabGroups.size} in the tabs, ` +
    `${galleryGroups.length} gallery projects, ${failures.length} disagreements\n`
)

// A floor, so a parser that stops matching fails loudly instead of passing a
// check that has stopped checking anything.
if (categories.size < 13 || tabGroups.size < 13) {
  failures.push(
    `parsed only ${categories.size} services and ${tabGroups.size} tab entries, expected 13 each. ` +
      'The file shape changed - re-check the parsing before trusting this result.'
  )
}

if (failures.length) {
  console.log(`${'x'.repeat(64)}\nFAILED (${failures.length})`)
  for (const f of [...new Set(failures)]) console.log(`  - ${f}`)
  console.log('')
  process.exit(1)
}

console.log('='.repeat(64))
console.log('PASSED - services.js, the /services tabs and the gallery filters agree\n')
