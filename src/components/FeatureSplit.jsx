import Reveal from './Reveal'
import Picture from './Picture'

/**
 * `imageId` refers to an entry in src/data/images.js, so real photography
 * dropped into assets-src/ gets responsive AVIF/WebP variants automatically.
 * `image` remains as a fallback for a plain URL.
 */
function FeatureSplit({
  heading = null,
  body = null,
  imageId = null,
  image = null,
  imageAlt = '',
  placeholderLabel = 'Installation photo',
  dimensionsLabel = '',
  badgeTitle = null,
  badgeItems = [],
  flip = false,
  FallbackIcon = null,
}) {
  return (
    <div className={`feature-split${flip ? ' feature-split-flip' : ''}`}>
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
      <Reveal className="feature-media" variant="scale" delay={120}>
        <div className="feature-frame">
          {imageId ? (
            <Picture id={imageId} alt={imageAlt} loading="lazy" />
          ) : image ? (
            <img src={image} alt={imageAlt} loading="lazy" decoding="async" />
          ) : (
            <div className="feature-placeholder" role="img" aria-label={placeholderLabel}>
              {FallbackIcon && <FallbackIcon size={44} aria-hidden="true" />}
              <p>{placeholderLabel}</p>
              {dimensionsLabel && <span>{dimensionsLabel}</span>}
            </div>
          )}
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
    </div>
  )
}

export default FeatureSplit
