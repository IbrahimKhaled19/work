/**
 * JSON-LD structured data.
 *
 * Everything here is filtered against PRODUCT.md's claim-safety rules. Three
 * fields that a LocalBusiness would normally carry are deliberately absent:
 *
 *   address  - no Egypt street address has been supplied. Omitted rather
 *              than invented; this does limit LocalBusiness rich results.
 *   email    - the address on file is the previous UAE entity's domain
 *              (site.contact.emailIsLegacy). Publishing it in markup would
 *              point structured data at someone else's inbox.
 *   sameAs   - the footer social links are href="#" placeholders.
 *
 * NFPA citations are filtered to the four verified standards. PRODUCT.md
 * marks NFPA 72/10/2001/96/11/80 and UL-listed assemblies as UNVERIFIED, so
 * services citing only those get no standards claim at all.
 */

import site from './site.js'
import { serviceSections, disciplines, disciplineLabels } from '../data/services.js'
import { getRouteMeta, matchRoute } from './routeMeta.js'

/** The only NFPA standards confirmed as ones the team actually works to. */
const VERIFIED_NFPA = new Set(['13', '14', '20', '25'])

/**
 * Pull only verified standards out of a service's free-text `standards`
 * string. Returns null when nothing survives the filter, in which case the
 * caller omits the claim entirely.
 */
export function verifiedStandards(standards) {
  if (!standards) return null
  const found = []
  const pattern = /NFPA\s+(\d+)/gi
  let match
  while ((match = pattern.exec(standards)) !== null) {
    if (VERIFIED_NFPA.has(match[1])) found.push(`NFPA ${match[1]}`)
  }
  if (/egyptian fire protection code/i.test(standards)) {
    found.push('Egyptian Fire Protection Code')
  }
  const unique = [...new Set(found)]
  return unique.length ? unique : null
}

const ORG_ID = `${site.url || 'https://placeholder.invalid'}#organization`

/**
 * GeneralContractor is a LocalBusiness subtype and the accurate one here -
 * this firm supplies, installs and maintains systems rather than selling
 * retail. `address` is omitted (see file header).
 */
export function organizationSchema() {
  const node = {
    '@type': 'GeneralContractor',
    '@id': ORG_ID,
    name: site.name,
    url: site.url || undefined,
    description: site.positioning,
    logo: site.url ? `${site.url}${site.logoVector}` : site.logoVector,
    image: site.url ? `${site.url}${site.ogImage}` : site.ogImage,
    telephone: site.contact.phone,
    foundingDate: site.founded,
    areaServed: site.areaServed,
    knowsAbout: [
      'Fire protection engineering',
      'Fire pump systems',
      'Sprinkler systems',
      'Standpipe and hose systems',
      'Fire alarm and detection',
      'Portable fire extinguishers',
      'Special hazard suppression',
      'Passive fire protection',
      'Fire protection inspection and maintenance',
      'Civil Defence compliance',
    ],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Fire protection services',
      itemListElement: serviceSections.map((service) => {
        const item = {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: service.title,
            serviceType: service.title,
          },
        }
        const standards = verifiedStandards(service.standards)
        if (standards) item.itemOffered.description = standards.join(' · ')
        return item
      }),
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: [
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
        ],
        opens: '08:00',
        closes: '18:00',
      },
    ],
  }

  // Civil Defense approval and GACP certification are user-confirmed
  // (PRODUCT.md "Evidence on Hand"), so they are safe to assert.
  const credentials = []
  if (site.claims.civilDefenseApproved) {
    credentials.push({
      '@type': 'EducationalOccupationalCredential',
      credentialCategory: 'Civil Defense approval',
      recognizedBy: { '@type': 'GovernmentOrganization', name: 'Egypt Civil Defense' },
    })
  }
  if (site.claims.gacpEgyptCertified) {
    credentials.push({
      '@type': 'EducationalOccupationalCredential',
      credentialCategory: 'GACP Egypt certification',
    })
  }
  if (credentials.length) node.hasCredential = credentials

  return node
}

/**
 * Per-service-page Service node, linked back to the organization.
 *
 * Verified standards are deliberately not attached here: this service's
 * OfferCatalog entry in organizationSchema() already carries them, filtered
 * to the same allowlist. Schema.org has no clean "standards" property, and
 * inventing one would be worse than omitting it.
 */
export function serviceSchema(service) {
  const meta = getRouteMeta(`/services/${service.id}`)
  return {
    '@type': 'Service',
    '@id': `${meta?.canonical || `/services/${service.id}`}#service`,
    name: service.title,
    serviceType: service.title,
    description: meta?.description || service.text,
    provider: { '@id': ORG_ID },
    areaServed: site.areaServed,
    url: meta?.canonical,
  }
}

/** Breadcrumb trail for a pathname, home-first. */
export function breadcrumbsFor(pathname) {
  const route = matchRoute(pathname)
  if (!route) return null

  const crumbs = [{ name: 'Home', path: '/' }]
  if (route.pathname === '/') return null

  if (route.type === 'service') {
    crumbs.push({ name: 'Services', path: '/services' })
    const service = serviceSections.find((s) => s.id === route.serviceId)
    crumbs.push({ name: service ? service.title : route.serviceId, path: route.pathname })
  } else {
    crumbs.push({ name: route.title.split('|')[0].trim(), path: route.pathname })
  }
  return crumbs
}

export function breadcrumbSchema(crumbs) {
  if (!crumbs || !crumbs.length) return null
  return {
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: site.url ? `${site.url}${crumb.path}` : crumb.path,
    })),
  }
}

/** WebPage node so title/description are expressed in markup too. */
export function webPageSchema(pathname) {
  const meta = getRouteMeta(pathname)
  if (!meta) return null
  return {
    '@type': 'WebPage',
    '@id': `${meta.canonical}#webpage`,
    url: meta.canonical,
    name: meta.title,
    description: meta.description,
    isPartOf: { '@id': `${site.url || ''}#website` },
    inLanguage: site.lang,
    about: { '@id': ORG_ID },
  }
}

export function websiteSchema() {
  return {
    '@type': 'WebSite',
    '@id': `${site.url || ''}#website`,
    url: site.url || undefined,
    name: site.name,
    description: site.positioning,
    inLanguage: site.lang,
    publisher: { '@id': ORG_ID },
  }
}

/**
 * Full @graph for a route, as a JSON string ready for a
 * <script type="application/ld+json"> block. Returns null for unknown paths.
 */
export function jsonLdFor(pathname) {
  const route = matchRoute(pathname)
  if (!route) return null

  const graph = [organizationSchema(), websiteSchema()]

  const page = webPageSchema(pathname)
  if (page) graph.push(page)

  if (route.type === 'service') {
    const service = serviceSections.find((s) => s.id === route.serviceId)
    if (service) graph.push(serviceSchema(service))
  }

  const crumbs = breadcrumbsFor(pathname)
  const crumbNode = breadcrumbSchema(crumbs)
  if (crumbNode) graph.push(crumbNode)

  // Strip undefined values so the emitted JSON stays clean.
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph })
}

export { disciplines, disciplineLabels }
