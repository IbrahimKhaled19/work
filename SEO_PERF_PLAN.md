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

## Phase 0 — Unblock and baseline — ✅ COMPLETE

| ID | Task | Status |
|---|---|---|
| 0.1 | Repair dependencies | ✅ `npm install` sufficed — no lockfile deletion needed |
| 0.2 | Record baseline | ✅ See below |
| 0.3 | Replace the stock Vite README | ✅ |

**Exit criteria:** ✅ `npm run build` exits 0 in 1.48s; `npm run preview` serves `dist/` correctly.

### What was actually wrong

A plain `npm install` fixed it — it reported `up to date in 8s` yet had silently restored:

- `node_modules/.bin/` (12 shims) — the directory did not exist at all, which is why `npm run build` reported `'vite' is not recognized`
- `@rolldown/binding-win32-x64-msvc` — the native binary, absent because of npm's optional-dependency bug ([npm/cli#4828](https://github.com/npm/cli/issues/4828))

So the fix was non-destructive: `package-lock.json` was kept, and no version pinning was lost. Worth remembering for any future dependency trouble in this repo — deleting the lockfile is the usual advice and was not necessary here.

### Baseline (before any optimisation)

Captured from a clean `npm run build`:

| Metric | Value |
|---|---|
| Build time | 1.48s, 111 modules, exit 0 |
| **`dist/` total** | **6.35 MB** |
| Copied `public/` assets | 5.89 MB — **93% of the deployed payload** |
| JS | **1 chunk**, 425 KB raw / **132.6 KB gzip** |
| CSS | **1 chunk**, 40 KB raw / 8.4 KB gzip |
| HTML | 2.2 KB raw / 0.85 KB gzip |
| Code splitting | **none** — 1 JS chunk, 1 CSS chunk |
| Largest single file | `logos/gacp-egypt-logo-hd.png` 3,779 KB (renders at 148×165) |
| Second largest | `hero-fire-protection.webp` 1,194 KB (the LCP element) |
| Served `<body>` | `<div id="root"></div>` — no content without JS |

The 132.6 KB gzip JS figure is the number Phase 5 works against. The empty `<body>` is the number Phase 2 works against; it was confirmed directly in the built `dist/index.html`, not inferred.

### Targets to beat

| Metric | Baseline | Target |
|---|---|---|
| gzip JS | 132.6 KB | < 70 KB |
| JS chunks | 1 | 6+ (route-level) |
| `public/` + `dist/` | 6.35 MB | < 1 MB |
| `gacp-egypt-logo-hd.png` | 3,779 KB | < 10 KB |
| `hero-fire-protection.webp` | 1,194 KB | < 150 KB total across `srcset` |
| Crawlable body content | empty | full text on all 18 routes |


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

## Phase 2 — Prerendering (the critical fix) — ✅ COMPLETE

| ID | Task | Status |
|---|---|---|
| 2.1 | Router made injectable — `App.jsx` is routes-only | ✅ |
| 2.2 | `src/entry-server.jsx` — `render(url)` via `renderToString` + `StaticRouter` | ✅ |
| 2.3 | `src/routes.manifest.js` — single source of truth for routes + output paths | ✅ |
| 2.4 | `scripts/prerender.mjs` — SSR build, head injection, 19 files written | ✅ |
| 2.5 | SSR-safety audit | ✅ no changes needed |
| 2.6 | npm scripts chained: `build` = client → ssr → prerender | ✅ |
| 2.7 | Verify output | ✅ `scripts/verify-build.mjs` + `scripts/inspect-prerender.mjs` |

**Exit criteria:** ✅ 19 pages with real content; **Lighthouse SEO 0.83 → 1.0**; accessibility and best-practices both 1.0.

### Results

| Metric | Before | After |
|---|---|---|
| Crawlable body text | 0 characters | **87,583 characters** across 19 pages |
| HTML files emitted | 1 (empty shell) | 19 |
| Unique `<title>` | 1 | **19** |
| Unique `rel=canonical` | 0 | **19** |
| **Lighthouse SEO** | **0.83** | **1.00** |
| Lighthouse accessibility | 0.96 | 1.00 |
| Lighthouse best-practices | 1.00 | 1.00 |

