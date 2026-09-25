import { Link, useParams } from 'react-router-dom'
import { WhatsappLogo } from '@phosphor-icons/react/WhatsappLogo'
import { ShieldCheck } from '@phosphor-icons/react/ShieldCheck'
import PageHero from '../components/PageHero'
import Reveal from '../components/Reveal'
import FeatureSplit from '../components/FeatureSplit'
import CTA from '../components/CTA'
import NotFound from './NotFound'
import { serviceSections, disciplineLabels } from '../data/services'
import serviceVisuals from '../data/serviceVisuals'

const WHATSAPP_URL = 'https://wa.me/201003620490'

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

          <Reveal className="about-card" variant="scale" delay={100}>
            <span className="proof-seal-badge" aria-hidden="true">
              <Icon size={44} color="#fff" />
            </span>
            <h3>{proof}</h3>
            <p className="aside-creds">
              <ShieldCheck size={16} aria-hidden="true" />
              GACP Egypt Certified
            </p>
            <p>{service.cta.text}</p>
            <div className="cta-actions">
              {service.cta.href === 'whatsapp' ? (
                <a href="tel:+201003620490" className="btn btn-solid btn-light">
                  {service.cta.label}
                </a>
              ) : (
                <Link to="/contact" className="btn btn-solid btn-light">
                  {service.cta.label}
                </Link>
              )}
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline cta-emergency"
                aria-label="Chat on WhatsApp: +20 100 362 0490"
              >
                <WhatsappLogo size={16} aria-hidden="true" />
                Chat on WhatsApp
              </a>
            </div>
            {service.cta.href === 'whatsapp' && (
              <p className="cta-note">
                <a href="tel:+201003620490">01003620490</a>
              </p>
            )}
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
            {service.spotlight ? (
              <FeatureSplit
                heading="Installation & Maintenance Excellence"
                body={service.approach}
                image={service.spotlight.image}
                imageAlt={`${service.title} installation photo`}
                placeholderLabel={service.spotlight.placeholder}
                dimensionsLabel={service.spotlight.dimensions}
                badgeTitle={service.spotlight.badgeTitle}
                badgeItems={service.spotlight.badgeItems}
                flip={service.spotlight.flip}
                FallbackIcon={Icon}
              />
            ) : (
              service.approach && (
                <>
                  <h2>Installation &amp; Maintenance Excellence</h2>
                  <p className="service-detail-text">{service.approach}</p>
                </>
              )
            )}
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
