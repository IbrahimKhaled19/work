# SEO & Performance Plan — ALNANDA Contracting

Audit source: source review of `index.html`, `src/**`, `public/**`, `vite.config.js`.
Status: **planned, not started.**

Decisions taken:
- **Prerender** via a hand-rolled Node script (`vite build --ssr` + `react-dom/server`). No new runtime dependency.
- **Deploy target** undecided → portable config: `_redirects`, `vercel.json`, `.htaccess` + documented single-line host setup.
- **Images** via a build-time `sharp` pipeline (responsive `srcset`, AVIF/WebP).

Scale: 18 prerendered routes + a 404 page. 6 components, 6 pages, 1 data module, 5.89 MB of `public/`.

---

## Blockers — all cleared

Verified reachable: npm registry (HTTP 200) and `fonts.gstatic.com` (root returns 404, but DNS/TLS/HTTP all succeed — host is up).

| # | Blocker | Affects | Status |
|---|---|---|---|
| B1 | `node_modules` is corrupt — `.bin/` shims missing, rolldown native binding absent | Everything | Cleared — reinstall will work |
| B2 | `sharp` needs a network install | Phase 4 | Cleared — registry reachable |
| B3 | Self-hosting Montserrat needs to download woff2 files | Task 5.5 | Cleared — `fonts.gstatic.com` reachable |

No blockers remain. Phase 0 can start.

---

## Phase 0 — Unblock and baseline

| ID | Task | Notes |
|---|---|---|
| 0.1 | Repair dependencies | Delete `node_modules` + `package-lock.json`, `npm i`. Verify `npm run build` and `npm run preview` succeed. |
| 0.2 | Record baseline | Capture per-chunk JS/CSS sizes from `dist/`, and the 5.89 MB `public/` breakdown. Needed to prove the improvements are real. |
| 0.3 | Fix the stock README | Replace the Vite template README with build/deploy docs. Cheap, do it now. |

**Exit criteria:** `npm run build` produces `dist/`, baseline numbers recorded.

---

## Phase 1 — SEO metadata layer (single source of truth) — ✅ COMPLETE

Do this *before* prerendering so the prerenderer has one place to pull head tags from.

| ID | Task | Status |
|---|---|---|
| 1.1 | Site URL config — `VITE_SITE_URL`, `assertSiteUrl()`, `.env.example`, `.gitignore` | ✅ |
| 1.2 | `src/seo/site.js` — NAP + brand constants, grouped by claim safety | ✅ |
| 1.3 | `src/seo/routeMeta.js` — `getRouteMeta()`, 18 unique title/description/canonical pairs | ✅ |
| 1.4 | `src/seo/jsonld.js` — `GeneralContractor`, `WebSite`, `WebPage`, `Service`, `OfferCatalog`, `BreadcrumbList` | ✅ |
| 1.5 | `src/components/Seo.jsx` — runtime head sync, mounted in `Layout` | ✅ |
| 1.6 | `scripts/verify-seo.mjs` — dependency-free assertions, `npm run verify:seo[:strict]` | ✅ |

**Exit criteria:** ✅ 18 unique titles, 18 unique descriptions, 18 unique canonicals, 18 valid JSON-LD documents. Lint-clean. Runs under plain Node with no build.

### Phase 1 findings that shaped the implementation

Driven by `PRODUCT.md`'s claim-safety rules, four things a normal `LocalBusiness` markup would include are **deliberately absent**, and `verify-seo.mjs` asserts their absence so a future edit can't reintroduce them:

| Omitted | Why |
|---|---|
| `address` / `PostalAddress` | No Egypt street address confirmed. Costs LocalBusiness rich-result eligibility, but a wrong address would misdirect local searchers. |
| `email` | `info@universalfirefighting.com` is the **previous UAE entity's domain** (Universal Fire Fighting, Abu Dhabi). It is still shown in the UI but must not be published in markup. **Business action needed — see below.** |
| `sameAs` | Footer social links are `href="#"` placeholders. |
| NFPA 72/10/2001/96/11/80 + "UL-listed" | `PRODUCT.md` marks these UNVERIFIED. 4 services cite only unverified standards, so `verifiedStandards()` returns `null` and they carry **no** standards claim at all. |

