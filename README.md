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
| `npm run verify:contrast` | Check every declared colour-token pair against WCAG AA |
| `npm run verify` | Lint plus all four verifiers, in order. **Use this in CI** |
| `npm run audit` | Lighthouse against the built `dist/`. The only score worth quoting |
| `npm run images` | Rebuild optimised image variants from `assets-src/` into `public/img/` |
| `npm run images:inspect` | Report dimensions, format and size of every image |

## Images

Full-resolution masters live in **`assets-src/`** and are never served — anything
in `public/` is copied verbatim into `dist/`, so a 3.8 MB master sitting there
would ship to every visitor.

`npm run images` reads them and writes responsive AVIF + WebP variants to
`public/img/`, plus `src/data/images.js` holding the measured dimensions.
Components read that manifest through `<Picture>`, which is what gives every
`<img>` a correct `width`/`height` (no layout shift) and a `srcset`.

To replace an image: drop the new master in `assets-src/`, run `npm run images`,
and update the entry in the `TARGETS` array in `scripts/images.mjs` if its
display size changed. Only `scripts/images.mjs` should ever be edited by hand.

Rules the pipeline enforces: never upscale; emit 1x/2x for fixed CSS boxes;
copy through sources already under 14 KB, because re-encoding a 1.6 KB PNG
produces three files larger than the original; no PNG tier, since WebP has been
universally supported since 2020 and on these logos the PNG was often the
*largest* of the three outputs.

### Replacing the placeholder photography

The site currently ships stock imagery. When real project photography arrives,
the procedure is the same for every image, and the pipeline does the rest:

1. **Drop the master in `assets-src/`.** Full resolution, any format the
   `sharp` install can read. Keep the aspect ratio roughly matching the
   `displayWidth`/`displayHeight` in `scripts/images.mjs` `TARGETS`, or the
   `object-fit` in CSS will crop more than intended. Do **not** put it in
   `public/` — that directory is copied verbatim into `dist/`.
2. **Run `npm run images`.** This writes AVIF + WebP variants to `public/img/`
   and regenerates `src/data/images.js` with dimensions measured from the real
   file. That manifest is what gives every `<img>` correct `width`/`height`.
3. **If the hero changed**, run `npm run preloads`. The LCP `<link rel="preload">`
   in `index.html` is generated from the image manifest, and it must match the
   `<picture>` exactly. `verify:preloads` fails the build otherwise — and that
   mismatch is not hypothetical: a `href` pointing at `.webp` with an `imagesrcset`
   listing `.avif` made the browser download the preloaded file, discard it and
   fetch again.
4. **Run `npm run images:inspect`** to confirm dimensions, format and size per
   variant, then `npm run verify` and `npm run audit`.

Two things worth knowing before you shoot or select:

- **The hero is the LCP element on the homepage.** It is preloaded, eager, and
  `fetchpriority="high"`. A hero over ~250 KB will undo the image work; keep the
  source compressible (a flat photo, not a heavily compressed JPEG).
- **The current hero contains Chinese/Japanese signage** in the background. It
  is visible at desktop widths and reads as a mistake to anyone who notices it.
  Replacing it is a small task with a disproportionate effect on credibility.

### Caching

`/assets/*` filenames are content-hashed, so they are safe to cache forever
(`Cache-Control: public, max-age=31536000, immutable`). `/img/*` filenames are
**not** hashed — they are stable across builds — so use a shorter TTL
(`max-age=604800`) or add a cache-busting query string when you re-process them.
`/index.html` should never be cached (`no-cache`).

## Environment

The deployed origin lives in **`.env.production`**, which is committed:

```
VITE_SITE_URL=https://fire-fighting-weld.vercel.app
```

This one variable drives every absolute URL on the site — `<link rel="canonical">`,
`og:url`, `og:image`, the JSON-LD `@id` values, `sitemap.xml` and the `Sitemap:`
line in `robots.txt`. **Origin only**: no path, no trailing slash. A trailing
slash is harmless in practice — `src/seo/site.js` normalises through
`new URL(raw).origin` — but the canonicals themselves are emitted without one,
so write it that way.

