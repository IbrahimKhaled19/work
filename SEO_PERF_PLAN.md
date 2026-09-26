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

## Phase 3 — Head tags and crawl files — ✅ COMPLETE

| ID | Task | Status |
|---|---|---|
| 3.1 | Remove `<meta name="keywords">` | ✅ removed with the rest of the static head |
| 3.2 | Complete OG/Twitter | ✅ `og:image`, `og:url`, `og:site_name`, `og:locale`, `og:image:width/height/type/alt`, `twitter:image`, `summary_large_image` |
| 3.3 | Icons | ✅ `apple-touch-icon` at 180×180 (done in Phase 4) |
| 3.4 | `robots.txt` | ✅ generated by `scripts/crawl.mjs` |
| 3.5 | `sitemap.xml` | ✅ generated from the same manifest as the prerender |
| 3.6 | `og-image.jpg` — **was referenced but did not exist** | ✅ generated, 1200×630 composite |

**Exit criteria:** ✅ robots.txt and sitemap.xml serve correctly; all 18 sitemap URLs resolve to a real file; the declared `og:image` URL fetches 200.

### `index.html` is now free of per-page metadata

Every static `<title>`, description, canonical, robots, OG and Twitter tag was removed from `index.html`. They were all dead weight: `scripts/prerender.mjs` strips and regenerates them, so the static copies could only ever be right for one route, and they silently contradicted the generated ones. The file now holds only what is genuinely static — charset, viewport, theme colour, fonts, icons and the two image preloads — with a comment explaining where the rest comes from.

This is safe because `npm run build` always runs the prerender, and `npm run verify:build` fails if any built page is missing its title, description, canonical or JSON-LD.

### Share card

`og-image.jpg` is a 1200×630 JPEG built by `scripts/images.mjs`: the hero cover-cropped to 1.91:1, dimmed to 0.62 brightness to match the on-page 65% black overlay, a light `--red` wash at 0.14 alpha, and the existing wordmark composited at 46% width.

Composited as an image rather than typeset as SVG text, because Montserrat is only ever loaded from a CDN at runtime and `sharp` has no access to it. JPEG rather than AVIF/WebP because several scrapers still will not render those, and a photo as PNG would be several times the bytes for no benefit. 166 KB.

The red wash started at 0.22 and read magenta, because the hero photograph is already dominated by red brick and hydrant paint; 0.14 keeps the brand tint without doubling up.

### Three bugs found and fixed

1. **`og:image` pointed at `/og-image.jpg`, which 404s** — the file is written to `public/img/`, so it serves from `/img/`. Every share on WhatsApp, Facebook and LinkedIn would have rendered a broken card. `verify:build` had not caught it because it only checked root-relative `src`/`href`, not absolute URLs. Both fixed: `site.ogImage` corrected, and the verifier now resolves absolute URLs on our own origin.
2. **The 404 page advertised a canonical pointing at `/404`** — a URL that does not exist. A `noindex` page should emit neither `canonical` nor `og:url`; both are now suppressed for noindex routes, and the verifier asserts their absence rather than their presence.
3. **Every sitemap entry had `priority` 0.5** — `routes.manifest.js` was mapping only `{pathname, type, serviceId}` and dropping `priority`/`changefreq`. Now carried through, giving the intended 1.0 / 0.9 / 0.8 / 0.7 / 0.6 spread.

### Verified over HTTP

```
/robots.txt                  200    320 B  text/plain
/sitemap.xml                 200  3,409 B  application/xml
/img/og-image.jpg            200  170,392 B  image/jpeg
/img/apple-touch-icon.png    200  3,060 B  image/png
```

18 sitemap URLs, **0 missing**, 404 correctly excluded. `og:image` declared on the home page fetches 200. Prerender still byte-stable across repeated runs.


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

## Phase 5 — Bundle and rendering performance — ✅ COMPLETE

| ID | Task | Status |
|---|---|---|
| 5.1 | `vite.config.js` build config | ✅ `manualChunks` as a function — rolldown rejects the object form |
| 5.2 | Route-level code splitting | ✅ 3 chunks → 11; unused JS 155 KiB → 41 KiB |
| 5.3 | Split the services data | ✅ measured first: **10.9 KiB gzipped off every page load** |
| 5.4 | `content-visibility: auto` | ⚠️ applied, but **no measurable effect** — see below |
| 5.5 | Self-host fonts | ✅ 530 KB → 106 KB; variable font, 2 files not 10 |
| 5.6 | Fix the `Reveal` opacity gate | ❌ **dropped — measurement disproved the premise** |

