import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CaretDown } from '@phosphor-icons/react/CaretDown'
import { WhatsappLogo } from '@phosphor-icons/react/WhatsappLogo'
import PageHero from '../components/PageHero'
import Reveal from '../components/Reveal'
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
        crumb="Services"
        title="Complete Fire Protection Systems: Engineered for Compliance, Built for Reliability"
        subtitle="For 25 years, ALNANDA Contracting has designed, installed, and maintained fire protection systems for factories, warehouses, and commercial facilities across Egypt. Fire protection is not one system. It is thirteen disciplines working together, from the earliest hydraulic calculation to the last annual inspection, and a gap in any one of them is a gap in the whole facility's safety."
      />

      <section className="section">
        <div className="container">
          <SectionHead
            eyebrow="What We Do"
            title="Our Fire Safety Services"
            text="Survey, design, install and maintain to NFPA and Egyptian Fire Protection Code."
          />
          <ServicesTabs />
        </div>
      </section>

      <section className="section section-alt">
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
                    <p>{svc.text}</p>
                    <ul className="check-list" aria-label="Service inclusions">
                      {svc.points.map((p) => (
                        <li key={p}>{p}</li>
                      ))}
                    </ul>
                    {svc.standards && (
                      <p className="service-standards">
                        <strong>Standards:</strong> {svc.standards}
                      </p>
                    )}
                    <div className="acc-actions">
                      <Link to={`/services/${svc.id}`} className="card-link">
                        View full page →
                      </Link>
                      <Link to="/contact" className="btn btn-solid">
                        Request Quote for {svc.short}
                      </Link>
                      <a
                        href="https://wa.me/201003620490"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-outline"
                      >
                        <WhatsappLogo size={14} aria-hidden="true" />
                        WhatsApp Us
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