Two content issues surfaced while tracing the NAP data, both needing a business decision:

1. **The contact email belongs to a different company.** Git history shows the site was reskinned from a UAE entity ("Universal Fire Fighting", `+971 2 551 3111`, Mussafah 32/1 Abu Dhabi) to ALNANDA Contracting. The phone number was correctly migrated to `+20 100 362 0490`, but the email domain was not. It is currently a dead-end for customers and is excluded from schema here.
2. **Founding year tension.** `founded: 1993` is confirmed, which implies ~33 years as of 2026, but every claim in the UI says "25+ years". `PRODUCT.md` flags this as unresolved. `site.js` keeps `yearsExperience: '25+'` and does not derive a number from `founded`.

Still placeholders that SEO must not touch until supplied: `ogImage` (`/og-image.jpg`, created in Phase 4), `legalName`, `address`, `social`.


---

## Phase 2 — Prerendering (the critical fix)

| ID | Task | Notes |
|---|---|---|
| 2.1 | Make the router injectable | `App.jsx` currently owns `<BrowserRouter>` (`App.jsx:13`). Extract the `<Routes>` tree so both `main.jsx` (BrowserRouter) and a new server entry (StaticRouter) can mount it. `Layout` uses `useLocation` and works under both. |
| 2.2 | `src/entry-server.jsx` | Exports `render(url) → { html, head }` via `renderToString` + `StaticRouter`. |
| 2.3 | `src/routes.manifest.js` | Derive the route list from `serviceSections` (13) + the 5 static routes + `/`. **Single source of truth** — consumed by the prerenderer *and* the sitemap generator, so they can never drift. |
| 2.4 | `scripts/prerender.mjs` | SSR build → render each route → inject head → emit `dist/<route>/index.html` + `dist/404.html`. Inline the emitted CSS so first paint needs zero blocking requests. |
| 2.5 | SSR-safety audit | `useEffect` does not run in `renderToString`, so window access is mostly safe, but verify: `Navbar` scroll listener, `Layout` scroll effect, `main.jsx:6` `js` class, `Reveal` (`IntersectionObserver` undefined → `visible: true`, good), `CountUp` (`typeof window === 'undefined'` → final value, good), `Footer` `new Date()`. |
| 2.6 | Wire npm scripts | `build` = client → ssr → prerender. `preview` serves the prerendered `dist/`. |
| 2.7 | Verify output | For all 19 files assert: non-empty `<body>` content, correct `<title>`, unique description, canonical present, JSON-LD parses, all `/assets/*` references resolve on disk. |

**Exit criteria:** `view-source:` on any route shows full content with no JS execution.

---

## Phase 3 — Head tags and crawl files

| ID | Task | Notes |
|---|---|---|
| 3.1 | Remove `<meta name="keywords">` | `index.html:17-20`. Ignored since 2009. |
| 3.2 | Complete OG/Twitter | Add `og:image`, `og:url`, `og:site_name`, `og:locale`, `twitter:image`; change `twitter:card` from `summary` to `summary_large_image` (`index.html:32`). |
| 3.3 | Icons | Add `apple-touch-icon` alongside the existing `favicon.svg`. |
| 3.4 | `robots.txt` | Static, with `Sitemap:` absolute URL from `VITE_SITE_URL`. |
| 3.5 | `sitemap.xml` | Generated from the Task 2.3 manifest. |

**Exit criteria:** every share preview renders a large image card; sitemap lists exactly the 19 real URLs.

---

## Phase 4 — Image pipeline (biggest performance win)

Current `public/`: **5.89 MB**, of which ~5.1 MB is 6 files.

