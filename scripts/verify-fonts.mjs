/**
 * Guard the two things about fonts that silently cost performance if they rot.
 *
 *   npm run verify:fonts
 *
 * 1. NO RENDER-BLOCKING FONT LINK IN index.html
 *    A <link rel="stylesheet"> to a font CDN blocks first paint. The site had
 *    one, pointing at Google Fonts, and Lighthouse costed it at 600 ms. The
 *    @font-face rules now live in src/fonts.css, which the prerenderer inlines,
 *    so the fonts are discovered by the preload scanner instead. Reintroducing
 *    the <link> would be a silent 600 ms regression on every page.
 *
 * 2. NO THIRD-PARTY FONT ORIGIN ANYWHERE IN THE BUILD
 *    The fonts are vendored into public/fonts/. A reference to fonts.googleapis
 *    or fonts.gstatic.com in any shipped file means the site has silently gone
 *    back to depending on someone else's uptime, and on a slow connection to a
 *    third party, for the text on the page.
 *
 * Also checks that every @font-face src resolves to a file that exists, since a
 * typo there produces a silently fallback-only page.
 */
import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const INDEX_HTML = path.join(ROOT, 'index.html')
const FONTS_CSS = path.join(ROOT, 'src', 'fonts.css')
const FONT_DIR = path.join(ROOT, 'public', 'fonts')

const failures = []
const fail = (m) => failures.push(m)
const notes = []

// ---------------------------------------------------------------------------
// 1. index.html must not block on a font stylesheet
// ---------------------------------------------------------------------------
const html = fs.readFileSync(INDEX_HTML, 'utf8')

const fontLink = html.match(
  /<link[^>]*rel="stylesheet"[^>]*href="([^"]*font[^"]*)"[^>]*>/is
)
if (fontLink) {
  fail(
    `index.html has a render-blocking font stylesheet: ${fontLink[1]}. ` +
      'The @font-face rules belong in src/fonts.css so the prerenderer can inline them.'
  )
}

if (/fonts\.googleapis\.com|fonts\.gstatic\.com/.test(html)) {
  fail(
    'index.html still references Google Fonts. The site must not depend on a ' +
      'third-party font origin for its text.'
  )
}

// A preload for the latin subset is what makes the font arrive with the first
// paint. Without it the font still loads, but late enough to cause a visible
// reflow of every heading.
// Vite reformats index.html, so the preload may be spread across several lines.
// Match across newlines rather than assuming one tag per line - an earlier
// single-line version of this check reported a false pass-by-accident.
if (!/<link[^>]*rel="preload"[^>]*as="font"/is.test(html)) {
  fail(
    'index.html has no <link rel="preload" as="font"> for the latin subset. ' +
      'The font is self-hosted now, so preloading it costs nothing and avoids a ' +
      'flash of fallback text.'
  )
}

// ---------------------------------------------------------------------------
// 2. No third-party font origin in the built output
// ---------------------------------------------------------------------------
const dist = path.join(ROOT, 'dist')
if (fs.existsSync(dist)) {
  const offenders = []
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        walk(full)
        continue
      }
      if (!/\.(html|css|js|json|txt|xml)$/.test(entry.name)) continue
      const body = fs.readFileSync(full, 'utf8')
      if (/fonts\.googleapis\.com|fonts\.gstatic\.com/.test(body)) {
        offenders.push(path.relative(dist, full).replace(/\\/g, '/'))
      }
    }
  }
  walk(dist)

  if (offenders.length) {
    fail(
      `built output still references Google Fonts in: ${offenders.join(', ')}. ` +
        'Self-hosting is only real if the reference is gone from the artefact.'
    )
  } else {
    notes.push('dist/ contains no Google Fonts references')
  }
}

// ---------------------------------------------------------------------------
// 3. Every @font-face src must exist on disk
// ---------------------------------------------------------------------------
if (!fs.existsSync(FONTS_CSS)) {
  fail('src/fonts.css missing - run `npm run fonts`')
} else {
  const css = fs.readFileSync(FONTS_CSS, 'utf8')
  const faces = [...css.matchAll(/@font-face\s*\{([^}]*)\}/g)]
  if (faces.length === 0) fail('src/fonts.css declares no @font-face rules')

  let declared = 0
  for (const [, body] of faces) {
    const src = body.match(/url\(['"]?([^'")]+)['"]?\)/)?.[1]
    const weight = body.match(/font-weight:\s*([^;]+);/)?.[1]?.trim()
    if (!src) {
      fail('an @font-face rule has no src')
      continue
    }
    if (!/^\//.test(src)) {
      fail(`@font-face src "${src}" is not root-absolute - it would resolve relative to the page`)
    }
    const onDisk = path.join(ROOT, 'public', src.replace(/^\//, ''))
    if (!fs.existsSync(onDisk)) {
      fail(`@font-face src "${src}" does not exist at ${path.relative(ROOT, onDisk)}`)
      continue
    }
    declared += 1

    if (/\d+\s+\d+/.test(weight || '')) {
      notes.push(`${path.basename(src)} covers weights ${weight} (variable font)`)
    } else if (!/swap|optional|fallback/.test(body)) {
      fail(
        `@font-face for "${src}" has no font-display. Without it the browser ` +
          'blocks text rendering until the font loads.'
      )
    }
  }

  // A variable font is one file for the whole weight axis. If the CSS declares
  // one face per weight from a single URL, the same bytes are being shipped
  // repeatedly under different names.
  const urls = [...css.matchAll(/url\(['"]?([^'")]+)['"]?\)/g)].map((m) => m[1])
  const unique = new Set(urls)
  if (urls.length > unique.size) {
    fail(
      `${urls.length} @font-face src values but only ${unique.size} unique files. ` +
        'Montserrat is a variable font - use one face with a font-weight range.'
    )
  }

  notes.push(`${declared} @font-face rules, ${unique.size} unique file(s)`)
}

// ---------------------------------------------------------------------------
// 4. Vendored files should be committed, not rebuilt per deploy
// ---------------------------------------------------------------------------
if (!fs.existsSync(FONT_DIR)) {
  fail('public/fonts/ missing - run `npm run fonts`')
} else {
  const files = fs.readdirSync(FONT_DIR).filter((f) => f.endsWith('.woff2'))
  if (files.length === 0) fail('public/fonts/ contains no woff2 files')
  else {
    const bytes = files.reduce((sum, f) => sum + fs.statSync(path.join(FONT_DIR, f)).size, 0)
    notes.push(
      `public/fonts/ holds ${files.length} file(s), ${(bytes / 1024).toFixed(0)} KiB total`
    )
  }
}

// ---------------------------------------------------------------------------
// report
// ---------------------------------------------------------------------------
console.log(`\nverifying font loading\n${'-'.repeat(64)}`)

if (notes.length) {
  for (const n of notes) console.log(`  ok  ${n}`)
}

if (failures.length) {
  console.log(`\n${'x'.repeat(64)}\nFAILED (${failures.length})`)
  for (const m of failures) console.log(`  - ${m}`)
  console.log('')
  process.exit(1)
}

console.log(`\n${'='.repeat(64)}`)
console.log('PASSED - fonts are self-hosted, preloaded, and never render-blocking\n')
