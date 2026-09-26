import Picture from './Picture'

/**
 * Entries resolve to optimised variants in src/data/images.js via `id`.
 * Panda is left as a vector because it already is one - there is nothing to
 * compress, and it stays crisp at any density.
 *
 * `id` values come from scripts/images.mjs. The manifest records each logo's
 * real aspect ratio, so setting only `height` here and letting the stylesheet
 * keep `width: auto` reproduces the intended rendered width without the
 * distortion the previous explicit width/height pairs caused.
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
  { name: 'Panda', src: '/logos/Panda.svg', displayHeight: 48 },
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
  // Inline height beats the `.logo-item img { height: 44px }` stylesheet rule,
  // which is the intended override. The stylesheet's `width: auto` then
  // derives the rendered width from each logo's real aspect ratio, so no
  // logo is distorted.
  const style = { height: `${logo.displayHeight}px` }
  const loading = decorative ? 'lazy' : 'eager'

  if (logo.src) {
    return (
      <img
        src={logo.src}
        alt={decorative ? '' : logo.name}
        aria-hidden={decorative || undefined}
        loading={loading}
        decoding={decorative ? 'async' : 'sync'}
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
