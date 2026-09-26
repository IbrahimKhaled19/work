/**
 * Prerender every route to static HTML.
 *
 * Why this exists: the site is a client-rendered SPA, so the HTML a crawler
 * receives contains only <div id="root"></div>. Search engines and social
 * scrapers that do not execute JavaScript see nothing at all. This script
 * renders each route to a string in Node and writes a complete HTML document
 * per route.
 *
 * Pipeline:
 *   1. assert VITE_SITE_URL - refuse to emit wrong canonicals
 *   2. read the client build's index.html for Vite's hashed asset references
 *   3. read the built CSS
 *   4. for each route in src/routes.manifest.js: render, rebuild <head>, write
 *   5. write 404.html
 *
 * The CSS is inlined rather than linked. A <link> to the shared stylesheet is
 * cached after the first page but still blocks first paint on arrival; inlining
 * costs ~8 KB gzipped per page and removes the round trip entirely, so the
 * prerendered HTML is styled with zero blocking requests.
 *
 * Run via `npm run build` (which chains client -> ssr -> prerender).
 */

import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { prerenderTargets, notFoundPath } from '../src/routes.manifest.js'
import { getRouteMeta, notFoundMeta } from '../src/seo/routeMeta.js'
import { jsonLdFor } from '../src/seo/jsonld.js'
import { assertSiteUrl, site, canonicalFor } from '../src/seo/site.js'

const ROOT = process.cwd()
const DIST = path.join(ROOT, 'dist')
const SSR_ENTRY = path.join(ROOT, 'dist-ssr', 'entry-server.js')
// The pristine Vite output, saved by scripts/save-template.mjs. Reading this
// rather than dist/index.html is what makes repeated runs idempotent.
const TEMPLATE_PATH = path.join(ROOT, '.cache', 'prerender-template.html')

// ---------------------------------------------------------------------------
// 1. Refuse to emit wrong canonicals
// ---------------------------------------------------------------------------
const siteUrl = assertSiteUrl()
console.log(`\nprerendering to ${siteUrl}\n${'-'.repeat(60)}`)

// ---------------------------------------------------------------------------
// 2 + 3. Read the client build
// ---------------------------------------------------------------------------
if (!fs.existsSync(SSR_ENTRY)) {
  console.error(`  MISSING SSR BUNDLE: ${path.relative(ROOT, SSR_ENTRY)}`)
  console.error('  Run `vite build --ssr src/entry-server.jsx --outDir dist-ssr` first.')
  process.exit(1)
}

const templatePath = TEMPLATE_PATH
if (!fs.existsSync(templatePath)) {
  console.error('  MISSING .cache/prerender-template.html')
  console.error('  Run `npm run build:client` first (it saves the template).')
  process.exit(1)
}
const template = fs.readFileSync(templatePath, 'utf8')

const assetsDir = path.join(DIST, 'assets')
const cssFile = fs.existsSync(assetsDir)
  ? fs.readdirSync(assetsDir).find((f) => f.endsWith('.css'))
  : undefined
if (!cssFile) {
  console.error('  MISSING built CSS in dist/assets - cannot inline styles.')
  process.exit(1)
}
const css = fs.readFileSync(path.join(assetsDir, cssFile), 'utf8')

// ---------------------------------------------------------------------------
// Head construction
// ---------------------------------------------------------------------------

/**
 * Tags that are generated per route. Any pre-existing version is stripped from
 * the template first so the prerendered output is the only source of truth -
 * otherwise index.html's static tags would win and every page would ship the
 * same description.
 *
 * Stripping the JSON-LD block is what makes this script idempotent. Without it,
 * running the prerender twice reads the already-prerendered index.html as its
 * own template and injects a second copy of everything.
 */
