/**
 * Per-route <title> / meta description / canonical.
 *
 * Replaces the single static title in index.html, which every one of the 19
 * routes previously inherited. Descriptions for service pages are derived
 * from copy that already ships in src/data/services.js - nothing here is
 * newly invented marketing text.
 *
 * Runs unchanged in three places:
 *   - scripts/verify-seo.mjs (plain Node, no bundler)
 *   - the prerender script (Phase 2)
 *   - src/components/Seo.jsx (client-side navigation)
 */

import site, { canonicalFor } from './site.js'
// The slim index, not the full catalogue. serviceMeta() below reads only `title`
// and `text`, so importing the 36 KB prose module here would pull it into the
// client bundle on every page - Seo.jsx imports this file, so whatever this
// imports ships everywhere. See src/data/serviceIndex.js.
import { serviceIndex as serviceSections, disciplineLabels } from '../data/serviceIndex.js'

export const BRAND_SUFFIX = 'ALNANDA Contracting'

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
    title: 'ALNANDA Contracting | Fire Protection & Fire Fighting in Egypt',
    description:
      'Civil Defense approved fire protection contractor in Egypt. Fire pumps, sprinklers, ' +
      'detection, suppression and compliance to NFPA and Egyptian code. 25+ years.',
    priority: 1.0,
    changefreq: 'monthly',
  },
  '/services': {
    title: 'Fire Protection Services in Egypt | ALNANDA Contracting',
    description:
      'Thirteen fire protection disciplines in Egypt: pumps, sprinklers, standpipes, ' +
      'detection, extinguishers, suppression and Civil Defense permitting.',
    priority: 0.9,
    changefreq: 'monthly',
  },
  '/about': {
    title: 'About ALNANDA Contracting | Fire Protection Company in Egypt',
    description:
      '25+ years designing, installing and maintaining fire protection systems in ' +
      'Egypt. GACP Egypt certified and Civil Defense approved.',
    priority: 0.7,
    changefreq: 'yearly',
  },
  '/gallery': {
    title: 'Fire Protection Systems & Projects | ALNANDA Contracting',
    description:
      'Fire protection systems we design, install and maintain across Egypt: pump sets, ' +
      'sprinkler networks, standpipes and addressable detection.',
    priority: 0.6,
    changefreq: 'monthly',
  },
  '/contact': {
    title: 'Contact ALNANDA Contracting | Fire Protection Quote in Egypt',
    description:
      'Request a free site assessment or AMC quote in Egypt. WhatsApp +20 100 362 0490.',
    priority: 0.8,
    changefreq: 'yearly',
  },
}

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
