import { Link, useParams } from 'react-router-dom'
import { ShieldCheck } from '@phosphor-icons/react/ShieldCheck'
import PageHero from '../components/PageHero'
import Reveal from '../components/Reveal'
import FeatureSplit from '../components/FeatureSplit'
import CTA from '../components/CTA'
import NotFound from './NotFound'
import { serviceSections, disciplineLabels } from '../data/services'
import serviceVisuals from '../data/serviceVisuals'

// Expected size of the photograph that fills a spotlight slot. Recorded in
// PRODUCT.md as the standard for the detail spotlights, so it is a production
// brief rather than a product claim.
const PHOTO_SLOT = '1200 × 800'

/**
 * Badge phrases for the spotlight, taken from copy that already exists.
 *
 * Every `points` entry is written as "Short label: explanation", so the label
 * is an authored short phrase - "Wet pipe systems", "24/7 emergency dispatch",
 * "Firestopping" - and has the same shape as the hand-written items on
 * fire-pump-systems. Reusing them keeps the badge honest: nothing here is
 * invented, and the phrases cannot drift from the coverage list above them
 * because they are read from it.
 */
const badgeLabels = (points) =>
  points.slice(0, 3).map((p) => p.split(':')[0].trim()).filter(Boolean)

const blurbs = {
  'design-engineering': 'Engineering-first fire protection, reviewed against code before a single pipe goes in.',
  'fire-pump-systems': 'Electric, diesel, and jockey pumps sized, installed, and acceptance-tested.',
  'sprinkler-systems': 'Wet, dry, pre-action, deluge, and ESFR systems matched to your hazard.',
  'standpipe-hose-systems': 'Code-sized standpipes, hose cabinets, and Fire Department Connections.',
  'fire-alarm-detection': 'Detection and notification fast enough to matter.',
  'portable-extinguishers': 'Correct type, correct placement, inspected on schedule.',
  'special-hazard-suppression': 'Clean agent, CO2, kitchen hood, and foam for special risks.',
  'passive-fire-protection': 'Doors, dampers, and firestopping that buy time.',
  'inspection-testing-maintenance': 'Scheduled testing with documented proof of compliance.',
  'civil-defense-compliance': 'Approvals, liaison, and licensing handled end to end.',
  'retrofit-upgrade': 'Aging and non-compliant systems brought up to current code.',
  'emergency-repair-services': '24/7 dispatch, repair, and spare parts.',
  'training-consulting': 'Training, drills, and ongoing technical consulting.',
}

function ServiceDetail() {
  const { serviceId } = useParams()
  const index = serviceSections.findIndex((s) => s.id === serviceId)

  if (index === -1) return <NotFound />

  const service = serviceSections[index]
  const prev = serviceSections[(index - 1 + serviceSections.length) % serviceSections.length]
  const next = serviceSections[(index + 1) % serviceSections.length]
  const { Icon, proof } = serviceVisuals[service.id]
  // Only fire-pump-systems declares a spotlight today, and it does so to
  // override the badge with hand-written commissioning steps. Everything else
  // renders the split from the defaults above, so a service that later gets a
  // photograph adds its own `spotlight` block rather than needing the other
  // twelve edited to keep them in step.
  const spotlight = service.spotlight ?? {}

  return (
    <>
      <PageHero
        crumb={`Services / ${service.title}`}
        title={service.title}
        subtitle={blurbs[service.id]}
      />

      <section className="section" id="overview">
        <div className="container service-detail-layout">
          <Reveal className="service-detail-main">
            <p className="eyebrow">{disciplineLabels[service.category]}</p>
            {service.overview.map((p, i) => (
              <p key={i} className={i === 0 ? 'service-detail-lead' : 'service-detail-text'}>
                {p}
              </p>
            ))}
            <h2>{service.whyHeading}</h2>
            <p className="service-detail-pullquote">{service.whyText}</p>
          </Reveal>

          {/* Media-only split, sitting to the right of the why-section. It
              carries the photograph slot and nothing else: the why-section
              already states the scope in the pullquote directly beside it, and
              service.text said the same thing a second time. flip is gone
              because with no text column there is nothing to flip against. */}
          <Reveal delay={100}>
            <FeatureSplit
              image={null}
              imageAlt={`${service.title} project photo`}
              placeholderLabel={`${service.title} project photo`}
              dimensionsLabel={PHOTO_SLOT}
              FallbackIcon={Icon}
            />
          </Reveal>
        </div>
      </section>

      <section className="section section-alt" id="coverage">
        <div className="container">
          <Reveal variant="left" className="service-detail-block">
            <h2>{service.coverageHeading}</h2>
            {service.coverageIntro && (
              <p className="service-detail-text">{service.coverageIntro}</p>
            )}
            <ul className="check-list check-list-cards" aria-label={`${service.title} inclusions`}>
              {service.points.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <Reveal variant="right" className="service-detail-block" id="approach">
            <FeatureSplit
              heading="Installation & Maintenance Excellence"
              body={service.approach}
              image={spotlight.image ?? null}
              imageAlt={`${service.title} installation photo`}
              placeholderLabel={spotlight.placeholder ?? `${service.title} installation photo`}
              dimensionsLabel={spotlight.dimensions ?? PHOTO_SLOT}
              badgeTitle={spotlight.badgeTitle ?? proof}
              badgeItems={spotlight.badgeItems ?? badgeLabels(service.points)}
              flip={spotlight.flip ?? false}
              FallbackIcon={Icon}
            />
            {service.compliance && (
              <>
                <h2>Compliance</h2>
                <div className="service-compliance">
                  <ShieldCheck size={28} aria-hidden="true" />
                  <p>{service.compliance}</p>
                </div>
              </>
            )}
          </Reveal>
          <Reveal variant="scale" className="service-detail-block" delay={100} id="why-alnanda">
            <h2>Why choose ALNANDA Contracting</h2>
            <ul className="check-list" aria-label={`Why choose ALNANDA Contracting for ${service.title}`}>
              {service.whyChoose.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </Reveal>
          <Reveal as="nav" className="service-detail-nav" aria-label="More services">
            <Link
              to={`/services/${prev.id}`}
              className="service-nav-card"
              aria-label={`Previous service: ${prev.title}`}
            >
              <span className="service-nav-arrow" aria-hidden="true">←</span>
              <span>
                <small>Previous service</small>
                <strong>{prev.title}</strong>
              </span>
            </Link>
            <Link to="/services" className="card-link service-nav-all">
              All services
            </Link>
            <Link
              to={`/services/${next.id}`}
              className="service-nav-card service-nav-next"
              aria-label={`Next service: ${next.title}`}
            >
              <span>
                <small>Next service</small>
                <strong>{next.title}</strong>
              </span>
              <span className="service-nav-arrow" aria-hidden="true">→</span>
            </Link>
          </Reveal>
        </div>
      </section>

      <CTA />
    </>
  )
}

export default ServiceDetail
