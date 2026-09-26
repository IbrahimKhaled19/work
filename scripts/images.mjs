/**
 * Image optimisation pipeline.
 *
 * Reads full-resolution sources from assets-src/ and writes responsive AVIF +
 * WebP (+ PNG fallback where useful) variants into public/img/, which is the
 * only image directory Vite copies into dist/.
 *
 *   node scripts/images.mjs          optimise everything
 *   node scripts/images.mjs --check  report only, write nothing (for CI)
 *
 * Design rules, all derived from measured display sizes:
 *
 *  - Never upscale. `withoutEnlargement` is set on every resize, and
 *    height-driven targets are additionally clamped to the source width.
 *    Upscaling would inflate bytes and invent detail that is not there.
 *
 *  - Emit 1x and 2x for anything with a fixed CSS box, so a HiDPI screen
 *    gets a sharp image without a 2x user downloading a 2x file on mobile.
 *
 *  - The hero is a full-bleed `object-fit: cover` background sized at 100vw
 *    (see .hero-bg img in src/index.css), so it gets a srcset rather than a
 *    single file. Capped at 2560px: beyond that the extra bytes buy nothing
 *    visible and cost real time on a 4G connection.
 *
 *  - Sources live outside public/ on purpose. Anything in public/ is copied
 *    verbatim into dist/, so keeping a 3.8 MB master there would ship it.
 *
 * Output manifest is written to src/data/images.js so components get exact
 * intrinsic width/height at build time. That is what keeps width/height
 * attributes correct, which is what prevents layout shift.
 */

import sharp from 'sharp'
import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const SRC = path.join(ROOT, 'assets-src')
const OUT = path.join(ROOT, 'public', 'img')
const MANIFEST = path.join(ROOT, 'src', 'data', 'images.js')
const CHECK_ONLY = process.argv.includes('--check')

/**
 * Formats and quality per target class.
 *
 * AVIF + WebP only, no PNG. Reasons:
 *  - WebP has been in every major browser since 2020, so a PNG tier only adds
 *    deploy weight. On the small client logos the PNG output was frequently
 *    the *largest* of the three (logo-mc: png 3.1 KB vs avif 3.5 KB), so it
 *    was pure cost.
 *  - AVIF is roughly 30% smaller than WebP on the hero, and Safari 16.4+ plus
 *    all evergreen engines take it. The WebP tier covers Safari 14-16.3.
 */
const PHOTO = { formats: ['avif', 'webp'], avif: 50, webp: 72 }
const GRAPHIC = { formats: ['avif', 'webp'], avif: 62, webp: 82 }

/**
 * Sources already this small are copied through untouched.
 *
 * Re-encoding a 1.6 KB PNG into AVIF + WebP produced three files totalling
 * more than the original, because both encoders have fixed overhead that
 * dominates at that size. A 4 KB logo served as-is is not a performance
 * problem; shipping it as three formats is.
 */
const PASSTHROUGH_BYTES = 14 * 1024


/**
 * The 13 client logos, keyed by output name.
 *
 * `displayHeight` mirrors the per-logo heights in src/components/LogoCarousel.jsx,
 * which override the `height: 44px` in CSS. Output width is derived from each
 * source's own aspect ratio so no logo is ever distorted, then clamped to the
 * source width so nothing is upscaled.
 */
const CLIENT_LOGOS = [
  { name: 'carina', file: 'Carina.avif', displayHeight: 44 },
  { name: 'decorama', file: 'Decorama.png', displayHeight: 52 },
  { name: 'fei', file: 'FEI.png', displayHeight: 64 },
  { name: 'mc', file: 'MC.png', displayHeight: 52 },
  { name: 'motahida', file: 'Motahida.png', displayHeight: 84 },
  { name: 'motahida-ac', file: 'MotahidaAC.png', displayHeight: 72 },
  { name: 'msrya', file: 'msrya.png', displayHeight: 64 },
  { name: 'new-cairo', file: 'NewCairo.png', displayHeight: 48 },
  { name: 'nour-el-hayah', file: 'NourElhayah.jpg', displayHeight: 64 },
  { name: 'temsco', file: 'Temsco.png', displayHeight: 44 },
  { name: 'united', file: 'United.png', displayHeight: 96 },
  { name: 'zh', file: 'ZH.png', displayHeight: 72 },
]

