/**
 * Per-route <title> / meta description / canonical.
 *
 * Replaces the single static title in index.html, which every route previously
 * inherited. Descriptions for service pages are derived
 * from copy that already ships in src/data/services.js - nothing here is
 * newly invented marketing text.
 *
 * Runs unchanged in three places:
 *   - scripts/verify-seo.mjs (plain Node, no bundler)
 *   - the prerender script (Phase 2)
 *   - src/components/Seo.jsx (client-side navigation)
 *
 * This is the second of the site's route tables. The first is the browser's
 * own: <Route> declarations in src/App.jsx and src/entry-server.jsx, which say
 * which component renders which path. Nothing derives one from the other, so
 * adding a page means adding it in both places - and a path that exists only
 * in App.jsx renders in the browser while 404ing on a direct load, with no
 * error anywhere. `npm run verify:prerender:lazy` compares the tables.
 */

import site, { canonicalFor } from './site.js'
// The slim index, not the full catalogue. serviceMeta() below reads only `title`
// and `text`, so importing the 36 KB prose module here would pull it into the
// client bundle on every page - Seo.jsx imports this file, so whatever this
// imports ships everywhere. See src/data/serviceIndex.js.
import { serviceIndex as serviceSections, disciplineLabels } from '../data/serviceIndex.js'

export const BRAND_SUFFIX = site.name

/** Google truncates around 580px; stay under ~60 chars to be safe. */
export const TITLE_MAX = 62
/** Meta descriptions truncate around 155-160 chars. */
export const DESCRIPTION_MAX = 160

/**
 * Trim to a word boundary on a single-character ellipsis so the result stays
 * inside an exact character budget (descriptions are length-asserted).
 */
export function clamp(text, max) {
  const clean = text.replace(/\s+/g, ' ').trim()
  if (clean.length <= max) return clean
  const cut = clean.slice(0, max - 1)
  const lastSpace = cut.lastIndexOf(' ')
  const body = lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut
  return `${body.replace(/[\s.,;:·—–-]+$/, '')}…`
}

const staticRoutes = {
  '/': {
    title: 'ALNADA Contracting | Fire Protection & Fire Fighting in Egypt',
    description:
      'Civil Defense approved fire protection contractor in Egypt. Fire pumps, sprinklers, ' +
      'detection, suppression and compliance to NFPA and Egyptian code. Est. 1993.',
    priority: 1.0,
    changefreq: 'monthly',
    nav: { label: 'Home', order: 1 },
  },
  '/services': {
    title: 'Fire Protection Services in Egypt | ALNADA Contracting',
    description:
      `${serviceSections.length} fire protection services in Egypt: pumps, sprinklers, ` +
      'standpipes, detection, extinguishers, suppression and Civil Defense permitting.',
    priority: 0.9,
    changefreq: 'monthly',
    nav: { label: 'Services', order: 2 },
  },
  '/about': {
    title: 'About ALNADA Contracting | Fire Protection Company in Egypt',
    description:
      `${site.yearsExperience}+ years in fire protection across Egypt. GACP Egypt certified and Civil Defense approved.`,
    // The founder portrait opens the page and is by a wide margin its largest
    // element, so it is this route's LCP image. Nothing preloads it otherwise:
    // React hoists a preload for a bare eager <img>, but not for one wrapped in
    // <picture> (scripts/prerender.mjs lifts whatever React does hoist), so
    // without this the browser only discovers it partway down the body parse.
    // See the preloadImage block in scripts/prerender.mjs.
    preloadImage: 'founder',
    priority: 0.7,
    changefreq: 'yearly',
    nav: { label: 'About Us', order: 3 },
  },
  '/contact': {
    title: 'Contact ALNADA Contracting | Fire Protection Quote in Egypt',
    description:
      `Request a free site assessment or AMC quote in Egypt. WhatsApp ${site.contact.phoneDisplay}.`,
    priority: 0.8,
    changefreq: 'yearly',
    nav: { label: 'Contact', order: 5 },
  },
  // Indexable, not noindex. A careers page that is reachable only from a
  // footer link is findable by nobody, and it is the sort of page that
  // attracts applicants through search rather than through the site.
  //
  // changefreq is 'weekly' rather than the 'yearly' used by the other static
  // pages because this is the one page whose content changes when the business
  // hires. It still resolves to a stable Sitemap lastmod either way, so this is
  // intent rather than a crawl instruction - Google ignores the value.
  '/careers': {
    title: 'Careers at ALNADA Contracting | Fire Protection Jobs in Egypt',
    description:
      'Careers in fire protection engineering, installation and maintenance ' +
      'across Egypt. Civil Defense approved, since 1993.',
    priority: 0.5,
    changefreq: 'weekly',
    nav: { label: 'Careers', order: 4 },
  },
}

