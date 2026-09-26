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
export const routes = getAllRoutes().map(({ pathname, type, serviceId }) => ({
  pathname,
  type,
  serviceId: serviceId ?? null,
}))

/** The 404 document. Not a route - it is never linked. */
export const notFoundPath = '/404'

/**
 * Map a pathname to its output file inside dist/.
 *   /            -> index.html
 *   /about       -> about/index.html
 *   /404         -> 404.html   (special-cased: must sit at the root so hosts
 *                                  can serve it for any unmatched URL)
 */
export function outputFileFor(pathname) {
  if (pathname === '/') return 'index.html'
  if (pathname === notFoundPath) return '404.html'
  return `${pathname.replace(/^\//, '').replace(/\/+$/, '')}/index.html`
}

/** Everything the prerenderer writes: 18 real pages plus the 404. */
export const prerenderTargets = [
  ...routes.map((route) => ({
    ...route,
    outFile: outputFileFor(route.pathname),
  })),
  { pathname: notFoundPath, type: 'notFound', serviceId: null, outFile: outputFileFor(notFoundPath) },
]

export default prerenderTargets