const TARGETS = [
  {
    id: 'hero',
    source: 'hero-fire-protection.webp',
    output: 'hero',
    widths: [640, 1024, 1600, 2560],
    sizes: '100vw',
    class: PHOTO,
    alt: '',
    note: 'LCP element. Full-bleed cover background at 100vw.',
  },
  {
    id: 'logo',
    source: 'logo.png',
    output: 'logo',
    // Navbar renders this from its HTML width/height attributes - there is no
    // .brand img rule in CSS. The source is 2132x738 (2.89:1) but the box is
    // 120x50 (2.4:1), so the current rendering is already slightly squashed.
    // `fill` reproduces today's appearance exactly rather than silently
    // changing the logo. See "logo aspect" in SEO_PERF_PLAN.md.
    box: { width: 120, height: 50 },
    scale: 2,
    fit: 'fill',
    class: GRAPHIC,
    alt: '',
    note: 'Navbar brand mark. 1x/2x of the declared 120x50 box.',
  },
  {
    id: 'gacpSeal',
    source: 'logos/gacp-egypt-logo-hd.png',
    output: 'gacp-seal',
    // .proof-badge-frame img is width:148px, height:auto -> 1x and 2x.
    widths: [148, 296],
    displayWidth: 148,
    displayHeight: 165,
    class: GRAPHIC,
    alt: 'GACP Egypt certification seal',
    note: 'Displayed at 148px wide. Was 3.8 MB at 1896x2116.',
  },
  ...CLIENT_LOGOS.map((logo) => ({
    id: `logo-${logo.name}`,
    source: `logos/${logo.file}`,
    output: `logo-${logo.name}`,
    byHeight: logo.displayHeight * 2,
    displayHeight: logo.displayHeight,
    class: GRAPHIC,
    alt: '',
    note: 'Client logo strip. Sized to 2x its rendered height.',
  })),
]

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}

async function encode(sourcePath, target, width, format, outDir) {
  const pipeline = sharp(sourcePath)

  if (target.fit === 'fill') {
    pipeline.resize({
      width,
      height: Math.round((width * target.box.height) / target.box.width),
      fit: 'fill',
    })
  } else {
    pipeline.resize({ width, withoutEnlargement: true })
  }

  const suffix = format === 'jpeg' ? 'jpg' : format
  const outFile = path.join(outDir, `${target.output}-${width}.${suffix}`)

  const image =
    format === 'avif'
      ? pipeline.avif({ quality: target.class.avif, effort: 6 })
      : pipeline.webp({ quality: target.class.webp, effort: 5 })

  if (!CHECK_ONLY) {
    await image.toFile(outFile)
  }

  const meta = await sharp(outFile).metadata()
  return {
    file: path.basename(outFile),
    width: meta.width,
    height: meta.height,
    bytes: fs.statSync(outFile).size,
  }
}

const manifestEntries = []
let sourceBytes = 0
let outputBytes = 0
const rows = []

if (fs.existsSync(OUT)) fs.rmSync(OUT, { recursive: true })
fs.mkdirSync(OUT, { recursive: true })

