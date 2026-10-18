import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CaretDown } from '@phosphor-icons/react/CaretDown'
import { WhatsappLogo } from '@phosphor-icons/react/WhatsappLogo'
import PageHero from '../components/PageHero'
import Reveal from '../components/Reveal'
import site from '../seo/site.js'
import SectionHead from '../components/SectionHead'
import ServicesTabs from '../components/ServicesTabs'
import CTA from '../components/CTA'
import serviceVisuals from '../data/serviceVisuals'
import { serviceSections } from '../data/services'

function Services() {
  const [expanded, setExpanded] = useState(null)

  return (
    <>
      <PageHero
        crumbs={[{ label: 'Services' }]}
      imageId="hero-services"
        title="Complete Fire Protection Systems: Engineered for Compliance, Built for Reliability"
        subtitle={`For ${site.yearsExperience} years, ALNADA Contracting has designed, installed, and maintained fire protection systems for factories, warehouses, and commercial facilities across Egypt. Fire protection is not one system. It is thirteen disciplines working together, from the earliest hydraulic calculation to the last annual inspection, and a gap in any one of them is a gap in the whole facility's safety.`}
      />

      <section className="section">
        <div className="container">
          <SectionHead
            eyebrow="What We Do"
            title="Our Fire Protection Services"
            text="One contractor, every fire protection discipline your facility requires."
          />
          <ServicesTabs />
        </div>
      </section>

      {/* cv-skip: 13 accordion rows, several thousand pixels below the fold on
          any viewport. The tall placeholder matters most here - 13 rows of
          text is far more than --cv-medium, and understating it would move
          the scrollbar when the section renders. */}
      <section className="section section-alt cv-skip cv-tall">
        <div className="container">
          <SectionHead
            title="Service Details"
            text="Open a panel to see what is included, or go straight to the contact form for a scope-specific quote."
          />
          <div className="services-list">
            {serviceSections.map((svc) => {
              const { Icon, proof } = serviceVisuals[svc.id]
              const isOpen = expanded === svc.id
              return (
                <Reveal as="article" className="service-acc" id={svc.id} key={svc.id}>
                  <button
                    type="button"
                    className="service-acc-head"
                    onClick={() => setExpanded(isOpen ? null : svc.id)}
                    aria-expanded={isOpen}
                    aria-controls={`${svc.id}-panel`}
                    id={`${svc.id}-button`}
                  >
                    <span className="service-acc-icon" aria-hidden="true">
                      <Icon size={24} />
                    </span>
                    <span className="service-acc-title">{svc.title}</span>
                    <span className="visual-proof">{proof}</span>
                    <span className="service-acc-chev" aria-hidden="true">
                      <CaretDown size={20} />
                    </span>
                  </button>
                  <div
                    className="service-acc-panel"
                    id={`${svc.id}-panel`}
                    role="region"
                    aria-labelledby={`${svc.id}-button`}
                    hidden={!isOpen}
                  >
                    <p className="service-acc-lede">{svc.text}</p>
                    <ul className="check-list" aria-label={`${svc.title} inclusions`}>
                      {svc.points.map((p) => (
                        <li key={p}>{p}</li>
                      ))}
                    </ul>
                    {svc.standards && (
                      <p className="service-standards">
                        <strong>Standards:</strong> {svc.standards}
                      </p>
                    )}
                    {/* One primary action and two quiet links.

                        The WhatsApp route used to be an outline button, and
                        .btn-outline is a dark-surface component - white text on
                        a transparent fill - so on this light panel it measured
                        1.21:1 against the section and was invisible to anyone
                        who could not pick out the faint white border. The route
                        is worth keeping; that component was not. */}
                    <div className="acc-actions">
                      <Link to="/contact" className="btn btn-solid">
                        Request a quote for {svc.short}
                      </Link>
                      <Link to={`/services/${svc.id}`} className="acc-link">
                        View the full page &rarr;
                      </Link>
                      <a
                        href={site.contact.whatsapp}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="acc-link acc-link-whatsapp"
                      >
                        <WhatsappLogo size={15} aria-hidden="true" />
                        WhatsApp us
                      </a>
                    </div>
                  </div>
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>

      <CTA
        title="Don't compromise on fire safety."
        subtitle="Request a free site survey and let our team tell you exactly what your facility needs to be fully protected and fully compliant."
        quoteText="Request a Free Site Survey"
        note=""
      />
    </>
  )
}

export default Services