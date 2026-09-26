import Picture from './Picture'
import images from '../data/images.js'

/**
 * Entries resolve to optimised variants in src/data/images.js via `id`.
 * Panda is left as a vector because it already is one - there is nothing to
 * compress, and it stays crisp at any density.
 *
 * Rendered heights come from the manifest's `displayHeight` rather than a
 * value repeated here. The manifest is measured from the real file by
 * scripts/images.mjs, so this list cannot drift out of sync with the assets.
 */
const LOGOS = [
  { name: 'Carina', id: 'logo-carina' },
  { name: 'Decorama', id: 'logo-decorama' },
  { name: 'FEI', id: 'logo-fei' },
  { name: 'MC', id: 'logo-mc' },
  { name: 'Motahida', id: 'logo-motahida' },
  { name: 'Motahida AC', id: 'logo-motahida-ac' },
  { name: 'Msrya', id: 'logo-msrya' },
  { name: 'New Cairo', id: 'logo-new-cairo' },
  { name: 'Nour El Hayah', id: 'logo-nour-el-hayah' },
  // Panda is the one logo not processed by scripts/images.mjs, so its intrinsic
  // size is declared here from the SVG's own viewBox ("0 0 110 42"). Declaring
  // it is what lets the browser reserve layout space before the SVG loads;
  // without width/height attributes the carousel reflows as the logos arrive.
  { name: 'Panda', src: '/logos/Panda.svg', displayHeight: 48, intrinsic: { width: 110, height: 42 } },
  { name: 'Temsco', id: 'logo-temsco' },
  { name: 'United', id: 'logo-united' },
  { name: 'ZH', id: 'logo-zh' },
]

/**
 * The track animates to translateX(-50%), so it must contain exactly twice the
 * visible content for the loop to be seamless.
 *
 * One set measures ~2265px, so two copies give a ~4530px track. That exceeds
 * any realistic viewport (a 4K display at 2x DPR is 1920 CSS px), so two
 * copies are enough. The previous four copies were belt-and-braces that cost
 * 26 extra <img> elements for no visible gain.
 */
const COPIES = 2

function LogoMark({ logo, decorative }) {
  // Height comes from the measured manifest, so it can never be undefined.
  // The stylesheet's `.logo-item img { width: auto }` then derives the rendered
  // width from each logo's real aspect ratio, so nothing is distorted.
  const displayHeight = logo.displayHeight ?? images[logo.id]?.displayHeight
  if (!displayHeight) {
    if (import.meta.env?.DEV) {
      console.warn(`[LogoCarousel] no displayHeight for "${logo.id}" - run \`npm run images\`.`)
    }
    return null
  }

  const style = { height: `${displayHeight}px` }
  const loading = decorative ? 'lazy' : 'eager'

  if (logo.src) {
    // Intrinsic width/height attributes let the browser reserve space before the
    // file loads. The stylesheet still sets `width: auto` and the inline height,
    // so the rendered size is unchanged - the attributes only supply the aspect
    // ratio. Rounded to keep the HTML tidy; a fraction of a pixel is invisible
    // and the ratio is what the browser actually needs.
    const ratio = logo.intrinsic.width / logo.intrinsic.height
    return (
      <img
        src={logo.src}
        alt={decorative ? '' : logo.name}
        aria-hidden={decorative || undefined}
        loading={loading}
        decoding={decorative ? 'async' : 'sync'}
        width={Math.round(displayHeight * ratio)}
        height={displayHeight}
        style={style}
      />
    )
  }

  return <Picture id={logo.id} alt={decorative ? '' : logo.name} loading={loading} style={style} />
}

function LogoCarousel() {
  if (LOGOS.length === 0) return null

  return (
    <section className="logo-carousel-section" aria-label="Client and partner logos">
      <div className="container">
        <p className="logo-carousel-title">Our clients and partners</p>
        <div className="logo-carousel">
          <ul className="logo-track">
            {Array.from({ length: COPIES }, (_, copy) =>
              LOGOS.map((logo) => (
                <li className="logo-item" key={`${logo.name}-${copy}`}>
                  <LogoMark logo={logo} decorative={copy > 0} />
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </section>
  )
}

export default LogoCarousel
