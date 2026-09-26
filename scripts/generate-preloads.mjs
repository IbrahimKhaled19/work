/**
 * Generate the LCP image <link rel="preload"> in index.html.
 *
 *   npm run preloads          rewrite index.html
 *   npm run preloads -- --check   verify without writing (used by npm run verify)
 *
 * WHY THIS IS GENERATED
 * ---------------------
 * The homepage's hero is the Largest Contentful Paint element, so it must be
 * preloaded - a high-priority hint that starts the download before the parser
 * reaches the <picture>.
 *
 * The tag was hand-written, and it drifted. It declared:
 *
 *   href="/img/hero-1600.webp"
 *   imagesrcset="/img/hero-640.avif 640w, ... .avif 1600w, ..."
 *   type="image/avif"
 *
 * The href and the type said webp; the srcset said avif. Per the preload spec
 * the browser uses imagesrcset when present, and matched an .avif candidate.
 * So it downloaded the preloaded webp, found the <picture> wanted avif,
 * discarded those bytes and fetched again - two round trips on the critical
 * path of the largest element on the page, for a preload that made things
 * worse rather than better.
 *
 * The values are derived from src/data/images.js, which is the same manifest
 * <Picture> builds its <source> elements from. Deriving both from one source is
 * the only way they cannot disagree. `npm run verify` re-runs this in --check
 * mode, so an image reprocessed by `npm run images` cannot leave a stale
 * preload behind.
 *
 * WHAT IT DOES NOT DO
 * -------------------
 * It does not choose a format. The browser picks the candidate from the srcset
 * using the connection; emitting only the avif srcset with an avif type is
 * correct because every browser that supports preload-as-image-with-srcset
 * supports avif, and the srcset narrows the choice by width.
 */
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const ROOT = process.cwd()
const INDEX = path.join(ROOT, 'index.html')
const MANIFEST = path.join(ROOT, 'src', 'data', 'images.js')
const MARKER = '<!--preloads:hero-->'
const CHECK_ONLY = process.argv.includes('--check')

/** The manifest entry for the homepage hero. */
const HERO_ID = 'hero'

const { default: images } = await import(pathToFileURL(MANIFEST).href)
const hero = images[HERO_ID]

if (!hero) {
  console.error(`  no "${HERO_ID}" entry in src/data/images.js - run \`npm run images\``)
  process.exit(1)
}

if (!hero.srcSet?.avif || !hero.srcSet?.webp) {
  console.error(
    `  "${HERO_ID}" has no avif/webp srcset. A preload needs a real candidate list;` +
      ' a single-variant image is better left to the <img> itself.'
  )
  process.exit(1)
}

const sizes = hero.sizes || '100vw'

// The tag mirrors exactly what <Picture> renders: the avif <source> is the
// first candidate, so the preload must describe the avif set. href repeats the
// 1600w entry because the spec requires href to be present and consistent with
// imagesrcset - a browser that ignores imagesrcset still gets a valid file.
const avifEntries = hero.srcSet.avif.split(',').map((s) => s.trim())
// Strip the width descriptor for href: the spec wants a bare URL there, with
// the descriptor list in imagesrcset. Keeping "1600w" in href produces a
// request for a path that does not exist.
const hrefCandidate = avifEntries.find((e) => e.startsWith('/img/hero-1600.')) || avifEntries[0]
const hrefEntry = hrefCandidate.split(/\s+/)[0]

const tag = `<link
      rel="preload"
      as="image"
      href="${hrefEntry}"
      imagesrcset="${hero.srcSet.avif}"
      imagesizes="${sizes}"
      type="image/avif"
      fetchpriority="high"
    />`

// Normalise line endings before comparing. git checks out CRLF on Windows
// (core.autocrlf), so the committed file and the generated tag differ by \r on
// every line - and an exact string comparison then reports the file as stale
// even when it is not.
//
// This is not academic: it made `npm run verify` fail on a fresh clone, which is
// exactly what a Vercel build does. A check that fails on the CI platform and
// passes on the author's machine is worse than no check, because the first
// reaction is to disable it.
const html = fs.readFileSync(INDEX, 'utf8').replace(/\r\n/g, '\n')
const markerAt = html.indexOf(MARKER)

if (markerAt === -1) {
  console.error(`  ${MARKER} not found in index.html`)
  process.exit(1)
}

// Everything between the marker and the next blank-line-separated tag is the
// generated region. Matching to the next line that is not indented keeps the
// replacement from swallowing the tags that follow it.
const regionStart = markerAt + MARKER.length
const rest = html.slice(regionStart)
const regionMatch = rest.match(/\r?\n[\s\S]*?(?=\r?\n\s*<link|\r?\n\s*<!--|\r?\n\s*<\/head>)/)

if (!regionMatch) {
  console.error('  could not locate the generated preload region in index.html')
  process.exit(1)
}

const existing = regionMatch[0]
const expected = `\n    ${tag}`
const updated = html.slice(0, regionStart) + expected + html.slice(regionStart + existing.length)

if (updated === html) {
  console.log('  hero preload already matches the image manifest')
  process.exit(0)
}

if (CHECK_ONLY) {
  console.error(
    '\n  the hero preload in index.html is stale - it no longer matches src/data/images.js.' +
      '\n  Run `npm run preloads` and commit the result.\n'
  )
  process.exit(1)
}

// Preserve the file's existing line-ending convention rather than forcing LF,
// so a Windows checkout does not produce a whole-file diff on regeneration.
const eol = fs.readFileSync(INDEX, 'utf8').includes('\r\n') ? '\r\n' : '\n'
fs.writeFileSync(INDEX, eol === '\r\n' ? updated.replace(/\n/g, '\r\n') : updated, 'utf8')

// Report what changed, because a silently rewritten tag is how the previous
// drift went unnoticed.
const readHref = (s) => s.match(/<link[^>]*rel="preload"[^>]*as="image"[^>]*>/)?.[0] ?? ''
console.log('\n  rewrote the hero preload from src/data/images.js')
console.log(`    href        ${readHref(existing).match(/href="([^"]*)"/)?.[1] || '(none)'}`)
console.log(`             -> ${hrefEntry}`)
console.log(`    imagesizes  ${sizes}`)
console.log(`    avif set    ${hero.srcSet.avif.split(',').length} candidates`)
console.log('')