Verified by raw HTTP fetch with **no JavaScript executed** — the actual crawler scenario:

```
/                            200  74,179 B  h1 "Complete fire protection, engineered to code…"
/about                       200  65,057 B  h1 "About ALNANDA Contracting"
/services                    200 105,764 B  h1 "Complete Fire Protection Systems…"
/services/fire-pump-systems  200  68,626 B  h1 "Fire Pump Systems"
/nope-does-not-exist         404  (404 document)
```

### SSR-safety audit — no changes required

`Reveal` initialises `visible` to `true` when `IntersectionObserver` is undefined, and `CountUp`'s `showFinalValue()` returns `true` when `window` is undefined, so both already emit their final state to a string renderer. `BackToTop` returns `null` before its effect runs. `useEffect` never executes under `renderToString`. The prerendered HTML therefore contains `is-visible` on every reveal and real values in the stat counters.

### The deployment trap this exposed

`vite preview` applies an **SPA fallback**, so it served the homepage for `/about`, `/contact` and every other route — each carrying the homepage's title and canonical. Prerendering would have been silently defeated.

`scripts/serve-dist.mjs` was written to serve `dist/` the way static hosting does (directory-index resolution, real 404s) and is what the verification above used. **Any host configured with a blanket `/* → /index.html` rewrite will break this site the same way.** Phase 6 must emit rewrite rules that resolve directories first and only fall through to `404.html`.

### Three bugs found and fixed during verification

1. **Carousel heights collapsed to 44px** (regression from Phase 4). `LogoCarousel` read `logo.displayHeight`, but the rewritten `LOGOS` entries only carry `{ name, id }`, so every height rendered as `height:undefinedpx` and the CSS `height: 44px` default took over. Logos meant to be 52/64/84/96px tall were all flat. The browser check looked plausible — every logo *was* 44px tall — so it passed unnoticed until the prerendered markup exposed the literal `undefined`. Fixed by reading `displayHeight` from the generated manifest instead of duplicating it, with a dev warning and a null guard.
2. **Prerender was not idempotent.** React 19's `renderToString` hoists a `<link rel="preload">` for every eager `<img>` into the body. Re-running the prerender used its own output as the template, appending another copy of the head block and 16 more preload links (+2,812 bytes per run). Fixed by having `build:client` save a pristine template to `.cache/prerender-template.html` via `scripts/save-template.mjs`, and by anchoring the root replace to `</body>`. Three consecutive runs now produce byte-identical output.
3. **React's hoisted preload landed inside `<body>`.** Extracted and relocated into `<head>` alongside the other preloads.

### Guards added

- `npm run verify:build` — fails on empty body, duplicate title/canonical, missing or unparseable JSON-LD, a localhost canonical, a missing asset, or a 404 page that is not `noindex`.
- `npm run inspect-prerender` (`scripts/inspect-prerender.mjs`) — character-encoding integrity (`·`, `→`, `©`, no U+FFFD), no `undefined` in output, no preload hoisted into `<body>`, CSS inlined exactly once. This is what caught bug 1.


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

## Phase 4 — Image pipeline — ✅ COMPLETE

Current `public/` at audit time: **5.89 MB**, of which ~5.1 MB was 6 files.

| ID | Task | Status |
|---|---|---|
| 4.1 | `scripts/images.mjs` + `sharp`, responsive variants + manifest | ✅ |
| 4.2 | Hero → responsive set | ✅ 640/1024/1600/2560, AVIF + WebP |
| 4.3 | GACP certification seal | ✅ 3,779 KB → 9.4 KB per visitor |
| 4.4 | Brand logo | ✅ 166 KB → 12.4 KB, size pinned by CSS |
| 4.5 | 13 client logos | ✅ 5 passed through, 8 optimised |
| 4.6 | Fix `LogoCarousel` | ✅ 52 → 26 images, inverted sizing logic removed |
| 4.7 | `<picture>` + dimensions + priority on every `<img>` | ✅ via `<Picture>` |
| 4.8 | Preload correctness | ✅ `imagesrcset`/`imagesizes` now mirror the rendered `<picture>` |
| 4.9 | Cache-header guidance | ✅ documented in README |

