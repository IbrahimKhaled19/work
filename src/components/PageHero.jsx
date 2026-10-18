import { Link } from 'react-router-dom'
import WaveSeparator from './WaveSeparator'
import Picture from './Picture'

/**
 * The band at the top of every inner page.
 *
 * `imageId` names a manifest entry in src/data/images.js and paints a
 * photograph behind the copy - the three-layer structure the homepage hero and
 * the CTA band already use: the picture, a scrim that keeps white text legible
 * over an arbitrary photograph, then the copy. Without it the band falls back to
 * the graphic treatment the .page-hero rules draw.
 *
 * The photograph is decorative: the title and subtitle above it carry the
 * meaning, so the layer is hidden from assistive tech and the alt is empty.
 *
 * `className` is a hook for a page that needs to adjust the band - Careers
 * moves its photograph as the page scrolls - without a second component.
 *
 * BREADCRUMB
 * ----------
 * `crumbs` is an array, one entry per level below Home: `{ label, to }`, with
 * `to` omitted on the level the visitor is already on. It used to be a single
 * string with the separator typed into it ("Services / Fire Pump Systems"),
 * which meant every level below Home was dead text - so on a service page there
 * was no way back to the catalogue except the navbar dropdown.
 *
 * Home is always the first crumb and always a link, so it is not in the array.
 * The last level is deliberately NOT a link: it is where the visitor already is,
 * and a self-link is a redundant tab stop that reads as "link" to a page you are
 * on. It carries aria-current="page" instead, which is the WAI-ARIA breadcrumb
 * pattern. The separators are drawn in CSS so the trail is a list of links
 * rather than a sentence with slashes in it.
 */
function PageHero({ title, subtitle, crumbs, imageId, className = '' }) {
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
        {crumbs?.length ? (
          <nav className="page-crumb" aria-label="Breadcrumb">
            <ol>
              <li>
                <Link to="/">Home</Link>
              </li>
              {crumbs.map((crumb) => (
                <li key={crumb.label}>
                  {crumb.to ? (
                    <Link to={crumb.to}>{crumb.label}</Link>
                  ) : (
                    <span aria-current="page">{crumb.label}</span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        ) : null}
        <h1>{title}</h1>
        {subtitle ? <p className="page-subtitle">{subtitle}</p> : null}
      </div>
      <WaveSeparator />
    </section>
  )
}

export default PageHero