| ID | Task | Notes |
|---|---|---|
| 4.1 | `scripts/images.mjs` + `sharp` | Dev dependency. Inspect source dimensions first, then emit responsive variants + a manifest. |
| 4.2 | Hero → responsive set | Source `hero-fire-protection.webp` is **1,194 KB** and is the LCP element on Home (`index.html:22` preload, `Home.jsx:76`). Emit AVIF + WebP at ~640/1024/1600/1920. **Biggest single win.** |
| 4.3 | GACP certification seal | `gacp-egypt-logo-hd.png` is **3,779 KB** rendered into a 148×165 box (`ProofBand.jsx:51-56`) — ~26× oversized. Target <10 KB at 2×. |
| 4.4 | Brand logo | `logo.png` is 166 KB for a declared 120×50 (`Navbar.jsx:63`). Also has no `loading`, `fetchpriority`, or `srcset` despite being above the fold. |
| 4.5 | 13 client logos | `FEI.png` 252 KB, `ZH.png` 144 KB, `United.png` 118 KB, `Motahida.png` 109 KB. Mixed `.avif`/`.png`/`.jpg`/`.svg` with no `<picture>`. Normalize to WebP/AVIF at ~2× display height; leave SVGs as vectors. |
| 4.6 | Fix `LogoCarousel` | Renders **52 `<img>`** (13 × 4 copies, `LogoCarousel.jsx:20`) and lazy-loads the above-the-fold set. Cut duplication, and fix the inverted sizing logic at `LogoCarousel.jsx:34-37` where `height` is only applied when `width` is truthy — a CLS source. |
| 4.7 | `<picture>` + dimensions | Every `<img>` gets explicit `width`/`height` (CLS) and correct priority: eager+`fetchpriority="high"` for hero/nav logo, lazy for below-fold. Audit `FeatureSplit.jsx:24`, `ProofBand.jsx:53`, `Home.jsx:76`, `Navbar.jsx:63`. |
| 4.8 | Preload correctness | Reconcile the manual `<link rel="preload">` at `index.html:22` with `<picture>` + `imagesrcset` so the preloaded candidate matches what actually renders. |
| 4.9 | Cache headers | Document/implement long-lived immutable caching for hashed `/assets/*` and a shorter TTL for images. |

**Exit criteria:** `public/` under ~500 KB; hero under ~150 KB across the set; no `<img>` without dimensions.

---

## Phase 5 — Bundle and rendering performance

| ID | Task | Notes |
|---|---|---|
| 5.1 | `vite.config.js` build config | Currently 7 lines, no `build` options. Add `manualChunks` (react / react-router / phosphor / vendor), `assetsInlineLimit`, `cssCodeSplit`, and `build.target`. |
| 5.2 | Route-level code splitting | Zero `React.lazy` today. Lazy-load the 5 non-home routes behind `<Suspense>`; keep Home eager since it is the landing page. |
| 5.3 | Split the services data | `src/data/services.js` is 41.7 KB and is imported by `Navbar.jsx:4`, `Footer.jsx:5`, `Services.jsx:11`, `Gallery.jsx:7`, `ServiceDetail.jsx:9` — so all 13 services' prose is in the critical path of *every* page, including Home. Navbar/Footer only need `{id, title, category, short}`. Extract a light `serviceIndex.js`. **Measure gzip before/after** — prose compresses well, so confirm the actual win before restructuring further. |
| 5.4 | `content-visibility: auto` | Add to below-fold `<section>`s with `contain-intrinsic-size`, for the long Services/Home pages. |
| 5.5 | Self-host fonts | Replace the render-blocking Google Fonts `<link>` (`index.html:9-12`, 5 weights). Subset Montserrat to latin/latin-ext, `font-display: swap`, preload the 2 critical weights. **See B3.** |
| 5.6 | Fix the `Reveal` opacity gate | `index.css:122` sets `.js .reveal > * { opacity: 0 }` and `Reveal.jsx:5` defaults `visible: false` in every browser with `IntersectionObserver`. All above-the-fold content is invisible until React mounts + a 0.55s transition finishes — taxes LCP and CLS. Restrict `<Reveal>` to below-the-fold; render above-the-fold content statically. |