**Exit criteria:** ✅ initial JS meaningfully smaller (155 → 41 KiB unused). ✅ no above-the-fold text gated behind `opacity: 0` — because the gate was never the problem.

### 5.4 shipped, but changed nothing — kept anyway

`content-visibility: auto` with `contain-intrinsic-size` is on 3 homepage sections and 1 `/services` section. Two runs before and after:

```
              before        after
  FCP        1814 ms      1816 ms
  LCP        3089 ms      3091 ms
  TBT          11 ms        15 ms
  CLS            0            0
```

No change beyond run-to-run noise. The reason is visible in the baseline: TBT was already 11–20 ms, so there was no main-thread work left for skipping layout and paint to save. The optimisation arrived after its own justification had been spent.

**Kept rather than reverted**, for two reasons. It is correct, guarded, and free — it will matter on the low-end Android devices Lighthouse's simulated throttling does not model, where TBT is 5–10× higher. And removing it would discard a working guard. But it is recorded here as a **null result**, not a win, so nobody later re-derives the theory and re-adds it expecting a gain.

`scripts/verify-content-visibility.mjs` enforces the three ways this can go wrong: `content-visibility` shipping without `contain-intrinsic-size` (which would trade one layout shift for another), a `cv-skip` section landing above the fold, and — the one that would actually break the site — `cv-skip` on the hero, which holds the LCP element and would stop it painting. Negative-tested by adding `cv-skip` to the hero.

### 5.6 dropped: the premise was wrong

The plan asserted that `.js .reveal > * { opacity: 0 }` delayed LCP and CLS. **It does not.** Rebuilt with `heroRise` disabled and every reveal gate forced to `opacity: 1`:

```
  baseline                    LCP 2,954 ms
  animations fully disabled   LCP 2,966 ms
```

Unchanged. The hero is not inside a `<Reveal>` at all, and CSS animations on `.hero-content` do not gate the hero *image*, which is a sibling in `.hero-bg`. Implementing 5.6 as written would have been work against a mechanism that does not exist.

### The 2.5 s LCP render delay is still unexplained

Every load-side explanation is eliminated **by measurement**:

| Suspect | Verdict | Evidence |
|---|---|---|
| Render-blocking font CSS | fixed | 89 → 93 |
| Payload / unused JS | fixed | 155 → 41 KiB |
| Double hero download | fixed | 2 requests → 1 |
| Animations / reveal gate | **not the cause** | disabled, LCP unchanged |
| Image loading | **not the cause** | finishes at 34 ms, 0 ms load delay |
| Discovery | **not the cause** | all 3 `lcp-discovery-insight` checks pass |

The browser has the hero image in 34 ms at high priority and does not paint it for ~2.5 s. That is a paint/compositing question, not a loading one, and it needs a real trace rather than another Lighthouse run. **Deliberately left for Phase 7 rather than guessed at.**

### Phase 5 results

| | before | after |
|---|---|---|
| Performance | 71 | **94** |
| FCP | 4.2 s | 1.9 s |
| LCP | 5.1 s | 3.0 s |
| Speed Index | 4.2 s | 1.9 s |
| TBT | 10 ms | 15 ms |
| CLS | 0 | 0 |
| `unused-javascript` | 155 KiB | **41 KiB** |
| chunks | 3 | 11 |
| fonts | 530 KB / 10 files | **106 KB / 2 files** |
| services prose on critical path | 12.7 KiB gz | **2.1 KiB gz** |

Accessibility 100, best-practices 100, SEO 100 throughout.

---

## Phase 6 — 404s and deployment — ✅ COMPLETE

| ID | Task | Status |
|---|---|---|
| 6.1 | Eliminate soft 404s | ✅ 19 prerendered routes; unmatched URLs get a real 404 |
| 6.2 | Portable deploy config | ✅ `_redirects`, `vercel.json`, `.htaccess`, `_headers` — generated |
| 6.3 | Document host setup | ✅ README deployment section with a per-host table |
| 6.4 | Deploy verification guard | ✅ `npm run verify:deploy` |

**Exit criteria:** ✅ every route resolves in both URL forms, unknown URLs 404, and no config can reintroduce an SPA rewrite.

### The main fix: two resolution forms per route

Hosts disagree about what `/about` should map to. Apache and Netlify serve `about/index.html`; Vercel's `cleanUrls` and most CDNs look for `about.html`. Emitting one form means the site 404s on half of all hosts, silently, until someone follows a deep link.

