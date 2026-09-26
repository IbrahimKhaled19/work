/**
 * Emit dist/sitemap.xml and dist/robots.txt.
 *
 * Both are generated rather than hand-written because both need the absolute
 * site origin, and a hand-maintained sitemap is guaranteed to drift from the
 * route table. The URL list comes from src/routes.manifest.js - the same
 * manifest scripts/prerender.mjs writes HTML from - so the sitemap can never
 * list a page that was not prerendered, or miss one that was.
 *
 * Run via `npm run build:crawl`, after the prerender.
 */
import fs from 'node:fs'
import path from 'node:path'

// Must come before site.js, which reads VITE_SITE_URL at import time. Plain
// node does not load .env files, so without this the sitemap would be written
// with no origin in it.
import './load-env.mjs'

import { routes, notFoundPath } from '../src/routes.manifest.js'
import { assertSiteUrl, site } from '../src/seo/site.js'

const DIST = path.join(process.cwd(), 'dist')
const siteUrl = assertSiteUrl()

// ---------------------------------------------------------------------------
// sitemap.xml
// ---------------------------------------------------------------------------
const today = new Date().toISOString().slice(0, 10)

const urls = routes
  .map((route) => {
    const loc = route.pathname === '/' ? `${siteUrl}/` : `${siteUrl}${route.pathname}`
    // The 404 is deliberately excluded: it is not a page, and submitting it
    // would invite a crawler to index an error document.
    return [
      '  <url>',
      `    <loc>${loc}</loc>`,
      `    <lastmod>${today}</lastmod>`,
      `    <changefreq>${route.changefreq || 'monthly'}</changefreq>`,
      `    <priority>${route.priority ?? 0.5}</priority>`,
      '  </url>',
    ].join('\n')
  })
  .join('\n')

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`

fs.writeFileSync(path.join(DIST, 'sitemap.xml'), sitemap, 'utf8')

// ---------------------------------------------------------------------------
// robots.txt
// ---------------------------------------------------------------------------
const robots = `# ${site.name} - fire safety and fire protection contractor, Egypt.
# Civil Defense approved. ${site.url}

User-agent: *
Allow: /

# Nothing here is private, but there is no value in indexing query-string
# variants of the same pages.
Disallow: /?*

Sitemap: ${siteUrl}/sitemap.xml
`

fs.writeFileSync(path.join(DIST, 'robots.txt'), robots, 'utf8')

// ---------------------------------------------------------------------------
// report
// ---------------------------------------------------------------------------
console.log(`\ncrawl files -> ${siteUrl}`)
console.log('-'.repeat(60))
console.log(`sitemap.xml   ${routes.length} URLs (404 excluded)`)
console.log(`robots.txt    sitemap reference + query-string block`)
console.log(`  not indexed : ${notFoundPath}`)
console.log('')
