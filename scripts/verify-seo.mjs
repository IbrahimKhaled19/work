/**
 * Dependency-free verification of the SEO metadata layer.
 *
 * Runs under plain Node (package.json is "type": "module", and
 * src/data/services.js is plain JS with no JSX), so it works while the
 * install is still broken. This is the guarantee that Phase 2/3 would
 * otherwise only provide once, manually.
 *
 *   node scripts/verify-seo.mjs
 *
 *   node scripts/verify-seo.mjs            # warns if VITE_SITE_URL is unset
 *   node scripts/verify-seo.mjs --strict   # fails if VITE_SITE_URL is unset (use in CI)
 *
 * Exits non-zero on any failure, so it can gate the build in CI.
 */

import { getAllRoutes, getRouteMeta, notFoundMeta, TITLE_MAX, DESCRIPTION_MAX } from '../src/seo/routeMeta.js'
import { jsonLdFor, verifiedStandards } from '../src/seo/jsonld.js'
import site, { isSiteUrlConfigured, assertSiteUrl } from '../src/seo/site.js'
import { serviceSections } from '../src/data/services.js'

const STRICT = process.argv.includes('--strict')

const EXPECTED_ROUTE_COUNT = 5 + serviceSections.length

const failures = []
const warnings = []
const fail = (msg) => failures.push(msg)
const warn = (msg) => warnings.push(msg)

const routes = getAllRoutes()

console.log(`\nVerifying SEO metadata for ${routes.length} routes\n${'-'.repeat(60)}`)

// ---- 1. Route inventory -------------------------------------------------
if (routes.length !== EXPECTED_ROUTE_COUNT) {
  fail(`expected ${EXPECTED_ROUTE_COUNT} routes, got ${routes.length}`)
}

const seenPaths = new Set()
for (const route of routes) {
  if (seenPaths.has(route.pathname)) fail(`duplicate route path: ${route.pathname}`)
  seenPaths.add(route.pathname)
}

// ---- 2. Uniqueness + length bounds -------------------------------------
const titles = new Map()
const descriptions = new Map()
const canonicals = new Map()

for (const route of routes) {
  const meta = getRouteMeta(route.pathname)
  if (!meta) {
    fail(`${route.pathname}: getRouteMeta returned null`)
    continue
  }

  if (!meta.title) fail(`${route.pathname}: empty title`)
  if (!meta.description) fail(`${route.pathname}: empty description`)
  if (!meta.canonical) fail(`${route.pathname}: empty canonical`)

  if (meta.title.length > TITLE_MAX) {
    fail(`${route.pathname}: title ${meta.title.length} chars > ${TITLE_MAX} - "${meta.title}"`)
  }
  if (meta.description.length > DESCRIPTION_MAX) {
    fail(
      `${route.pathname}: description ${meta.description.length} chars > ${DESCRIPTION_MAX} - "${meta.description}"`
    )
  }

  for (const [map, value, label] of [
    [titles, meta.title, 'title'],
    [descriptions, meta.description, 'description'],
    [canonicals, meta.canonical, 'canonical'],
  ]) {
    if (map.has(value)) fail(`${label} collision: "${value}" on ${map.get(value)} and ${route.pathname}`)
    else map.set(value, route.pathname)
  }

  if (!/\|/.test(meta.title)) warn(`${route.pathname}: title has no brand separator`)
  if (/[<>{}\\]/.test(meta.title + meta.description)) {
    fail(`${route.pathname}: title/description contains markup characters`)
  }
}

// ---- 3. Site URL --------------------------------------------------------
if (!isSiteUrlConfigured) {
  const message =
    'VITE_SITE_URL is not set - canonical/og:url fall back to root-relative paths. ' +
    'Set VITE_SITE_URL in .env.production before deploying.'
  if (STRICT) fail(`${message} (--strict)`)
  else warn(message)
} else {
  try {
    assertSiteUrl()
    console.log(`site url: ${site.url}`)
  } catch (error) {
    fail(error.message)
  }
}

// ---- 4. JSON-LD ---------------------------------------------------------
const UNVERIFIED_NFPA = /\bNFPA\s+(72|10|2001|96|11|80)\b/
let jsonLdOk = 0