**Exit criteria:** ✅ `dist/` 6.35 MB → **1.79 MB**; 0 broken images; hero 1,194 KB → 26–367 KB depending on viewport.

### Measured results

| Metric | Before | After |
|---|---|---|
| `dist/` total | 6.35 MB | **1.79 MB** (−72%) |
| `public/img/` deployed | — | 1,353 KB in 34 files |
| Hero, per visitor | 1,194 KB flat | **26 KB** (mobile) – 367 KB (2560px desktop) |
| GACP seal, per visitor | 3,779 KB | **9.4 KB** (−99.8%) |
| Client logo strip | ~1.1 MB | ~88 KB |
| `<img>` elements on Home | 55 | 29 |

All 25 distinct image URLs verified to resolve over HTTP; 0 broken; Lighthouse accessibility **1.0** and best-practices **1.0** (unchanged).

### Design decisions worth recording

- **Sources moved to `assets-src/`.** Anything in `public/` is copied verbatim into `dist/`, so a master sitting there ships to every visitor. SVGs that were already optimal (`favicon.svg`, `logo.svg`, `Panda.svg`) stayed in `public/`.
- **AVIF + WebP only, no PNG tier.** On the small logos the PNG output was frequently the *largest* of the three (logo-mc: png 3.1 KB vs avif 3.5 KB), so a third format was pure deploy cost. WebP has been universally supported since 2020.
- **Passthrough under 14 KB.** Re-encoding a 1.6 KB PNG produced three files totalling more than the original. Five logos (carina, decorama, mc, temsco, msrya) now pass through untouched rather than regressing.
- **Carousel reduced to 2 copies.** The track animates `translateX(-50%)`, so it needs exactly 2× the visible content. One set measures ~1,948px, so two copies (3,897px measured in-browser) exceed any realistic viewport. The old 4 copies cost 26 extra `<img>` elements for nothing.
- **`.logo-item img` sizing fixed.** The stylesheet sets `height: 44px; width: auto`, which the component was fighting with explicit width *and* height. The old ternary (`logo.width ? logo.height : logo.height`) also meant logos without a declared width got no height at all. Now only `height` is set inline, so width derives from each logo's real aspect ratio — which reproduces the originally intended widths exactly (decorama 139px, fei 90px, united 99px, zh 72px all match the old hardcoded values).

### Regression found and fixed during verification

`<Picture>` initially used the largest variant's intrinsic size for the `width`/`height` attributes. Because `.brand img` has **no CSS rule at all**, the navbar logo rendered at 240×100 — double its intended 120×50. Caught by measuring `getBoundingClientRect()` in a real browser, not by the build. Fixed by pinning `.brand img { width: 120px; height: 50px }`.

### A note on `naturalWidth`

In-browser, several images report `naturalWidth` ≈ 1000 despite files being e.g. 180×128. This is **correct per spec**, not a bug: with `w` descriptors and no `sizes`, the slot defaults to `100vw`, so the browser density-corrects against the 1000px viewport. Rendered dimensions were confirmed aspect-correct in every case. Single-candidate `srcset`s are now omitted entirely, which sidesteps the ambiguity.

### Still outstanding (Phase 5 / 7)

- Hero is 1,011 KB across 8 files. Inherent to shipping a srcset; a visitor only ever downloads one. Could drop the 2560 tier if desired.
- The 65%-black hero overlay means the image is heavily obscured — AVIF quality could go from 50 to ~40 with likely no visible difference. Not changed without a visual A/B.
- `og-image.jpg` is referenced by `site.js` but does not exist yet; it needs generating from the hero at 1200×630.


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
Phase 0  (unblock + baseline)          ✅ done
   ↓
Phase 1  (metadata + JSON-LD)          ✅ done
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

**Prerendering is now unblocked.** It was the reason for deferring Phase 2 — the build now works, so it can be written and, more importantly, actually iterated on and verified.

## Git strategy

Revised after Phase 0: originally one branch per phase, which in practice produces
merge noise in a solo repo with no PR workflow. **Now: one working branch
(`phase/1-seo-metadata`) with one atomic commit per phase.** This preserves the
property that actually mattered — each phase is independently revertable — without
the branch churn. Rename to `seo-perf` if preferred.

Never mix phases in a single commit, so a regression bisects cleanly.


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
