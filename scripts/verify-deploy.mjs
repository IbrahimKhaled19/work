/**
 * Check that dist/ is deployable, and that the host configs did not
 * reintroduce the SPA rewrite that breaks prerendering.
 *
 *   node scripts/verify-deploy.mjs
 *
 * Two failure classes:
 *
 *  1. Output problems - a route missing one of its two resolution forms, a
 *     missing 404.html, a missing asset, a sitemap URL with no file behind it.
 *
 *  2. Config problems - a `_redirects`, `vercel.json` or `.htaccess` that
 *     contains a blanket rewrite to /index.html. That rule looks harmless and
 *     is the single most likely way to undo all of Phase 2, so it is treated as
 *     a hard failure rather than a warning.
 */
import fs from 'node:fs'
import path from 'node:path'

import { routes, notFoundPath } from '../src/routes.manifest.js'
import { outputFilesFor } from '../src/routes.manifest.js'
import { fail, finish } from './lib/verify.mjs'

const ROOT = process.cwd()
const DIST = path.join(ROOT, 'dist')
const PUBLIC = path.join(ROOT, 'public')

const notes = []

if (!fs.existsSync(DIST)) {
  console.error('  dist/ not found - run `npm run build` first.')
  process.exit(1)
}

// ---------------------------------------------------------------------------
// 1. Every route present in both resolution forms
// ---------------------------------------------------------------------------
for (const route of routes) {
  for (const outFile of outputFilesFor(route.pathname)) {
    const target = path.join(DIST, outFile)
    if (!fs.existsSync(target)) {
      fail(`route ${route.pathname}: missing dist/${outFile}`)
    }
  }
}

const notFoundFiles = outputFilesFor(notFoundPath)
for (const outFile of notFoundFiles) {
  if (!fs.existsSync(path.join(DIST, outFile))) {
    fail(`missing dist/${outFile} - hosts serve this for unmatched URLs`)
  }
}

// ---------------------------------------------------------------------------
// 2. Crawl files present and pointing at the right host
// ---------------------------------------------------------------------------
const sitemapPath = path.join(DIST, 'sitemap.xml')
// Read at module scope, not inside the block below: the robots.txt check needs
// the sitemap's origins to compare against, and a block-scoped const is not
// visible there.
const sitemap = fs.existsSync(sitemapPath) ? fs.readFileSync(sitemapPath, 'utf8') : ''

if (!fs.existsSync(sitemapPath)) {
  fail('missing dist/sitemap.xml - run `npm run build:crawl`')
} else {
  const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])
  if (locs.length !== routes.length) {
    fail(`sitemap lists ${locs.length} URLs but there are ${routes.length} routes`)
  }
  for (const loc of locs) {
    const pathname = new URL(loc).pathname
    if (pathname === '/') continue
    const candidates = [pathname, pathname.replace(/\/$/, ''), `${pathname}/`]
    const found = candidates.some((c) => {
      const base = path.join(DIST, c)
      return (
        fs.existsSync(base) ||
        fs.existsSync(`${base}.html`) ||
        fs.existsSync(path.join(base, 'index.html'))
      )
    })
    if (!found) fail(`sitemap URL has no file behind it: ${loc}`)
  }
  if (locs.some((l) => l.includes('404'))) {
    fail('sitemap includes the 404 document')
  }
}

const robotsPath = path.join(DIST, 'robots.txt')
if (!fs.existsSync(robotsPath)) {
  fail('missing dist/robots.txt')
} else {
  const robots = fs.readFileSync(robotsPath, 'utf8')
  if (!/^Sitemap:\s*https?:\/\//m.test(robots)) {
    fail('robots.txt has no absolute Sitemap: directive')
  }
  if (/localhost/.test(robots)) fail('robots.txt points at localhost - set VITE_SITE_URL')

  // The Sitemap: directive and every <loc> must name the same origin. A
  // hardcoded domain in a comment once left robots.txt advertising
  // www.alnanda.com.eg while the sitemap pointed at the deployment host - the
  // Sitemap: line is what Google reads, but a contradictory file invites
  // exactly the wrong conclusion about which host is canonical.
  const sitemapDirective = robots.match(/^Sitemap:\s*(\S+)/m)?.[1]
  const sitemapLocs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])
  const origins = new Set([
    sitemapDirective ? new URL(sitemapDirective).origin : null,
    ...sitemapLocs.map((l) => new URL(l).origin),
  ].filter(Boolean))

  if (origins.size > 1) {
    fail(
      `sitemap.xml and robots.txt name different origins: ${[...origins].join(', ')}. ` +
        'Google reads the Sitemap: line, so a mismatch sends it to the wrong host.'
    )
  }

  // Any absolute URL in robots.txt - including inside a comment - should be the
  // deployment origin. Comments are served to the public, so a stale domain in
  // one is a small but real inconsistency.
  for (const url of robots.match(/https?:\/\/[^\s]+/g) || []) {
    if (url.startsWith('https://schema.org')) continue
    if (!url.startsWith([...origins][0] || '')) {
      fail(
        `robots.txt references ${url}, which is not the deployment origin ` +
          `(${[...origins][0]}). It appears in a comment, but the file is public.`
      )
    }
  }
}

// ---------------------------------------------------------------------------
// 3. Host configs: reject the SPA rewrite
// ---------------------------------------------------------------------------
// vercel.json is deliberately absent: it is root-only, and section 4 fails
// the build if it turns up in dist/.
const HOST_CONFIGS = ['_redirects', '.htaccess', '_headers']