A wrong value here is worse than none. Canonical tags tell search engines which
URL is authoritative, so a wrong one actively consolidates your pages onto an
address you do not control. `assertSiteUrl()` in `src/seo/site.js` throws if it is
missing, and the prerender step calls it before writing anything to `dist/`.

### It is committed on purpose

The value is a public URL that ends up baked into every page's HTML. It is not a
secret, and gitignoring it would only mean a build that silently falls back to
root-relative canonicals — the exact failure `assertSiteUrl()` exists to prevent.

`scripts/load-env.mjs` reads it into `process.env` for the two build steps that
run under plain Node. This is not incidental: `build:prerender` writes every
canonical and `build:crawl` writes the sitemap, and **neither goes through Vite**,
so without the loader a committed `.env.production` was silently ignored by
precisely the steps that depend on it most. A real environment variable always
wins over the file, so a Vercel project variable can override it without an edit.

### When the real domain replaces the Vercel URL

Change it in `.env.production`, and in the Vercel project's environment variables
**if one is set there** — the variable wins over the file. Then rebuild:

```bash
npm run build && npm run verify
```

`verify:deploy` compares the declared origin against the canonicals actually
baked into `dist/` and fails on a mismatch, so a build that did not pick up the
change is caught rather than deployed.

### Vercel

`vercel.json` must sit in the **project root**. Vercel does not read it from the
build output — a copy in `dist/` is served as a static file at `/vercel.json` and
its `cleanUrls`, `trailingSlash` and `headers` settings are silently ignored.
`npm run deploy:config` writes it to both places, and `verify:deploy` fails if
the root copy is missing.

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

## Deployment

```bash
npm run deploy:config    # generate host configs into public/
npm run build            # client -> ssr -> prerender -> crawl
npm run verify:deploy    # check dist/ before shipping
```

Deploy the **contents of `dist/`** — not the repository, and not `public/`.
`dist/` contains the 19 prerendered routes, the 404 document, hashed assets,
`sitemap.xml`, `robots.txt` and the host configs.

### The one rule that matters

This is a **prerendered** site: `/about` exists as a real file. If your host has
a catch-all SPA rewrite — `/* → /index.html` — then every route silently serves
the **homepage**, with the homepage's title and canonical on all 19 URLs. SEO
collapses to a single page and nothing errors to warn you.

You want the opposite: resolve real files first, let anything unmatched fall
through to `404.html` with a real 404 status.

Each route is written **twice** — `about.html` and `about/index.html` — because
hosts disagree about which one `/about` should map to. That makes the site work
whether your host does directory-index resolution or `cleanUrls`. It costs
~1.3 MB of deploy size and removes an entire class of silent failure.

| Host | What to do |
|---|---|
| **Netlify / Cloudflare Pages** | Nothing. Both resolve the directory form and serve a root `404.html` with a 404 status by default. `public/_redirects` adds cache headers only. **Do not** add an SPA rewrite. |
| **Vercel** | Nothing. `public/vercel.json` sets `cleanUrls`, `trailingSlash: false` and cache headers. |
| **Apache / cPanel** | Nothing. `public/.htaccess` sets `DirectoryIndex` and `FallbackResource /404.html` — `FallbackResource` only fires when nothing matched, so real routes are never intercepted. Works even with `mod_rewrite` disabled. |
| **GitHub Pages** | Nothing. It serves `404.html` with a 404 status and resolves `/about/`. Add a `CNAME` if you use a custom domain. No rewrite engine, so no config is possible. |
| **Nginx** | `try_files $uri $uri/ $uri.html =404;` then `error_page 404 /404.html;` |
| **Anything else** | Serve static files, resolve directories and the `.html` form, and return 404 with `404.html`. Then run `npm run verify:deploy`. |

### Cache headers

