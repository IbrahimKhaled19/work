/**
 * Assert that the SSR route table and the browser route table agree.
 *
 *   npm run verify:prerender:lazy
 *
 * WHY THIS EXISTS
 * ---------------
 * App.jsx code-splits its routes with React.lazy; entry-server.jsx declares a
 * separate eager route table because renderToString cannot await a lazy
 * component. Those two tables must list the same routes.
 *
 * If they drift, the failure is silent and catastrophic in a specific way: a
 * route present in entry-server.jsx but lazy in App.jsx prerenders fine and
 * works in the browser. A route lazy in App.jsx but missing from entry-server
 * prerenders as an empty page - the Suspense fallback - with a 200 status and
 * a correct-looking title. That is exactly the "shipped 19 blank pages"
 * outcome prerendering exists to prevent, and verify:build cannot see it,
 * because the head metadata is generated independently of the body.
 *
 * So the two tables are compared directly. src/seo/routeMeta.js is compared
 * against them too, at the end: it is the table the prerender and the sitemap
 * are generated from, and a route missing from it is never rendered to HTML.
 */
import fs from 'node:fs'
import path from 'node:path'
import { getAllRoutes } from '../src/seo/routeMeta.js'
import { failures, pad, finish } from './lib/verify.mjs'

const ROOT = process.cwd()
const APP = path.join(ROOT, 'src', 'App.jsx')
const SSR = path.join(ROOT, 'src', 'entry-server.jsx')

const app = fs.readFileSync(APP, 'utf8')
const ssr = fs.readFileSync(SSR, 'utf8')

/**
 * Pull `<Route path="..." element={<X />} />` declarations out of a source file.
 * Attribute order is not guaranteed, so both are matched independently.
 */
/**
 * Pull `<Route path="..." element={<X />} />` declarations out of a source file.
 *
 * The tag is matched up to its first `>`, which is not the end of the element:
 * `element={<Layout />}` contains its own `/>`. So the captured span is
 * `path="..." element={<X /` and the closing brace of the element is always
 * truncated. Matching the component name without requiring the closing `/>`
 * handles that.
 *
 * The layout container `<Route element={<Layout />}>` has no `path` and is
 * skipped, since it is a layout wrapper rather than a route.
 */
function routesIn(source) {
  const routes = []
  for (const m of source.matchAll(/<Route\b([^>]*)>/g)) {
    const attrs = m[1]
    const path = attrs.match(/\bpath="([^"]*)"/)?.[1]
    if (path === undefined) continue
    const element = attrs.match(/element=\{<(\w+)/)?.[1]
    if (element) routes.push({ path, element })
  }
  return routes
}

/** Resolve an import specifier relative to a file, handling the .jsx suffix. */
function resolveImport(fromFile, spec) {
  const base = path.resolve(path.dirname(fromFile), spec)
  for (const candidate of [base, `${base}.jsx`, `${base}.js`, path.join(base, 'index.jsx')]) {
    if (fs.existsSync(candidate)) return candidate
  }
  return null
}

const appRoutes = routesIn(app)
const ssrRoutes = routesIn(ssr)

if (appRoutes.length === 0) {
  failures.push('no routes parsed from src/App.jsx - has the markup changed?')
}
if (ssrRoutes.length === 0) {
  failures.push('no routes parsed from src/entry-server.jsx - has the markup changed?')
}

// --- the tables must match, by path AND by component ------------------------
const appByPath = new Map(appRoutes.map((r) => [r.path, r.element]))
const ssrByPath = new Map(ssrRoutes.map((r) => [r.path, r.element]))

for (const [p, element] of appByPath) {
  if (!ssrByPath.has(p)) {
    failures.push(
      `src/App.jsx declares "${p}" but src/entry-server.jsx does not. ` +
        'The prerender would emit the Suspense fallback instead of the page.'
    )
  } else if (ssrByPath.get(p) !== element) {
    failures.push(
      `route "${p}" resolves to <${element}> in App.jsx but <${ssrByPath.get(p)}> ` +
        'in entry-server.jsx.'
    )
  }
}
for (const p of ssrByPath.keys()) {
  if (!appByPath.has(p)) {
    failures.push(
      `src/entry-server.jsx declares "${p}" but src/App.jsx does not. ` +
        'The page would exist as static HTML but 404 on client-side navigation.'
    )
  }
}

// --- and both must match the SEO route table -------------------------------
// src/seo/routeMeta.js is a third table: it drives the prerender, sitemap.xml
// and every <title>. A path in App.jsx that it does not know about renders in
// the browser but is never prerendered, so a direct load 404s; an entry it
// knows about with no App route is static HTML the app cannot navigate to.
// Neither mistake is visible from inside either table, and neither fails a
// build, so it is checked here where the App table is already parsed.
const seoPaths = new Set(getAllRoutes().map((r) => r.pathname))
const appPaths = new Set(appRoutes.map((r) => r.path))
const SERVICE_PARAM = '/services/:serviceId'

for (const p of appPaths) {
  // The catch-all renders NotFound. The parametric service route matches the
  // thirteen expanded paths, so it is checked separately below rather than
  // against a literal entry that does not exist.
  if (p === '*' || p === SERVICE_PARAM) continue
  if (!seoPaths.has(p)) {
    failures.push(
      `src/App.jsx declares "${p}" but src/seo/routeMeta.js has no entry for it. ` +
        'The page would render in the browser but never be prerendered, so a direct load 404s.'
    )
  }
}
for (const p of seoPaths) {
  if (p.startsWith('/services/')) continue // served by the parametric route
  if (!appPaths.has(p)) {
    failures.push(
      `src/seo/routeMeta.js has "${p}" but src/App.jsx does not declare it. ` +
        'The prerender would emit a page the app cannot route to.'
    )
  }
}
const serviceSeoRoutes = [...seoPaths].filter((p) => p.startsWith('/services/'))
if (appPaths.has(SERVICE_PARAM) && serviceSeoRoutes.length === 0) {
  failures.push(
    'App.jsx declares /services/:serviceId but routeMeta.js derives no service routes from services.js.'
  )
}
if (!appPaths.has(SERVICE_PARAM) && serviceSeoRoutes.length > 0) {
  failures.push(
    `routeMeta.js derives ${serviceSeoRoutes.length} service routes but App.jsx has no /services/:serviceId route.`
  )
}

// --- lazy() calls must have a real import behind them ----------------------
// A lazy(() => import('./pages/X')) whose module does not exist fails at build
// time in production but silently resolves to a rejected chunk at runtime.
for (const m of app.matchAll(/lazy\(\(\)\s*=>\s*import\(['"]([^'"]+)['"]\)\)/g)) {
  const spec = m[1]
  if (!resolveImport(APP, spec)) {
    failures.push(`App.jsx lazy-imports "${spec}" which does not exist`)
  }
}

// --- report ----------------------------------------------------------------

console.log(`\nverifying the prerender route table\n${'-'.repeat(64)}`)
console.log(`${pad('path', 28)}${pad('App.jsx', 18)}entry-server.jsx`)
console.log('-'.repeat(64))
for (const r of appRoutes) {
  console.log(pad(r.path || '(index)', 28) + pad(r.element, 18) + (ssrByPath.get(r.path) || 'MISSING'))
}
console.log('-'.repeat(64))
console.log(`${appRoutes.length} routes in App.jsx, ${ssrRoutes.length} in entry-server.jsx`)
console.log('')

finish('both route tables agree, so the prerender cannot emit an empty page')