for (const route of routes) {
  const raw = jsonLdFor(route.pathname)
  if (!raw) {
    fail(`${route.pathname}: jsonLdFor returned null`)
    continue
  }

  let parsed
  try {
    parsed = JSON.parse(raw)
  } catch (error) {
    fail(`${route.pathname}: JSON-LD does not parse - ${error.message}`)
    continue
  }
  if (parsed['@context'] !== 'https://schema.org') fail(`${route.pathname}: bad @context`)
  if (!Array.isArray(parsed['@graph'])) {
    fail(`${route.pathname}: @graph is not an array`)
    continue
  }

  const types = parsed['@graph'].map((n) => n['@type'])
  if (!types.includes('GeneralContractor')) fail(`${route.pathname}: no GeneralContractor node`)
  if (!types.includes('WebSite')) fail(`${route.pathname}: no WebSite node`)
  if (route.type === 'service' && !types.includes('Service')) {
    fail(`${route.pathname}: service route missing Service node`)
  }
  if (route.pathname !== '/' && !types.includes('BreadcrumbList')) {
    fail(`${route.pathname}: missing BreadcrumbList`)
  }

  // Claim-safety: these must never appear anywhere in the emitted markup.
  const serialised = raw
  if (serialised.includes('@' + 'type":"PostalAddress') || serialised.includes('PostalAddress')) {
    fail(`${route.pathname}: PostalAddress present - no street address is confirmed`)
  }
  if (serialised.includes('universalfirefighting.com')) {
    fail(`${route.pathname}: legacy UAE email domain leaked into JSON-LD`)
  }
  if (UNVERIFIED_NFPA.test(serialised)) {
    fail(`${route.pathname}: unverified NFPA citation in JSON-LD - ${UNVERIFIED_NFPA.exec(serialised)[0]}`)
  }
  if (serialised.includes('"sameAs"')) {
    fail(`${route.pathname}: sameAs present but social profiles are placeholders`)
  }
  jsonLdOk++
}

// ---- 5. Standards filter behaviour -------------------------------------
const EXPECTED_STANDARDS = {
  'design-engineering': ['NFPA 13', 'NFPA 20', 'Egyptian Fire Protection Code'],
  'fire-pump-systems': ['NFPA 20', 'NFPA 25'],
  'sprinkler-systems': ['NFPA 13'],
  'standpipe-hose-systems': ['NFPA 14'],
  'inspection-testing-maintenance': ['NFPA 25'],
  'fire-alarm-detection': null,
  'portable-extinguishers': null,
  'special-hazard-suppression': null,
  'passive-fire-protection': null,
}

for (const [id, expected] of Object.entries(EXPECTED_STANDARDS)) {
  const service = serviceSections.find((s) => s.id === id)
  if (!service) {
    fail(`standards check: unknown service id ${id}`)
    continue
  }
  const actual = verifiedStandards(service.standards)
  const a = JSON.stringify(actual)
  const e = JSON.stringify(expected)
  if (a !== e) fail(`standards filter wrong for ${id}: got ${a}, expected ${e}`)
}

// ---- 6. 404 metadata ----------------------------------------------------
if (!notFoundMeta.title) fail('notFoundMeta.title missing')
if (!/noindex/.test(notFoundMeta.robots || '')) fail('notFoundMeta is not noindex')
if (getRouteMeta('/this-route-does-not-exist') !== null) {
  fail('getRouteMeta matched a non-existent route')
}
if (getRouteMeta('/services/not-a-service') !== null) {
  fail('getRouteMeta matched a non-existent service')
}

// ---- Report -------------------------------------------------------------
console.log(`routes checked      : ${routes.length}`)
console.log(`json-ld documents   : ${jsonLdOk}`)
console.log(`unique titles       : ${titles.size}`)
console.log(`unique descriptions : ${descriptions.size}`)
console.log(`unique canonicals   : ${canonicals.size}`)

const sample = routes.slice(0, 3).concat(routes.filter((r) => r.type === 'service').slice(0, 2))
console.log(`\nsample\n${'-'.repeat(60)}`)
for (const route of sample) {
  const meta = getRouteMeta(route.pathname)
  console.log(`\n${route.pathname}`)
  console.log(`  title  (${String(meta.title.length).padStart(3)})  ${meta.title}`)
  console.log(`  desc   (${String(meta.description.length).padStart(3)})  ${meta.description}`)
}

if (warnings.length) {
  console.log(`\n${'!'.repeat(60)}\nWARNINGS (${warnings.length})`)
  for (const message of warnings) console.log(`  - ${message}`)
}

if (failures.length) {
  console.log(`\n${'x'.repeat(60)}\nFAILED (${failures.length})`)
  for (const message of failures) console.log(`  - ${message}`)
  console.log('')
  process.exit(1)
}

console.log(`\n${'='.repeat(60)}\nPASSED - all SEO metadata assertions hold\n`)