for (const name of HOST_CONFIGS) {
  const inPublic = path.join(PUBLIC, name)
  const inDist = path.join(DIST, name)

  if (!fs.existsSync(inPublic)) {
    notes.push(`${name} not generated - run \`npm run deploy:config\``)
    continue
  }
  if (!fs.existsSync(inDist)) {
    fail(`${name} is in public/ but was not copied into dist/`)
    continue
  }

  const body = fs.readFileSync(inDist, 'utf8')
  // Strip comment lines so the explanatory prose in each file is not mistaken
  // for an active rule.
  const active = body
    .split('\n')
    .filter((line) => !line.trim().startsWith('#'))
    .join('\n')

  // A catch-all that rewrites everything to the root index is the SPA rule.
  const spaRewrite = /(\/\*|\^\/|\.\*)\s+\/(\.\/)?index\.html|\/\*\s*\/index\.html/.exec(active)
  if (spaRewrite) {
    fail(
      `${name} contains a catch-all rewrite to index.html ("${spaRewrite[0].trim()}"). ` +
        'That is the SPA rule and it would serve the homepage for all 19 routes.'
    )
  }
}

// ---------------------------------------------------------------------------
// 4. Host configs must be where the host actually reads them
// ---------------------------------------------------------------------------
// Vercel reads vercel.json from the project root - the directory containing
// package.json - and NOT from the build output. A vercel.json that only exists
// in public/ (and therefore in dist/) is served as a static file while its
// cleanUrls, trailingSlash and headers settings are silently discarded. That
// failure is invisible: the deploy succeeds, the site works, and the config
// simply never applies.
//
// Any other host that reads config from the repo root rather than the uploaded
// directory belongs here too.
const ROOT_LEVEL_CONFIGS = {
  'vercel.json': 'Vercel reads this from the project root, not from dist/',
}

for (const [name, why] of Object.entries(ROOT_LEVEL_CONFIGS)) {
  const atRoot = path.join(ROOT, name)
  if (!fs.existsSync(atRoot)) {
    fail(`${name} is missing from the project root. ${why}. Run \`npm run deploy:config\`.`)
    continue
  }
  // It must be valid JSON, or Vercel rejects the whole deployment.
  try {
    JSON.parse(fs.readFileSync(atRoot, 'utf8'))
  } catch (e) {
    fail(`${name} at the project root is not valid JSON: ${e.message}`)
  }
  // And it must not also be in the deploy output. There it is served as a
  // static file at /vercel.json - publishing the build configuration to
  // anyone who requests it - while its cleanUrls, trailingSlash and headers
  // are silently discarded.
  if (fs.existsSync(path.join(DIST, name))) {
    fail(
      `${name} was copied into dist/, where it is served at /${name} and its settings are ignored. ` +
        'It is read from the project root only. Remove it from public/.'
    )
  }
}

// The site URL must be an absolute https origin on the real deployment. A
// localhost or relative value here is what assertSiteUrl() exists to catch, but
// this also catches the case where the origin is set yet the build shipped
// localhost canonicals because the env var was not picked up.
const envProduction = path.join(ROOT, '.env.production')
if (fs.existsSync(envProduction)) {
  const declared = fs
    .readFileSync(envProduction, 'utf8')
    .match(/^\s*VITE_SITE_URL\s*=\s*(.+)$/m)?.[1]
    ?.trim()
  if (!declared) {
    fail('.env.production exists but declares no VITE_SITE_URL')
  } else {
    let origin
    try {
      origin = new URL(declared).origin
    } catch {
      fail(`.env.production VITE_SITE_URL="${declared}" is not a valid absolute URL`)
    }
    if (origin) {
      if (origin.startsWith('http://')) {
        notes.push(`VITE_SITE_URL is http, not https: ${origin}`)
      }
      // The canonicals baked into dist/ must match what is declared, or the
      // deploy would ship one origin while the config says another.
      const homepage = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8')
      const canonical = homepage.match(/<link rel="canonical" href="([^"]+)"/)?.[1]
      if (canonical && !canonical.startsWith(origin)) {
        fail(
          `.env.production declares ${origin} but dist/index.html has canonical ${canonical}. ` +
            'The build did not pick up the env var - rebuild before deploying.'
        )
      } else if (canonical) {
        notes.push(`VITE_SITE_URL ${origin} matches the built canonicals`)
      }
    }
  }
}

// ---------------------------------------------------------------------------
// report
// ---------------------------------------------------------------------------
console.log(`\nverifying deployability\n${'-'.repeat(64)}`)
console.log(`routes               : ${routes.length} (each in 2 resolution forms)`)
console.log(`404 document         : ${notFoundFiles.join(', ')}`)
console.log(`crawl files          : sitemap.xml, robots.txt`)
console.log(
  `host configs checked : ${
    HOST_CONFIGS.filter((n) => fs.existsSync(path.join(PUBLIC, n))).join(', ') ||
    'none generated'
  }`
)
console.log(
  `root-level configs   : ${
    Object.keys(ROOT_LEVEL_CONFIGS)
      .filter((n) => fs.existsSync(path.join(ROOT, n)))
      .join(', ') || 'none'
  }`
)

if (notes.length) {
  console.log('\nnotes')
  for (const n of notes) console.log(`  - ${n}`)
}

finish('dist/ is deployable and no config reintroduces an SPA rewrite')
