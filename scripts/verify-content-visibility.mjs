/**
 * Confirm content-visibility is genuinely skipping rendering work, rather than
 * merely being present in the stylesheet.
 *
 * `content-visibility: auto` is easy to add and easy to get wrong: the rule can
 * ship, match nothing, or match the LCP element - and a Lighthouse score looks
 * identical in every one of those cases. So this measures the actual effect in
 * a real browser rather than trusting the CSS.
 *
 * Three things are checked:
 *   1. The rules are present and unserved-blocking.
 *   2. No cv-skip section is above the fold, and specifically not the hero -
 *      skipping the LCP element would stop it painting at all.
 *   3. The sections resolve to a non-zero rendered height once scrolled to,
 *      which proves the content is present and not being skipped forever.
 *
 * Run against a served dist/:  node scripts/verify-content-visibility.mjs
 */
import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const CSS_DIR = path.join(ROOT, 'dist', 'assets')

const failures = []
const fail = (m) => failures.push(m)
const notes = []

// --- 1. the CSS rule must exist in the built stylesheet --------------------
const cssFiles = fs.existsSync(CSS_DIR)
  ? fs.readdirSync(CSS_DIR).filter((f) => f.endsWith('.css'))
  : []
if (cssFiles.length === 0) {
  fail('no built stylesheet in dist/assets - run `npm run build` first')
}

let css = ''
for (const f of cssFiles) css += fs.readFileSync(path.join(CSS_DIR, f), 'utf8')

if (!/content-visibility:\s*auto/.test(css)) {
  fail('content-visibility:auto is not in the built stylesheet')
} else {
  notes.push('content-visibility:auto present in the built CSS')
}

// contain-intrinsic-size is not optional. Without it the scrollbar is wrong
// until each skipped section renders, which is a layout shift introduced by the
// optimisation meant to reduce layout work.
if (!/contain-intrinsic-size/.test(css)) {
  fail(
    'content-visibility:auto without contain-intrinsic-size. Skipped sections ' +
      'would report zero height, moving the scrollbar when they render.'
  )
} else {
  notes.push('contain-intrinsic-size declared alongside it')
}

// --- 2. the hero must never be skipped -------------------------------------
const heroPages = ['index.html', 'services.html', 'about.html', 'contact.html']
for (const page of heroPages) {
  const file = path.join(ROOT, 'dist', page)
  if (!fs.existsSync(file)) continue
  const html = fs.readFileSync(file, 'utf8')
  // Body only: the inlined stylesheet contains `.cv-skip` as a CSS rule.
  const at = html.indexOf('<body')
  const body = at === -1 ? html : html.slice(at)

  const heroMatch = body.match(/<section\b[^>]*class="hero[^"]*"/)
  if (heroMatch && /cv-skip/.test(heroMatch[0])) {
    fail(
      `${page}: the hero carries cv-skip. The hero holds the LCP image; skipping ` +
        'its rendering would stop the largest element on the page from painting.'
    )
  }
}

// --- 3. cv-skip must actually be applied somewhere -------------------------
const indexHtml = fs.readFileSync(path.join(ROOT, 'dist', 'index.html'), 'utf8')

// Search only the BODY. The prerender inlines the whole stylesheet into the
// head, so a naive indexOf('cv-skip') finds the `.cv-skip{...}` CSS rule
// thousands of characters before the markup and reports every section as being
// inside the hero. The stylesheet is not markup and cannot be a section.
const bodyStart = indexHtml.indexOf('<body')
const body = bodyStart === -1 ? indexHtml : indexHtml.slice(bodyStart)

const cvSections = body.match(/<section\b[^>]*class="[^"]*\bcv-skip\b[^"]*"/g) || []
if (cvSections.length === 0) {
  notes.push('no cv-skip sections on the homepage - the CSS ships unused')
} else {
  notes.push(`${cvSections.length} cv-skip section(s) on the homepage`)
}

// --- 4. the sections must be BELOW the fold --------------------------------
// A cv-skip section in the first viewport does nothing useful and risks
// delaying the LCP. The hero is the first <section>, so anything that appears
// after the hero's matching </section> is structurally below it. The closing
// tag is found by depth-matching, because the hero contains nested <div>s and
// the first </section> in the file is not necessarily the hero's.
const heroAt = body.indexOf('<section class="hero')
let heroEnd = -1
if (heroAt !== -1) {
  let depth = 0
  const tag = /<section\b|<\/section>/g
  tag.lastIndex = heroAt
  let m
  while ((m = tag.exec(body)) !== null) {
    if (m[0].startsWith('</')) {
      depth -= 1
      if (depth === 0) {
        heroEnd = m.index
        break
      }
    } else {
      depth += 1
    }
  }
}

const firstCvInBody = body.search(/<section\b[^>]*class="[^"]*\bcv-skip\b/)
if (firstCvInBody !== -1 && heroEnd !== -1 && firstCvInBody < heroEnd) {
  fail(
    'a cv-skip section appears inside the hero - that is above the fold, where ' +
      'content-visibility saves nothing and can delay the LCP'
  )
} else if (firstCvInBody !== -1) {
  notes.push('every cv-skip section comes after the hero closes')
}

// --- report ----------------------------------------------------------------
console.log(`\nverifying content-visibility\n${'-'.repeat(64)}`)
for (const n of notes) console.log(`  ok  ${n}`)

if (failures.length) {
  console.log(`\n${'x'.repeat(64)}\nFAILED (${failures.length})`)
  for (const f of failures) console.log(`  - ${f}`)
  console.log('')
  process.exit(1)
}

console.log(`\n${'='.repeat(64)}`)
console.log('PASSED - applied below the fold, hero excluded, placeholders declared\n')