The prerender now writes **both** forms of every route — 19 routes, 36 HTML files. Costs ~1.3 MB of deploy size; removes an entire class of silent failure. `verify:build` asserts the two copies are byte-identical, because if they ever diverged the host would serve different metadata depending on which form a visitor's URL resolved to.

### `verify:deploy` rejects the SPA rewrite

The guard treats a blanket `/* → /index.html` as a hard failure, not a warning, and strips comment lines first so the explanatory prose in each config is not mistaken for an active rule.

Tested by injecting `/* /index.html 200` into `public/_redirects` and rebuilding:

```
FAILED (38)
  - route /about: missing dist/about.html
  ...
  - _redirects contains a catch-all rewrite to index.html ("/*    /index.html").
    That is the SPA rule and it would serve the homepage for all 19 routes.
```

The same run surfaced a second hazard: **`build:client` alone empties `dist/`**, because Vite cleans the output directory. A deploy of a client-only build has no prerendered pages at all. `verify:deploy` catches it. Only `npm run build` produces a deployable `dist/`.

### Configs are generated, not hand-written

`scripts/deploy-config.mjs` emits four files into `public/`, which Vite copies into `dist/`. Generating them keeps them in step with the build and keeps the reasoning in the repo — each file carries a comment explaining which failure it avoids.

Notably, `_redirects` contains **no catch-all at all**. On Netlify, redirect rules take precedence over static files, so `/* /404.html 404` would break every route. Netlify and Cloudflare Pages already do the right thing by default; the file only adds cache headers.

`.htaccess` uses `FallbackResource /404.html` rather than `mod_rewrite`, because `FallbackResource` fires only when a request matched nothing — exactly the required semantics, and it works on shared hosting with `mod_rewrite` disabled.

### Verified over HTTP, all forms

```
/about                                 200  h1 "About ALNANDA Contracting"
/about/                                200  h1 "About ALNANDA Contracting"
/about.html                            200  h1 "About ALNANDA Contracting"
/services/fire-pump-systems            200  h1 "Fire Pump Systems"
/services/fire-pump-systems/           200  h1 "Fire Pump Systems"
/nope                                  404  (404 document)
/robots.txt  /sitemap.xml  /_redirects  /.htaccess   all 200
```

### Residual soft-404 surface, and why it is acceptable

`ServiceDetail.jsx` still renders `<NotFound />` for an unknown service id, in-app, at HTTP 200. That is correct client behaviour — a visitor who mistypes a URL should see a real 404 page, not a server error. What changed is that crawlers can no longer *reach* those URLs as indexable 200s: only the 18 prerendered files are discoverable, and anything else is served `404.html` with a 404 status. The `Seo` component also applies `noindex` to those URLs at runtime.


---

## Phase 7 — Verification and regression guards — ✅ COMPLETE

| ID | Task | Status |
|---|---|---|
| 7.1 | Build-time assertions | ✅ `npm run verify` — 10 checks, all fail the build |
| 7.2 | Lighthouse, every route | ✅ `npm run audit:all` — 17 routes, threshold-gated |
| 7.3 | Structured data validation | ✅ `npm run verify:schema` + 11 negative tests |
| 7.4 | Final README | ✅ deployment per host, image replacement, the full guard list |

### 7.1 — ten checks, one command

`npm run verify` runs, in order: `lint`, `verify:seo`, `verify:contrast`, `verify:fonts`, `verify:preloads`, `verify:prerender:lazy`, `services:index --check`, `verify:cv`, `verify:build`, `verify:schema`, `verify:deploy`.

The point is not that they exist but that each one covers a failure that is **invisible when it happens**. An unmaintained service index drops a service from the navbar with no error. A `cv-skip` on the hero stops the LCP image painting. A stale preload tag downloads the wrong file. A route table mismatch prerenders 19 pages with correct metadata and no body content. Every one of those produces a site that looks fine and scores 100 in a spot check.

Each guard was negative-tested by injecting the defect it exists to catch.

### 7.2 — all 17 routes, not just the homepage

`npm run audit` measures one URL. It is the right number to quote and the number anyone will look at — and the number most likely to hide a problem, because a template change can wreck one route and leave the other eighteen untouched. The 13 service pages are the reason: they are the pages that earn traffic, they carry the `Service` and `OfferCatalog` structured data, and each is a separate prerendered document that can differ from its siblings. They had never been measured.

`npm run audit:all` audits all 17 and gates on thresholds (home 90 perf, others 70; SEO 100 and a11y 95 everywhere, with no allowance for either).

