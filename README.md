# ALNANDA Contracting

Marketing and lead-generation site for ALNANDA Contracting, a Civil Defense
approved fire protection and life safety contractor operating across Egypt.

Stack: React 19 + Vite 8 + React Router 7 + Phosphor icons. No backend — the
quote form on `/contact` holds state locally and has no delivery path yet
(see `PRODUCT.md`).

---

## Requirements

- Node.js 20.19+ or 22.12+ (Vite 8 requirement)
- npm 10+

## Setup

```bash
npm install
npm run dev          # http://localhost:5173
```

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Vite dev server with HMR, bound to all interfaces |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Serve the built `dist/` locally |
| `npm run lint` | oxlint over the project |
| `npm run verify:seo` | Assert the SEO metadata layer. Warns if `VITE_SITE_URL` is unset |
| `npm run verify:seo:strict` | Same, but fails without `VITE_SITE_URL`. **Use this in CI** |

## Environment

Copy `.env.example` to `.env.production` and set the deployed origin:

```
VITE_SITE_URL=https://www.alnanda.com.eg
```

This one variable drives every absolute URL on the site — `<link rel="canonical">`,
`og:url`, `og:image`, and the JSON-LD `@id` values. **Origin only**: no path, no
trailing slash.

A wrong value here is worse than none. Canonical tags tell search engines which
URL is authoritative, so a wrong one actively consolidates your pages onto an
address you do not control. `assertSiteUrl()` in `src/seo/site.js` throws if it is
missing, and the prerender step calls it before writing anything to `dist/`.

Leave it unset until the production domain is confirmed — canonicals then fall
back to root-relative paths and `verify:seo` warns instead of failing.

---

## SEO architecture

Metadata is **not** hardcoded in components. There are three layers:

### 1. `src/seo/site.js` — brand and contact facts

Single source of truth for name, phone, WhatsApp, hours, founding year, and
which claims are verified. Constants are grouped by claim safety:

| Group | Meaning |
|---|---|
| CONFIRMED | Verified by the business. Safe to publish and mark up. |
| UNCONFIRMED | In the UI but **never** asserted in schema or meta copy. |
| MISSING | Deliberately `null`. Do not invent a value. |

Four things a normal `LocalBusiness` markup would carry are **absent on purpose**,
and `verify:seo` asserts their absence so a later edit cannot reintroduce them:

- `address` — no Egypt street address is confirmed yet. Costs rich-result
  eligibility; a wrong address would misdirect customers.
- `email` — see [Known issues](#known-issues).
- `sameAs` — the footer social links are `href="#"` placeholders.
- NFPA 72 / 10 / 2001 / 96 / 11 / 80 and "UL-listed" — marked UNVERIFIED in
  `PRODUCT.md`, so `verifiedStandards()` drops them and those services end up with
  no standards claim at all.

### 2. `src/seo/routeMeta.js` — per-route metadata

`getRouteMeta(pathname)` returns `{ title, description, canonical, robots, ... }`
for each of the 18 routes. Service-page descriptions are derived from copy that
already ships in `src/data/services.js` — no invented marketing text.

**Adding a route?** Add it to `staticRoutes` in `routeMeta.js`, then run
`npm run verify:seo`. The route count, uniqueness and length budgets are all
asserted, so a missing or duplicated entry fails loudly.

### 3. `src/seo/jsonld.js` — structured data

Emits a single `@graph` per page: `GeneralContractor`, `WebSite`, `WebPage`,
`Service` (service pages only), and `BreadcrumbList`.

### Runtime vs. prerendered head

`src/components/Seo.jsx` syncs `document.title` and meta tags on client-side
navigation. It is **not** what search engines read — they get their metadata from
the prerendered HTML, where a crawler that never executes JavaScript still sees it.

---

## Known issues

Tracked in `SEO_PERF_PLAN.md`. These are content/business problems, not code:

1. **The contact email belongs to a different company.**
   `info@universalfirefighting.com` is the domain of the previous UAE entity
   (Universal Fire Fighting, Abu Dhabi) that this site was reskinned from. The
   phone number was migrated to `+20 100 362 0490`; the email domain was not. It
   is live in the UI at `src/pages/Contact.jsx` and `src/components/Footer.jsx`,
   so enquiries currently go nowhere. Excluded from JSON-LD in the meantime.

2. **Founding year vs. years of experience.** `founded: 1993` is confirmed, which
   implies ~33 years as of 2026, but all site copy claims "25+ years". Flagged as
   unresolved in `PRODUCT.md`. `site.js` keeps `25+` and does not derive a figure
   from the founding year.

3. **`DESIGN.md` still describes the business as "partner for the UAE"** — a
   leftover from the same reskin.

4. **Oversized images.** `public/hero-fire-protection.webp` is ~1.2 MB and is the
   LCP element on the homepage; `public/logos/gacp-egypt-logo-hd.png` is ~3.8 MB
   rendered into a 148×165 box. `public/` is 5.89 MB total. See Phase 4 of the plan.

5. **No quote delivery path.** `src/pages/Contact.jsx` shows a success message
   without sending anything.

6. **`500+ active AMC clients`** is unconfirmed and appears in the homepage stats.

---

## Project structure

```
index.html            document head, meta tags
scripts/
  verify-seo.mjs      dependency-free SEO assertions
src/
  main.jsx            client entry, mounts <BrowserRouter>
  App.jsx             route table
  seo/                site facts, route metadata, JSON-LD
  components/         Layout, Navbar, Footer, Seo, Reveal, ...
  pages/              Home, Services, ServiceDetail, About, Gallery, Contact
  data/services.js    all 13 service lines + disciplines
  index.css           design tokens and all component styles
public/               static assets, copied verbatim to dist/
PRODUCT.md            product spec, claim-safety rules, evidence status
DESIGN.md             design tokens
SEO_PERF_PLAN.md      the SEO/performance plan currently in progress
```

## Content

Service content lives in `src/data/services.js` as a single `serviceSections`
array. Adding a service there automatically generates its route, its navbar and
footer entries, its gallery panel, its metadata, and its sitemap URL. See
`PRODUCT.md` for the schema of each entry.
