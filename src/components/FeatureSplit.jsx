import Reveal from './Reveal'
import Picture from './Picture'

/**
 * `imageId` refers to an entry in src/data/images.js, so real photography
 * dropped into assets-src/ gets responsive AVIF/WebP variants automatically.
 *
 * The media column exists only when there is a photograph. A service whose
 * photography has not arrived yet renders its text alone, with
 * `feature-split-solo` so the band does not hold a media track open beside
 * empty space. The badge rides with the frame - it is positioned to overlap the
 * photograph - so a split with no photograph shows no badge either.
 */
function FeatureSplit({
  heading = null,
  body = null,
  imageId = null,
  imageAlt = '',
  badgeTitle = null,
  badgeItems = [],
  flip = false,
}) {
  const classes = `feature-split${flip ? ' feature-split-flip' : ''}${
    imageId ? '' : ' feature-split-solo'
  }`

  return (
    <div className={classes}>
      {/* Both are optional, and the whole block is omitted when neither is given.
          A split that exists only to carry a photograph is a real case here - an
          empty <h2> and an empty <p> are worse than no text column, and an empty
          .feature-text would still occupy a grid track and add a gap. */}
      {(heading || body) && (
        <Reveal className="feature-text">
          {heading && <h2>{heading}</h2>}
          {body && <p className="service-detail-text">{body}</p>}
        </Reveal>
      )}
      {imageId && (
        <Reveal className="feature-media" variant="scale" delay={120}>
          <div className="feature-frame">
            <Picture id={imageId} alt={imageAlt} loading="lazy" />
          </div>
          {badgeTitle && (
            <div className="feature-badge">
              <p>{badgeTitle}</p>
              {badgeItems.length > 0 && (
                <ul>
                  {badgeItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </Reveal>
      )}
    </div>
  )
}

export default FeatureSplit