/**
 * The primary navigation, in one place for the bar and the footer.
 *
 * Ordered by intent rather than alphabet: the offering first because it is what
 * visitors come for and it owns the dropdown, then who the company is, then the
 * two audiences - candidates, and the visitor who wants to talk to us. Contact
 * is last because it is the action every other link leads to.
 *
 * A route joins the navigation by carrying `nav`, so adding a page means adding
 * it to staticRoutes once; there is no second list for the footer to drift from.
 */
export const navLinks = Object.entries(staticRoutes)
  .filter(([, meta]) => meta.nav)
  .sort((a, b) => a[1].nav.order - b[1].nav.order)
  .map(([to, meta]) => ({ to, label: meta.nav.label }))

export const notFoundMeta = {
  title: `Page Not Found | ${BRAND_SUFFIX}`,
  description: 'The page you were looking for does not exist.',
  robots: 'noindex, follow',
  priority: 0.0,
  changefreq: 'yearly',
}

function serviceMeta(service) {
  // "Design & Engineering" -> "design & engineering"
  const subject = service.title.toLowerCase()

  // Three service titles are long enough that adding " in Egypt" pushes them
  // past TITLE_MAX ("Civil Defense Compliance & Permitting in Egypt | ..." is
  // 68 chars). Local intent is preserved in the description below, which
  // always carries "in Egypt", so drop the qualifier from the title rather
  // than exceed the budget or truncate mid-phrase.
  const withRegion = `${service.title} in Egypt | ${BRAND_SUFFIX}`
  const title = withRegion.length <= TITLE_MAX ? withRegion : `${service.title} | ${BRAND_SUFFIX}`

  return {
    title,
    description: clamp(
      `Civil Defense approved ${subject} in Egypt. ${service.text}`,
      DESCRIPTION_MAX
    ),
    priority: 0.8,
    changefreq: 'monthly',
  }
}

/** Every real, indexable route on the site. Drives sitemap + prerender. */
export function getAllRoutes() {
  return [
    ...Object.keys(staticRoutes).map((pathname) => ({
      pathname,
      type: 'static',
      ...staticRoutes[pathname],
    })),
    ...serviceSections.map((service) => ({
      pathname: `/services/${service.id}`,
      type: 'service',
      serviceId: service.id,
      ...serviceMeta(service),
    })),
  ]
}

/** Normalise any incoming pathname to a known route key, or null. */
export function matchRoute(pathname) {
  if (!pathname) return null
  const clean = pathname.replace(/\/+$/, '') || '/'
  const routes = getAllRoutes()
  return routes.find((r) => r.pathname === clean) || null
}

/**
 * Full head payload for a pathname. Returns null for unknown paths so
 * callers can fall through to notFoundMeta / a real 404.
 */
export function getRouteMeta(pathname) {
  const route = matchRoute(pathname)
  if (!route) return null

  return {
    title: route.title,
    description: route.description,
    canonical: canonicalFor(route.pathname),
    ogType: 'website',
    ogImage: site.ogImage,
    robots: route.robots || 'index, follow',
    // Only set on routes whose largest element is an image this site serves
    // rather than a remote one; the prerender turns it into a <link rel=preload>.
    preloadImage: route.preloadImage,
    priority: route.priority,
    changefreq: route.changefreq,
    route,
  }
}

/** Convenience: service lookup used by jsonld.js and the prerenderer. */
export function getService(serviceId) {
  return serviceSections.find((s) => s.id === serviceId) || null
}

export { staticRoutes, disciplineLabels }
