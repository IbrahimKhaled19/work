/**
 * Single source of truth for brand, NAP and factual claims.
 *
 * Every phone number, email, and hours string previously hardcoded across
 * Home, About, Contact, Footer, CTA, NotFound, Gallery, Services and
 * ServiceDetail should be imported from here instead.
 *
 * PROVENANCE / CLAIM SAFETY
 * -------------------------
 * Fields are grouped by how trustworthy they are. This is deliberate: the
 * SEO layer (routeMeta, jsonld, OG tags) must never assert something the
 * business has not confirmed. See PRODUCT.md "Brand Commitments" and
 * "Evidence on Hand".
 *
 *   CONFIRMED   - verified by the business, safe to publish and to mark up.
 *   UNCONFIRMED - retained in the UI but must NOT be asserted in schema,
 *                 meta descriptions, or anywhere a crawler would read it as
 *                 a factual claim.
 *   MISSING     - deliberately null. Do not invent a value to fill these.
 */

// VITE_SITE_URL is read via the literal member expression so Vite can
// statically replace it at build time. The globalThis fallback lets plain
// Node (scripts/verify-seo.mjs) import this module without a bundler.
const VITE_SITE_URL = import.meta.env?.VITE_SITE_URL
const NODE_SITE_URL = globalThis.process?.env?.VITE_SITE_URL

const DEV_ORIGIN = 'http://localhost:5173'

function resolveSiteUrl() {
  const raw = (VITE_SITE_URL || NODE_SITE_URL || '').trim()
  if (!raw) return ''
  // Normalise: absolute origin only, no trailing slash, no path.
  try {
    const url = new URL(raw)
    return url.origin
  } catch {
    return ''
  }
}

const SITE_URL = resolveSiteUrl()

export const isSiteUrlConfigured = SITE_URL !== ''

/**
 * Throws when VITE_SITE_URL is missing. Call this from the prerender step
 * (Phase 2) and from scripts/verify-seo.mjs so a wrong or placeholder
 * canonical can never reach production.
 */
export function assertSiteUrl() {
  if (!isSiteUrlConfigured) {
    throw new Error(
      'VITE_SITE_URL is not set.\n' +
        'Canonical URLs, og:url and sitemap.xml are all absolute and would be wrong.\n' +
        'Set it in .env.production, e.g. VITE_SITE_URL=https://www.alnanda.com.eg\n' +
        `(dev fallback "${DEV_ORIGIN}" is not valid for production.)`
    )
  }
  return SITE_URL
}