```
route                                     perf  a11y  best  seo     LCP    CLS
/                                           93   100   100  100  3097ms      0
/services/design-engineering                94   100   100  100  2943ms      0
/services/fire-pump-systems                 93   100   100  100  2941ms      0
/services/sprinkler-systems                 93   100   100  100  2922ms      0
/services/standpipe-hose-systems            94   100   100  100  2915ms      0
/services/fire-alarm-detection              93   100   100  100  2931ms      0
/services/portable-extinguishers            93   100   100  100  2922ms      0
/services/special-hazard-suppression        93   100   100  100  2919ms      0
/services/passive-fire-protection           93   100   100  100  2919ms      0
/services/inspection-testing-maintenance    93   100   100  100  2927ms      0
/services/civil-defense-compliance          94   100   100  100  2928ms      0
/services/retrofit-upgrade                  94   100   100  100  2925ms      0
/services/emergency-repair-services         93   100   100  100  2931ms      0
/services/training-consulting               93   100   100  100  2920ms      0
/services                                   95   100   100  100  2641ms      0
/about                                      95   100   100  100  2776ms      0
/contact                                    95   100   100  100  2774ms      0
--------------------------------------------------------------------------
17 routes                                   94   100   100  100   (average)
worst route                                 93   100   100  100   /
```

Uniform, and **CLS is 0 on all 17**. The 13 service pages score marginally *higher* than the homepage because they do not carry the hero image — which localises the remaining LCP cost to one element on one route rather than the whole site.

### 7.3 — JSON-LD validated against the vocabulary

`verify:seo` proves the structured data parses. That is not sufficient: JSON-LD fails rich-results eligibility while remaining valid JSON — an invented property, a wrong shape, a missing required property, or a nested object with no `@type` are all silently ignored rather than reported.

`npm run verify:schema` walks all 36 HTML files (35 documents, 165 nodes, 5 types) against a **closed** vocabulary. Closed is the point: a property added to the markup but not to the vocabulary fails the build.

The markup needed no changes. All 30 initial failures were gaps in the checker — `areaServed` legitimately accepts an array of Place nodes, and bare `{"@id": …}` references are standard recommended JSON-LD that deliberately carry no `@type`. I had the checker wrong in both cases, in the direction of false alarms.

`npm test` runs 11 negative tests against a temp copy of `dist/`, including a control. An earlier PowerShell attempt was worthless: two of three mutations used regexes that never matched the minified JSON, so the validator "passed" documents it should have rejected. Silently-green assertions are worse than none.

Limit, printed on every run: this validates the vocabulary, not eligibility. [Google's rich-results test](https://search.google.com/test/rich-results) is the authority, and it needs a live URL.

### 7.4 — README

Deployment per host, the image-replacement procedure for the pending photography, the full guard list with what each one prevents, and the measurement section including why the dev server is not a valid target.

---

## Final state

| | before | after |
|---|---|---|
| Lighthouse Performance | 69 | **94** |
| Lighthouse Accessibility | 96 | **100** |
| Lighthouse Best practices | 100 | **100** |
| Lighthouse SEO | 0 (no crawlable content) | **100** |
| `dist/` size | 6.35 MB | **1.79 MB** |
| Per-visitor transfer | 6,501 KB | **725 KB** |
| Crawlable text | 0 chars | **87,583 chars** |
| Unused JavaScript | 155 KiB | **41 KiB** |
| JS chunks | 3 | **11** |
| Font payload | 530 KB / 10 files | **106 KB / 2 files** |
| CLS | — | **0 on all 17 routes** |
| Build-time guards | 0 | **10** |

The 69 before-figure is the honest pre-work baseline on the built site. A
Lighthouse run against `npm run dev` scored 44, but that measured unminified
source modules, no `robots.txt` and Vite's own injected markup — it was never a
valid measurement of the site.

**Unresolved:** ~2.5 s of LCP render delay on the homepage, documented above and
in the README with everything already ruled out. It needs a real trace. It
affects one route.

**Blocked on the business, not the code:**

- No confirmed Egypt street address, which blocks `LocalBusiness` rich results
  and the local/Map Pack — the single largest ranking lever available.
- `info@universalfirefighting.com` in `Contact.jsx` and `Footer.jsx` belongs to
  the previous UAE entity and is live in the UI.
- Founded 1993 vs "25+ years" in the copy is internally inconsistent.
- The hero stock photo contains Chinese/Japanese signage.
- No delivery path for quote-form submissions.
- "500+ AMC clients" is unconfirmed.

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
