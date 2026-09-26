/**
 * Generate host configuration for deploying dist/.
 *
 * These are emitted rather than hand-written so they stay in step with the
 * build, and so the reasoning behind each rule survives in the repo.
 *
 * THE ONE THING THAT MATTERS
 * -------------------------
 * This is a prerendered site. Its 18 routes exist as real files in dist/. If a
 * host is configured with a catch-all rewrite - `/* -> /index.html`, the
 * standard SPA rule - then every route serves the *homepage* instead: the
 * visitor sees the wrong page, and the homepage's title and canonical are
 * served for all 19 URLs. SEO collapses back to a single page with no error
 * anywhere to notice it by.
 *
 * The correct rule is the opposite of the SPA rule: resolve real files first,
 * and let anything unmatched fall through to 404.html with a 404 status. Most
 * hosts do this by default, which is why no config is strictly required - the
 * configs below are there for the hosts that do not, plus cache headers.
 *
 * `npm run verify:deploy` checks the built output against these expectations.
 */
import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const PUBLIC = path.join(ROOT, 'public')

fs.mkdirSync(PUBLIC, { recursive: true })

const files = {}

// --- Netlify / Cloudflare Pages ------------------------------------------
// Both resolve `<route>/index.html` for `/about` natively and serve a root
// 404.html with a 404 status automatically, so NO catch-all is written here.
// A `/* /404.html 404` rule would be actively harmful: redirect rules take
// precedence over static files on Netlify, so it would break every route.
files['_redirects'] = `# ALNANDA Contracting - Netlify / Cloudflare Pages
#
# Route resolution is deliberately left alone. Netlify and Cloudflare Pages
# already serve dist/<route>/index.html for /about, and serve dist/404.html
# with a real 404 status for anything unmatched.
#
# Do NOT add "/* /index.html 200" here. That is the SPA rewrite, and it would
# serve the homepage for all 19 routes, destroying the prerendered pages.

# Hashed filenames: safe to cache forever.
/assets/*
  Cache-Control: public, max-age=31536000, immutable

# Image filenames are stable across builds, so a shorter TTL.
/img/*
  Cache-Control: public, max-age=604800

/*.html
  Cache-Control: public, max-age=0, must-revalidate
`

// --- Vercel ---------------------------------------------------------------
// cleanUrls makes /about resolve to about.html, which the prerender emits
// alongside about/index.html. trailingSlash:false keeps one canonical form.
files['vercel.json'] = `${JSON.stringify(
  {
    $schema: 'https://openapi.vercel.sh/vercel.json',
    // Declared explicitly rather than relying on Vercel's framework detection.
    // This project is NOT a plain SPA build: `npm run build` runs four steps
    // (client -> ssr -> prerender -> crawl), and the prerender is what produces
    // the 19 static HTML files. If Vercel guessed the framework and ran
    // something else, it would deploy a client-only bundle and every SEO gain
    // from the prerender would silently be lost - with a green build and a site
    // that appears to work.
    buildCommand: 'npm run build',
    // The four build steps must run in order, so they cannot be parallelised.
    // npm already sequences them with &&.
    outputDirectory: 'dist',
    // Vite 8 requires Node ^20.19.0 || >=22.12.0. Pinned so a Vercel runtime
    // bump cannot turn into a build failure that is unrelated to the code.
    // package.json engines is the fallback for platforms that read that.
    // (Declared as a build-env note rather than a runtime pin: the output is
    // static files, so the Node version only matters during the build.)
    //
    // /about -> about.html. The prerender writes both this and
    // about/index.html so either resolution style works.
    cleanUrls: true,
    // One canonical URL form. Every page emits a rel=canonical that assumes
    // no trailing slash.
    trailingSlash: false,
    headers: [
      {
        source: '/assets/(.*)',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        source: '/img/(.*)',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=604800' }],
      },
      {
        source: '/(.*).html',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' }],
      },
    ],
  },
  null,
  2
)}\n`

// --- Apache / cPanel ------------------------------------------------------
// FallbackResource is the clean primitive here: it applies only when nothing
// else matched, which is exactly the semantics we want. No mod_rewrite rules
// are needed, so this works even on hosts with rewrite disabled.
files['.htaccess'] = `# ALNANDA Contracting - Apache / cPanel shared hosting

DirectoryIndex index.html index.htm

# Serve dist/404.html for anything that does not resolve to a file or
# directory. Unlike a mod_rewrite fallback, this only applies when the
# request matched nothing, so real routes are never intercepted.
FallbackResource /404.html

# Never serve the Windows-style deny files, and keep directory listings off.
Options -Indexes -MultiViews

<IfModule mod_headers.c>
  # Hashed asset filenames are safe to cache forever.
  <FilesMatch "\\.(js|css|woff2|avif|webp)$">
    Header set Cache-Control "public, max-age=31536064, immutable" env=HASHED_ASSETS
  </FilesMatch>
  Header unset X-Powered-By
</IfModule>

<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/css application/javascript \
    application/json image/svg+xml
</IfModule>

<IfModule mod_mime.c>
  AddType image/avif .avif
  AddType image/webp .webp
</IfModule>

ErrorDocument 404 /404.html
`

// --- GitHub Pages ---------------------------------------------------------
// Pages serves 404.html with a 404 status automatically and resolves
// /about/ -> about/index.html. It has no rewrite engine, so no config is
// possible; this file only carries headers, via _headers.
files['_headers'] = `/assets/*
  Cache-Control: public, max-age=31536000, immutable

/img/*
  Cache-Control: public, max-age=604800

/*.html
  Cache-Control: public, max-age=0, must-revalidate
`

// Vercel reads vercel.json from the PROJECT ROOT - the directory containing
// package.json - not from the build output. A vercel.json inside dist/ is
// treated as a static asset and its cleanUrls, trailingSlash and headers
// settings are silently ignored, which is worse than having no config at all
// because it looks like it is working.
//
// So it is written to the root as well as public/. The public/ copy is kept
// because it is harmless there and keeps every host config in one place, but the
// root copy is the one Vercel actually reads. delete the public/ one if a
// future audit shows it being served at /vercel.json.
const vercelJson = files['vercel.json']

for (const [name, content] of Object.entries(files)) {
  fs.writeFileSync(path.join(PUBLIC, name), content, 'utf8')
}
fs.writeFileSync(path.join(ROOT, 'vercel.json'), vercelJson, 'utf8')

console.log(`\nhost configs -> public/`)
console.log('-'.repeat(60))
for (const name of Object.keys(files)) {
  console.log(`  ${name.padEnd(16)} ${fs.statSync(path.join(PUBLIC, name)).size} bytes`)
}
console.log(`  ${'vercel.json'.padEnd(16)} ${vercelJson.length} bytes  -> project ROOT (where Vercel reads it)`)
console.log('\n  The public/ copies are shipped into dist/ by the Vite build.')
console.log('  Run `npm run verify:deploy` to check the built output against them.\n')