export const site = {
  name: 'ALNANDA Contracting',
  legalName: null, // UNCONFIRMED - not supplied by the business
  url: SITE_URL,
  devOrigin: DEV_ORIGIN,

  lang: 'en',
  locale: 'en_EG',
  themeColor: '#CC2643',

  // Navbar brand mark. The SVG is the canonical reference - it is what goes
  // into JSON-LD, since a vector is both smaller and resolution-independent.
  // The raster path is the optimised 2x variant emitted by scripts/images.mjs;
  // the original 2132x738 / 166 KB master lives in assets-src/ and is never
  // served. Rendered size is pinned by `.brand img` in src/index.css.
  logoVector: '/logo.svg',
  logoRaster: '/img/logo-240.webp',
  favicon: '/favicon.svg',
  appleTouchIcon: '/img/apple-touch-icon.png',

  // Share card. Generated at 1200x630 by scripts/images.mjs and written to
  // public/img/, so it is served from /img/ - not the site root.
  ogImage: '/img/og-image.jpg',
  ogImageWidth: 1200,
  ogImageHeight: 630,
  ogImageType: 'image/jpeg',
  ogImageAlt:
    'ALNANDA Contracting - Civil Defense approved fire safety and fire fighting contractor in Egypt',

  positioning:
    'Authority-led engineering: complete fire protection engineered to code, ' +
    'from hydraulic calculations to the Civil Defense signature, under one accountable team.',

  // ---- CONFIRMED contact facts (PRODUCT.md: "01003620490 verified and
  // unified as the single call/WhatsApp number across the site") ----
  contact: {
    phone: '+201003620490',
    phoneDisplay: '+20 100 362 0490',
    phoneLocal: '01003620490',
    whatsapp: 'https://wa.me/201003620490',

    // LEGACY. This is the domain of the previous UAE entity
    // (Universal Fire Fighting, Abu Dhabi) and does not match the
    // ALNANDA brand. PRODUCT.md: "rebrand the address when the new domain
    // is confirmed". Kept here because the UI displays it, but it is
    // deliberately EXCLUDED from JSON-LD - see jsonld.js.
    email: 'info@universalfirefighting.com',
    emailIsLegacy: true,
  },

  hours: {
    // Schema.org day codes. Mon-Sat 08:00-18:00.
    openingHours: 'Mo-Sa 08:00-18:00',
    display: 'Mon-Sat: 8:00 AM - 6:00 PM',
    emergencyDisplay: '24/7 emergency call-out',
    // 24/7 emergency cover sits on top of the Mon-Sat schedule; it is a
    // dispatch promise, not separate staffed hours, so it is expressed in
    // copy rather than as an openingHoursSpecification range.
    emergency: true,
  },

  // ---- MISSING: no Egypt street address has been supplied (PRODUCT.md:
  // "Egypt street address is missing (address lines removed from UI until
  // confirmed)"). `address` is therefore null and JSON-LD uses areaServed
  // only. Do not fabricate a PostalAddress - a wrong one in LocalBusiness
  // markup is worse than none, and it would misdirect local searchers.
  address: null,
  areaServed: [
    { '@type': 'Country', name: 'Egypt' },
  ],
  areaServedDisplay: 'Industrial and commercial facilities across Egypt',

  // ---- UNCONFIRMED: retained in the UI, excluded from schema/meta ----
  // "The 500+ AMC clients figure is unconfirmed and retained only until corrected."
  unconfirmed: {
    activeAmcClients: '500+',
  },

  // Footer renders href="#" placeholders for Facebook/Instagram/LinkedIn.
  // Left empty so `sameAs` is omitted rather than emitting dead URLs.
  social: [],

  // ---- CONFIRMED claims (PRODUCT.md "Evidence on Hand") ----
  claims: {
    civilDefenseApproved: true,
    gacpEgyptCertified: true,
    egyptianFireProtectionCode: true,
    // Verified citations only. NFPA 72/10/2001/96/11/80 and UL-listed
    // assemblies are explicitly UNVERIFIED per PRODUCT.md and are filtered
    // out of structured data by VERIFIED_NFPA in jsonld.js.
    verifiedNfpa: ['NFPA 13', 'NFPA 14', 'NFPA 20', 'NFPA 25'],
  },

  founded: '1993', // CONFIRMED per PRODUCT.md
  // Kept as "25+" rather than deriving a year count from `founded`, because
  // PRODUCT.md flags the arithmetic tension (1993 implies ~33 years) as
  // unresolved. "25+" is the conservative, defensible claim.
  yearsExperience: '25+',
  projectsDelivered: '100+', // CONFIRMED
  callbackPromise: 'within 1 hour during working hours',
}

/**
 * Canonical URL for a pathname, e.g. canonicalFor('/services').
 *
 * When VITE_SITE_URL is unset this returns a root-relative path rather than
 * a wrong absolute URL. assertSiteUrl() must be called by the prerenderer
 * before anything is written to dist/, so a relative value can never reach
 * production.
 */
export function canonicalFor(pathname) {
  const clean = pathname === '/' ? '/' : pathname.replace(/\/+$/, '') || '/'
  if (!SITE_URL) return clean
  return clean === '/' ? `${SITE_URL}/` : `${SITE_URL}${clean}`
}

/** Absolute URL for a site-relative asset path (required for og:image). */
export function absoluteUrl(assetPath) {
  return `${SITE_URL}${assetPath}`
}

export default site
