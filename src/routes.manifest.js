/**
 * The authoritative list of routes, and where each one is written to disk.
 *
 * Single source of truth. scripts/prerender.mjs and scripts/sitemap.mjs both
 * read this, so the set of prerendered HTML files and the set of URLs in
 * sitemap.xml cannot drift apart. Route metadata (title/description/canonical)
 * comes from src/seo/routeMeta.js, which derives the 13 service paths from
 * serviceSections in src/data/services.js - so adding a service there
 * automatically produces a route, an HTML file and a sitemap entry.
 */

import { getAllRoutes } from './seo/routeMeta.js'

/** Real, indexable routes. */
export const routes = getAllRoutes().map(
  ({ pathname, type, serviceId, priority, changefreq }) => ({
    pathname,
    type,
    serviceId: serviceId ?? null,
    // Carried through so sitemap.xml can express relative importance. These
    // are hints only - Google ignores priority and changefreq - but they cost
    // nothing and document intent.
    priority: priority ?? 0.5,
    changefreq: changefreq ?? 'monthly',
  })
)

/** The 404 document. Not a route - it is never linked. */
export const notFoundPath = '/404'

/**
 * Map a pathname to the files that must exist in dist/ for it to resolve.
 *
 *   /  -> ['index.html']
 *   /about -> ['about.html', 'about/index.html']
 *
 * Both forms are emitted deliberately. Hosts resolve prerendered routes
 * inconsistently: Apache and Netlify serve `<route>/index.html` for `/about`,
 * while Vercel's `cleanUrls` and most CDNs look for `about.html`. Emitting only
 * one form means the site 404s on half of all hosts - and the failure is silent
 * until someone loads a deep link. Two forms cost ~1.3 MB of deploy size and
 * remove the entire class of problem.
 *
 * The 404 is special-cased to the root, because that is where every host looks
 * for it.
 */
export function outputFilesFor(pathname) {
  if (pathname === '/') return ['index.html']
  if (pathname === notFoundPath) return ['404.html']
  const slug = pathname.replace(/^\//, '').replace(/\/+$/, '')
  return [`${slug}.html`, `${slug}/index.html`]
}

/** Everything the prerenderer writes, flattened across both output forms. */
export const prerenderTargets = [
  ...routes.map((route) => ({
    ...route,
    outFiles: outputFilesFor(route.pathname),
  })),
  {
    pathname: notFoundPath,
    type: 'notFound',
    serviceId: null,
    outFiles: outputFilesFor(notFoundPath),
  },
]

export default prerenderTargets