**Exit criteria:** initial JS meaningfully smaller; no above-the-fold text gated behind `opacity: 0`.

---

## Phase 6 — 404s and deployment

| ID | Task | Notes |
|---|---|---|
| 6.1 | Eliminate soft 404s | `ServiceDetail.jsx:34` renders `<NotFound/>` for any unknown id at **HTTP 200**, and `App.jsx:22` `path="*"` 200s on everything — an unbounded space of indexable "not found" pages. Prerendering fixes discovery (crawlers only see the 18 real files), and a proper `404.html` + host config supplies the correct status. |
| 6.2 | Portable deploy config | Emit `public/_redirects` (Netlify/Cloudflare), `vercel.json`, and `public/.htaccess` (Apache/cPanel) with the SPA fallback so deep-link hard refreshes don't 404. |
| 6.3 | Document host setup | README section: the one required line per host. |

**Exit criteria:** `/services/does-not-exist` returns a real 404; `/services/sprinkler-systems` survives a hard refresh.

---

## Phase 7 — Verification and regression guards

| ID | Task | Notes |
|---|---|---|
| 7.1 | Build-time assertions | Fail the build on: empty `<body>`, duplicate `<title>`, missing canonical, unparseable JSON-LD, unresolved asset reference. Turns Phase 2/3 from a one-time fix into a permanent guarantee. |
| 7.2 | Lighthouse | Run against `npm run preview`, before vs after, for Performance / SEO / Accessibility. |
| 7.3 | Structured data validation | Run the JSON-LD through a schema validator. |
| 7.4 | Final README | Build commands, deploy per host, image-replacement instructions for the pending real photography. |

---

## Execution order and rationale

```
Phase 0  (unblock + baseline)          ← gate for everything
   ↓
Phase 1  (metadata + JSON-LD)          ← must precede prerender; it feeds the head injection
   ↓
Phase 2  (prerender)                   ← the critical fix, biggest single SEO gain
   ↓
Phase 3  (head tags + sitemap)         ← cheap, completes Phase 1/2 story
   ↓
Phase 4  (images)                      ← biggest single performance gain
   ↓
Phase 5  (bundle + render)             ← refinements; measure before restructuring
   ↓
Phase 6  (404 + deploy)                ← depends on prerender output existing
   ↓
Phase 7  (verify + guard)              ← last, locks everything in
```

Phases 3 and 4 are independent of each other and could run in parallel. Phase 5's Task 5.3 is explicitly gated on a measurement, not on effort.

## Git strategy

`main` is clean. One branch per phase, each ending at a verified commit, so any phase can be reverted independently:

- `phase/0-unblock` · `phase/1-seo-metadata` · `phase/2-prerender` · `phase/3-head-crawl` · `phase/4-images` · `phase/5-perf` · `phase/6-deploy` · `phase/7-verify`

## Definition of done

- [ ] All 19 routes serve real HTML content with no JS execution
- [ ] 19 unique `<title>` / `meta description` / `rel=canonical`
- [ ] Valid `GeneralContractor` + `Service` + `BreadcrumbList` JSON-LD
- [ ] Working `sitemap.xml` + `robots.txt`; no `meta keywords`
- [ ] `public/` reduced from 5.89 MB to under ~500 KB
- [ ] Route-level code splitting; services prose out of the global critical path
- [ ] No above-the-fold content behind `opacity: 0`
- [ ] Self-hosted subset fonts, no render-blocking third-party CSS
- [ ] Unknown service URLs return HTTP 404
- [ ] Build-time assertions in place; Lighthouse deltas recorded