`/assets/*` filenames are content-hashed, so they are safe to cache forever
(`immutable`). `/img/*` filenames are **not** hashed — they are stable across
builds — so use a short TTL. HTML must never be cached, or visitors will keep
seeing a stale build. All four host configs set this; the rules are in
`public/_redirects`, `public/_headers`, `public/vercel.json`.

---

## Verifying a build

```bash
npm run verify     # lint + all 12 checks. This is the gate.
npm test           # negative tests for the schema validator
```

Every check exits non-zero on failure, so they work as CI gates. In CI, run
`verify:seo:strict` so a missing `VITE_SITE_URL` fails rather than warns.

| Command | Prevents |
|---|---|
| `verify:seo` | Duplicate or missing metadata; a fabricated address, the legacy UAE email, or an unverified NFPA citation reaching production |
| `verify:contrast` | A colour token falling below WCAG AA. Reads `:root` and resolves `rgb(var(--x))`, so it cannot drift from the stylesheet |
| `verify:fonts` | A render-blocking font `<link>` reappearing, a third-party font origin surviving into `dist/`, an `@font-face` src that does not exist |
| `verify:preloads` | The LCP preload drifting from the image manifest — the failure that made the hero *slower* |
| `verify:prerender:lazy` | A route lazy in `App.jsx` but missing from the SSR table, which would prerender 19 pages with correct metadata and an empty body |
| `verify:taxonomy` | `ServicesTabs.jsx` or `Gallery.jsx` disagreeing with `services.js` about which discipline a service belongs to — a hand-copied taxonomy with no compiler, so the navbar and the services page would show two different ones |
| `verify:cv` | `content-visibility` on the hero (stops the LCP painting) or without `contain-intrinsic-size` (trades one layout shift for another) |
| `verify:images` | An `<img>` in the built site with no explicit `width`/`height`. Lighthouse's `unsized-images` audit catches this but is **weight 0**, so `audit:all` — which gates on category scores only — can never fail on it |
| `verify:build` | Empty pages, duplicate titles, unresolved asset references, the two URL forms diverging |
| `verify:schema` | An invented or misshapen JSON-LD property, a missing required one, a nested object with no `@type` |
| `verify:deploy` | An SPA rewrite sneaking back into a host config, or a route missing a resolution form |
| `lint` | — |

The common thread is that each of these produces a site that **looks fine** and
scores 100 in a spot check. An unmaintained service index drops a service from
the navbar with no error. A stale preload downloads the wrong file. A route
mismatch ships blank pages behind valid titles. Every guard was negative-tested
by injecting the defect it exists to catch.

`services:index -- --check` also runs inside `verify`, failing if the generated
service index is stale.

## Measuring the scores

```bash
npm run audit
```

Serves the prerendered `dist/`, runs Lighthouse against it with simulated mobile
throttling, prints the category scores, the Core Web Vitals and every audit
below full marks with its estimated saving, then shuts down. `npx --yes
lighthouse@12` is used, so nothing is added to `dependencies`.

**Do not audit `npm run dev`.** The dev server is not the site. A run against
`localhost:5173` reports on unminified source modules, has no `robots.txt` and no
absolute canonical, and includes Vite's own injected markup — Vite's
error-overlay button alone fails the `button-name` accessibility audit. It
understates the real scores and sends you chasing problems that do not exist on
the deployed site. Measured on the same Lighthouse version:

| | dev server | `npm run audit` (`dist/`) |
|---|---|---|
| Performance | 44 | **94** |
| Accessibility | 91 | **100** |
| Best practices | 96 | **100** |
| SEO | 85 | **100** |

### Auditing every route

```bash
npm run audit:all
```

`npm run audit` measures one URL — the right number to quote, and the number
most likely to hide a problem, because a template change can wreck one route and
leave the other eighteen untouched. `audit:all` audits all 17 routes and gates
on thresholds: the homepage at 90 performance, the rest at 70, and **100 SEO /
95 accessibility everywhere with no allowance for either**.

Current state, all 17 routes: **94 / 100 / 100 / 100 average, CLS 0 on every
route.** The 13 service pages score marginally higher than the homepage because
they do not carry the hero image, which localises the remaining LCP cost to one
element on one route.