const DYNAMIC_TAG_PATTERN =
  /<meta\s+(?:name|property)\s*=\s*"(?:description|robots|og:[^"]*|twitter:[^"]*)"[^>]*\/?>/gi
const CANONICAL_PATTERN = /<link\s+rel=["']canonical["'][^>]*\/?>/gi
const JSONLD_PATTERN = /<script\s+type=["']application\/ld\+json["']>[\s\S]*?<\/script>/gi
const TITLE_PATTERN = /<title>[\s\S]*?<\/title>/i
const HOISTED_LINK_PATTERN = /<link\s+rel="preload"[^>]*\/?>/g

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function buildHeadTags(meta, jsonLd) {
  const ogImage = `${siteUrl}${site.ogImage}`
  // A noindex page must not advertise a canonical or an og:url. The 404 has no
  // canonical of its own to point at, and emitting one produced a self-link to
  // a URL that does not exist.
  const isIndexable = !/noindex/i.test(meta.robots || '')

  const tags = [
    `<title>${escapeHtml(meta.title)}</title>`,
    `<meta name="description" content="${escapeHtml(meta.description)}" />`,
    `<meta name="robots" content="${escapeHtml(meta.robots)}" />`,
  ]

  if (isIndexable) {
    const canonical = meta.canonical || canonicalFor(meta.pathname || '/')
    tags.push(`<link rel="canonical" href="${escapeHtml(canonical)}" />`)
  }

  tags.push(
    `<meta property="og:type" content="${escapeHtml(meta.ogType || 'website')}" />`,
    `<meta property="og:site_name" content="${escapeHtml(site.name)}" />`,
    `<meta property="og:locale" content="${escapeHtml(site.locale)}" />`,
    `<meta property="og:title" content="${escapeHtml(meta.title)}" />`,
    `<meta property="og:description" content="${escapeHtml(meta.description)}" />`
  )

  if (isIndexable) {
    tags.push(`<meta property="og:url" content="${escapeHtml(meta.canonical || canonicalFor(meta.pathname || '/'))}" />`)
  }

  tags.push(
    `<meta property="og:image" content="${escapeHtml(ogImage)}" />`,
    // Explicit dimensions and type. Scrapers use these to lay the card out
    // before fetching the image, and a wrong declared size causes a visible
    // reflow in the feed. Values come from site.js so they cannot drift from
    // what scripts/images.mjs actually wrote.
    `<meta property="og:image:width" content="${site.ogImageWidth}" />`,
    `<meta property="og:image:height" content="${site.ogImageHeight}" />`,
    `<meta property="og:image:type" content="${site.ogImageType}" />`,
    `<meta property="og:image:alt" content="${escapeHtml(site.ogImageAlt)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escapeHtml(meta.title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(meta.description)}" />`,
    `<meta name="twitter:image" content="${escapeHtml(ogImage)}" />`,
    `<meta name="twitter:image:alt" content="${escapeHtml(site.ogImageAlt)}" />`
  )

  if (jsonLd) {
    // `</script>` inside a JSON string would terminate the block early.
    const safe = jsonLd.replace(/</g, '\\u003c')
    tags.push(`<script type="application/ld+json">${safe}</script>`)
  }

  return tags.join('\n    ')
}

/**
 * React 19's renderToString hoists resource hints it generates for eager
 * <img> elements and emits them at the start of the body. They are valid
 * there, but they belong in <head> alongside the other preloads, so lift them
 * out of the rendered markup and inject them with the rest of the head.
 */
function extractHoistedLinks(appHtml) {
  const hoisted = []
  const cleaned = appHtml.replace(HOISTED_LINK_PATTERN, (tag) => {
    hoisted.push(tag)
    return ''
  })
  return { cleaned, hoisted }
}

/**
 * Take the Vite-built template and produce a complete document for one route.
 */
function buildDocument({ pathname, appHtml, hoisted }) {
  const meta =
    pathname === notFoundPath
      ? { ...notFoundMeta, pathname, ogType: 'website' }
      : { ...getRouteMeta(pathname), pathname }

  if (!meta.title) {
    throw new Error(`no metadata resolved for "${pathname}"`)
  }

  const jsonLd = pathname === notFoundPath ? null : jsonLdFor(pathname)

  let html = template

  // Strip the static versions so they cannot contradict the generated ones.
  html = html.replace(DYNAMIC_TAG_PATTERN, '')
  html = html.replace(CANONICAL_PATTERN, '')
  html = html.replace(JSONLD_PATTERN, '')

  // Replace the single static <title>.
  html = html.replace(TITLE_PATTERN, '')

  // Inline the app stylesheet. This carries the @font-face rules for the
  // self-hosted Montserrat along with it, so the preload scanner finds the
  // font files in the inlined CSS and no blocking <link> is needed anywhere.
  // There is deliberately no font-CDN <link> left in index.html to preserve.
  html = html.replace(
    /<link\s+rel="stylesheet"[^>]*href="\/assets\/[^"]*"[^>]*>/i,
    `<style>${css}</style>`
  )

  // Vite 8 (rolldown) emits a BARE `<link rel="stylesheet">` with no href
  // alongside the real one. It is a bundler artifact, it is still
  // render-blocking, and the substitution above cannot match it because it has
  // no href to match on - so it survived into every prerendered page and
  // blocked the first paint for a stylesheet that was never requested.
  //
  // This was the last render-blocking resource on the site, and it was
  // invisible: the page looked correct, Lighthouse reported the CSS as inlined,
  // and the tag had no href to inspect.
  html = html.replace(/<link\s+rel="stylesheet"\s*\/?>/gi, '')

  // Insert the generated head tags just before </head>.
  const headBlock = [...hoisted, buildHeadTags(meta, jsonLd)].join('\n    ')
  html = html.replace('</head>', `    ${headBlock}\n  </head>`)

  // Hydration target. Matched all the way to </body> rather than only the
  // empty <div id="root"></div>, so re-running the prerender over its own
  // output replaces the previous render instead of leaving it in place.
  html = html.replace(
    /<div id="root">[\s\S]*?<\/body>/,
    `<div id="root">${appHtml}</div>\n  </body>`
  )

  return { html, meta }
}

// ---------------------------------------------------------------------------
// 4 + 5. Render every route
// ---------------------------------------------------------------------------
const { render } = await import(pathToFileURL(SSR_ENTRY).href)

let written = 0
let totalBytes = 0
const writtenFiles = []
const report = []

for (const target of prerenderTargets) {
  const { html: rendered } = render(target.pathname)
  const { cleaned: appHtml, hoisted } = extractHoistedLinks(rendered)
  const { html, meta } = buildDocument({ pathname: target.pathname, appHtml, hoisted })

  // Guard against a silently empty render - the exact failure this whole
  // phase exists to prevent, so it must never pass unnoticed.
  const textLength = appHtml
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim().length
  if (textLength < 200) {
    throw new Error(
      `render for "${target.pathname}" produced only ${textLength} characters of text. ` +
        'The prerender would ship an empty page.'
    )
  }

  // The same document is written in both resolution forms so the site works
  // whether the host looks for <route>.html or <route>/index.html.
  let bytes = 0
  for (const outFile of target.outFiles) {
    const outPath = path.join(DIST, outFile)
    fs.mkdirSync(path.dirname(outPath), { recursive: true })
    fs.writeFileSync(outPath, html, 'utf8')
    bytes = Buffer.byteLength(html)
    writtenFiles.push(outFile)
  }

  written += 1
  totalBytes += bytes
  report.push({
    outFile: target.outFiles[0],
    alsoAs: target.outFiles.length > 1 ? target.outFiles[1] : null,
    bytes,
    textLength,
    title: meta.title,
  })
}

const pad = (v, n) => String(v).padEnd(n)
const lpad = (v, n) => String(v).padStart(n)

console.log(`${pad('route', 34)}${pad('also written as', 32)}${lpad('text', 8)}${lpad('html', 9)}`)
console.log('-'.repeat(92))
for (const row of report) {
  console.log(
    pad(row.outFile, 34) +
      pad(row.alsoAs || '-', 32) +
      lpad(row.textLength, 8) +
      lpad((row.bytes / 1024).toFixed(1) + 'K', 9)
  )
}
console.log('-'.repeat(92))
console.log(
  `${pad(`${written} routes`, 34)}${pad(`${writtenFiles.length} files`, 32)}` +
    lpad('', 8) +
    lpad((totalBytes / 1024).toFixed(0) + 'K', 9) +
    '   (per-route size, not the doubled total)'
)
console.log('')