for (const target of TARGETS) {
  const sourcePath = path.join(SRC, target.source)
  if (!fs.existsSync(sourcePath)) {
    console.error(`  MISSING SOURCE: assets-src/${target.source}`)
    process.exitCode = 1
    continue
  }

  const srcBytes = fs.statSync(sourcePath).size
  sourceBytes += srcBytes
  const srcMeta = await sharp(sourcePath).metadata()

  // --- Passthrough: already small enough that re-encoding costs more -----
  if (srcBytes <= PASSTHROUGH_BYTES) {
    const ext = path.extname(target.source).slice(1)
    const outName = `${target.output}.${ext}`
    const outFile = path.join(OUT, outName)
    if (!CHECK_ONLY) fs.copyFileSync(sourcePath, outFile)
    const bytes = fs.statSync(outFile).size
    outputBytes += bytes

    rows.push({
      id: target.id,
      sourceSize: srcBytes,
      passthrough: true,
      smallest: bytes,
      largest: bytes,
      outputSize: bytes,
      note: 'copied through (already small)',
    })

    manifestEntries.push({
      id: target.id,
      src: `/img/${outName}`,
      srcSet: null,
      width: srcMeta.width,
      height: srcMeta.height,
      displayWidth: target.displayWidth ?? target.box?.width ?? srcMeta.width,
      displayHeight: target.displayHeight ?? target.box?.height ?? srcMeta.height,
      sizes: target.sizes ?? null,
      alt: target.alt,
    })
    continue
  }

  // Resolve the output widths for this target.
  let widths
  if (target.widths) {
    widths = target.widths
  } else if (target.byHeight) {
    const aspect = srcMeta.width / srcMeta.height
    // Never exceed the source width: 2x of a short logo can exceed what the
    // master actually provides, and upscaling would only add bytes.
    widths = [Math.min(Math.round(target.byHeight * aspect), srcMeta.width)]
  } else if (target.box) {
    widths = [target.box.width * target.scale]
  } else {
    widths = [srcMeta.width]
  }

  const variants = { avif: [], webp: [] }
  for (const format of target.class.formats) {
    for (const width of widths) {
      const result = await encode(sourcePath, target, width, format, OUT)
      variants[format].push(result)
      outputBytes += result.bytes
    }
  }

  const all = [...variants.avif, ...variants.webp]
  const primary = variants.webp[0]
  const largestVariant = all.reduce((a, b) => (b.bytes > a.bytes ? b : a), all[0])
  const smallestVariant = all.reduce((a, b) => (b.bytes < a.bytes ? b : a), all[0])
  const outputSize = all.reduce((sum, v) => sum + v.bytes, 0)

  rows.push({
    id: target.id,
    sourceSize: srcBytes,
    passthrough: false,
    smallest: smallestVariant.bytes,
    largest: largestVariant.bytes,
    outputSize,
    note: `${all.length} files, ${formatBytes(smallestVariant.bytes)} - ${formatBytes(largestVariant.bytes)}`,
  })

  const srcset = (format) =>
    variants[format].map((v) => `/img/${v.file} ${v.width}w`).join(', ')

  manifestEntries.push({
    id: target.id,
    // `src` is the WebP fallback inside <picture>; browsers that understand
    // avif pick the <source> instead.
    src: `/img/${primary.file}`,
    srcSet: {
      avif: srcset('avif'),
      webp: srcset('webp'),
    },
    width: largestVariant.width,
    height: largestVariant.height,
    displayWidth: target.displayWidth ?? target.box?.width ?? largestVariant.width,
    displayHeight: target.displayHeight ?? target.box?.height ?? largestVariant.height,
    sizes: target.sizes ?? null,
    alt: target.alt,
  })
}

const pad = (v, n) => String(v).padEnd(n)
const rpad = (v, n) => String(v).padStart(n)

console.log(
  '\n' +
    pad('target', 22) +
    rpad('source', 11) +
    rpad('deployed', 11) +
    rpad('visitor', 11) +
    '  note'
)
console.log('-'.repeat(84))
for (const row of rows) {
  console.log(
    pad(row.id, 22) +
      rpad(formatBytes(row.sourceSize), 11) +
      rpad(formatBytes(row.outputSize), 11) +
      rpad(formatBytes(row.largest), 11) +
      '  ' +
      row.note
  )
}
console.log('-'.repeat(84))
console.log(
  pad(`${rows.length} targets`, 22) +
    rpad(formatBytes(sourceBytes), 11) +
    rpad(formatBytes(outputBytes), 11) +
    '\n   ' +
    `sources ${(sourceBytes / 1024 / 1024).toFixed(2)} MB -> deployed assets ${(outputBytes / 1024 / 1024).toFixed(2)} MB` +
    `   (net ${formatBytes(sourceBytes - outputBytes)} removed)`
)
console.log(
  '   "visitor" = largest single variant, i.e. what one desktop visitor downloads for that image.\n'
)

// ---------------------------------------------------------------------------
// Apple touch icon.
//
// iOS does not render SVG touch icons, so this has to be a real PNG at 180x180.
// It is generated from public/favicon.svg (the red "A" brand mark) rather than
// the wordmark, which would be illegible cropped to a square. PNG is mandatory
// here, which is the one place this pipeline still emits it.
// ---------------------------------------------------------------------------
const TOUCH_ICON = { source: 'public/favicon.svg', size: 180, out: 'apple-touch-icon.png' }