The same trap exists in the opposite direction. A Lighthouse run against the
live site from a browser with extensions installed scores **83 / 95 / 81 / 100**,
and every point of that difference is the measuring browser rather than the
site: `button-name` fails on a 0×0 px `button#open-side-panel` at the page
bottom, `deprecations` fails on an extension's deprecated `unload` listener, and
3 of the 6 long tasks — 392 ms — belong to extensions, which together cost
984 ms of main-thread time against the site's own 315 ms. Never quote a score
from a browser you have not cleaned out; `npm run audit` is headless for
exactly that reason.

Two other options: Chrome DevTools → Lighthouse tab (same engine, visual
breakdown), or [PageSpeed Insights](https://pagespeed.web.dev/) once deployed —
that one uses real field data from actual visitors, which is more authoritative
than any lab test.

### Known limitation: hero render delay

On the dev machine this measured LCP at ~2.9 s, with the phase breakdown
attributing ~85% to **render delay** on the hero image. On the live host it
measures **812 ms** (score 0.98) with 1,015 ms of element render delay, so the
delay is real but about a third of the size originally recorded — the dev
figure was inflated by the machine's CPU benchmark index, which Lighthouse
scales simulated render time by.

Ruled out by measurement, not assumption: render-blocking CSS (fixed), payload
(`unused-javascript` down to 41 KiB, all React), a double hero download (fixed,
2 requests → 1), CSS animations and the `Reveal` opacity gate (disabled both;
LCP unchanged), image loading, and discovery.

The browser has the image almost immediately and does not paint it for ~1 s.
That is a paint/compositing question and would need a real trace rather than
another Lighthouse run. **It is unresolved and deliberately left that way rather
than guessed at** — the metric passes, and it affects the homepage's LCP only.
The other 16 routes are unaffected.

Structured data has the same caveat in a different form: `verify:schema`
validates the vocabulary, not eligibility. [Google's rich-results
test](https://search.google.com/test/rich-results) is the authority on whether a
type earns a result, and it needs a live URL.

### What the SEO score does and does not tell you

It is a short technical checklist: title present, meta description present,
HTTP 200, links crawlable and descriptively worded, images have alt text,
`robots.txt` valid, canonical valid. **100 means the checklist is cleared, and
nothing more.** It does not measure rankings, and it is not what will earn
traffic. Lighthouse is a regression guard here, not a KPI.

For actual visibility, the scoreboard is Google Search Console — real
impressions and clicks per query, which is free. The single biggest *blocked*
ranking lever for this site is a confirmed physical business address, which
`PRODUCT.md` records as still missing; without it Google cannot show the
business in the local/Map Pack.

## Before every deploy

```bash
npm run build     # reads .env.production - no need to pass the URL inline
npm run verify    # 12 checks, all of which fail the build
```

If you are deploying somewhere other than the origin in `.env.production`, pass
it inline — a real environment variable overrides the file:

```bash
VITE_SITE_URL=https://your-domain.com npm run build
```

Then deploy the **contents of `dist/`**, and confirm `vercel.json` is in the
project root if the target is Vercel.

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

4. **The navbar logo is slightly squashed.** The master `assets-src/logo.png` is
   2132×738 (2.89:1) but `.brand img` renders it into a 120×50 box (2.4:1), so
   the wordmark is horizontally compressed by about 17%. The pipeline reproduces
   the current appearance rather than silently changing the brand — fix the box
   or the master, whichever is wrong.

5. **No quote delivery path.** `src/pages/Contact.jsx` shows a success message
   without sending anything.

6. **`500+ active AMC clients`** is unconfirmed and appears in the homepage stats.

7. **Project photography is still placeholders.** The gallery panels and service
   spotlights use illustrated medallions, not site photos (`TODO` comments in
   `src/pages/Gallery.jsx` and `src/pages/About.jsx`). `FeatureSplit` already
   accepts a manifest `imageId`, so real photos will pick up the responsive
   pipeline for free.

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
