/**
 * Renders a <picture> element from an entry in the generated image manifest
 * (src/data/images.js - produced by `npm run images`).
 *
 * Why a component rather than inline markup in each page:
 *  - The AVIF/WebP <source> pair, the srcset strings and the `sizes` hint are
 *    identical everywhere, so they should be written once.
 *  - Intrinsic width/height come from the manifest, which is measured from the
 *    real file at build time. That is what lets the browser reserve layout
 *    space before the bytes arrive, i.e. what prevents layout shift.
 *
 * Handles both manifest shapes: multi-variant entries with a srcset, and
 * passthrough entries (small sources copied through untouched) that have
 * `srcSet: null` and render as a plain <img>.
 */

import images from '../data/images.js'
/**
 * `display: contents` on the <picture> wrapper means it generates no box, so
 * the <img> lays out exactly as it would without the wrapper. This matters for
 * the hero, whose img uses `height: 100%` against .hero-bg, and it avoids a
 * baseline gap in inline contexts. See .picture in src/index.css.
 */
export default function Picture({
  id,
  alt,
  loading = 'lazy',
  fetchPriority,
  sizes,
  className,
  style,
  ...rest
}) {
  const image = images[id]
  if (!image) {
    if (import.meta.env?.DEV) {
      console.warn(`[Picture] unknown image id "${id}". Run \`npm run images\`.`)
    }
    return null
  }

  const resolvedAlt = alt ?? image.alt ?? ''
  const resolvedSizes = sizes ?? image.sizes ?? undefined

  // A one-candidate srcset is pointless and subtly harmful: with `w`
  // descriptors and no `sizes`, the spec makes the slot 100vw, so the browser
  // reports a density-corrected naturalWidth against the viewport rather than
  // the real pixel size. For single-variant images, plain src is correct.
  const hasMultiple = (set) => set && set.includes(',')
  const webpSet = hasMultiple(image.srcSet?.webp) ? image.srcSet.webp : undefined
  const avifSet = hasMultiple(image.srcSet?.avif) ? image.srcSet.avif : undefined

  return (
    <picture className="picture">
      {avifSet && <source type="image/avif" srcSet={avifSet} sizes={resolvedSizes} />}
      {webpSet && <source type="image/webp" srcSet={webpSet} sizes={resolvedSizes} />}
      <img
        src={image.src}
        srcSet={webpSet}
        sizes={webpSet ? resolvedSizes : undefined}
        alt={resolvedAlt}
        width={image.width}
        height={image.height}
        loading={loading}
        // React 19 maps this to the fetchpriority attribute. Below-the-fold
        // images decode off the main thread so they do not delay first paint.
        fetchPriority={fetchPriority}
        decoding={loading === 'lazy' ? 'async' : 'sync'}
        className={className}
        style={style}
        {...rest}
      />
    </picture>
  )
}
