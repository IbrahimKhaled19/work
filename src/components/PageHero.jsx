import { Link } from 'react-router-dom'
import WaveSeparator from './WaveSeparator'
import Picture from './Picture'

/**
 * The band at the top of every inner page.
 *
 * `imageId` names a manifest entry in src/data/images.js and paints a
 * photograph behind the copy - the three-layer structure the homepage hero and
 * the CTA band already use: the picture, a scrim that keeps white text legible
 * over an arbitrary photograph, then the copy. Without it the band falls back
 * to the graphic treatment the .page-hero rules draw.
 *
 * The photograph is decorative: the title and subtitle above it carry the
 * meaning, so the layer is hidden from assistive tech and the alt is empty.
 *
 * `className` is a hook for a page that needs to adjust the band - Careers
 * moves its photograph as the page scrolls - without a second component.
 */
function PageHero({ title, subtitle, crumb, imageId, className = '' }) {
  return (
    <section
      className={`page-hero ${imageId ? 'page-hero--photo' : ''} ${className}`.trim()}
    >
      {imageId ? (
        <>
          <div className="page-hero-bg" aria-hidden="true">
            <Picture id={imageId} alt="" />
          </div>
          <div className="page-hero-overlay" aria-hidden="true"></div>
        </>
      ) : null}
      <div className="container">
        <p className="page-crumb">
          <Link to="/">Home</Link> {crumb ? <span>/ {crumb}</span> : null}
        </p>
        <h1>{title}</h1>
        {subtitle ? <p className="page-subtitle">{subtitle}</p> : null}
      </div>
      <WaveSeparator />
    </section>
  )
}

export default PageHero