if (!CHECK_ONLY) {
  const touchSource = path.join(ROOT, TOUCH_ICON.source)
  if (fs.existsSync(touchSource)) {
    const touchOut = path.join(OUT, TOUCH_ICON.out)
    await sharp(touchSource, { density: 384 })
      .resize(TOUCH_ICON.size, TOUCH_ICON.size, { fit: 'cover' })
      .png({ compressionLevel: 9 })
      .toFile(touchOut)
    console.log(
      `\napple-touch-icon  ${formatBytes(fs.statSync(touchOut).size)}  ${TOUCH_ICON.size}x${TOUCH_ICON.size} png`
    )
  } else {
    console.error(`  MISSING TOUCH ICON SOURCE: ${TOUCH_ICON.source}`)
    process.exitCode = 1
  }
}

// ---------------------------------------------------------------------------
// Open Graph / Twitter share image.
//
// Injected into every page by scripts/prerender.mjs, so it has to exist - a
// missing og:image means every WhatsApp and Facebook share is a bare text card.
//
// Built as a composite rather than a plain crop of the hero: the hero is
// darkened by a 65% overlay on the page anyway, so a straight crop reads as a
// dim rectangle. Scaling a dimmed crop with the brand red and centring the
// existing wordmark gives a card that is identifiable at thumbnail size in a
// chat list. The wordmark is composited as an image rather than typeset as SVG
// text because Montserrat is only ever loaded from a CDN at runtime, and
// sharp has no access to it.
//
// 1200x630 is the size Facebook, LinkedIn and WhatsApp all expect. Emitted as
// JPEG: several scrapers still will not render AVIF or WebP, and a photo as
// PNG would be several times the bytes for no benefit.
// ---------------------------------------------------------------------------
const OG = { width: 1200, height: 630, out: 'og-image.jpg' }

if (!CHECK_ONLY) {
  const heroSource = path.join(SRC, 'hero-fire-protection.webp')
  const wordmark = path.join(SRC, 'logo.png')
  const ogOut = path.join(OUT, OG.out)

  if (!fs.existsSync(heroSource)) {
    console.error(`  MISSING OG SOURCE: assets-src/hero-fire-protection.webp`)
    process.exitCode = 1
  } else {
    // Wordmark at ~46% of the card width. Composited as a buffer because
    // sharp's composite() takes { input } buffers, not pipeline instances.
    const logoBuffer = await sharp(wordmark)
      .resize({ width: Math.round(OG.width * 0.46) })
      .png()
      .toBuffer()

    // Brand wash, echoing the site's --red.
    const washBuffer = await sharp({
      create: {
        width: OG.width,
        height: OG.height,
        channels: 4,
        // Brand wash, echoing the site's --red. Kept light: the hero photograph
        // is already dominated by red brick and hydrant paint, so a heavier
        // tint doubles up and the whole card reads magenta.
        background: { r: 204, g: 38, b: 67, alpha: 0.14 },
      },
    })
      .png()
      .toBuffer()

    await sharp(heroSource)
      // Cover-crop the hero to 1.91:1, then dim it to match the on-page
      // treatment so the card is not glaringly brighter than the site.
      .resize(OG.width, OG.height, { fit: 'cover', position: 'centre' })
      .modulate({ brightness: 0.62, saturation: 0.9 })
      .composite([
        { input: washBuffer, gravity: 'centre' },
        { input: logoBuffer, gravity: 'centre' },
      ])
      .jpeg({ quality: 88, mozjpeg: true, chromaSubsampling: '4:4:4' })
      .toFile(ogOut)

    console.log(
      `\nog-image            ${formatBytes(fs.statSync(ogOut).size)}  ${OG.width}x${OG.height} jpg`
    )
  }
}

if (!CHECK_ONLY) {
  const body = `/**
 * GENERATED by scripts/images.mjs - do not edit by hand.
 * Run \`npm run images\` after changing anything in assets-src/.
 *
 * \`width\`/\`height\` are the largest emitted variant's intrinsic size. Using
 * them on the <img> lets the browser reserve layout space before the bytes
 * arrive, which is what prevents layout shift.
 */

export const images = ${JSON.stringify(
    Object.fromEntries(manifestEntries.map((entry) => [entry.id, entry])),
    null,
    2
  )}

export default images
`
  fs.writeFileSync(MANIFEST, body)
  console.log(`manifest written: src/data/images.js (${manifestEntries.length} entries)`)
}
