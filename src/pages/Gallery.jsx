import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Drop } from '@phosphor-icons/react/Drop'
import { BellRinging } from '@phosphor-icons/react/BellRinging'
import { FireExtinguisher } from '@phosphor-icons/react/FireExtinguisher'
import { Lamp } from '@phosphor-icons/react/Lamp'
import { ShieldCheck } from '@phosphor-icons/react/ShieldCheck'
import { CalendarCheck } from '@phosphor-icons/react/CalendarCheck'
import { WhatsappLogo } from '@phosphor-icons/react/WhatsappLogo'
import PageHero from '../components/PageHero'

const galleryVisuals = {
  'fire-fighting-systems': { proof: 'DCD Approved, NFPA', Icon: Drop },
  'fire-alarm-systems': { proof: 'NFPA, UAE Fire Code', Icon: BellRinging },
  'fire-extinguishers': { proof: 'DCD Certified', Icon: FireExtinguisher },
  'emergency-lighting': { proof: 'UAE Fire Code', Icon: Lamp },
  'fire-suppression': { proof: 'NFPA Engineered', Icon: ShieldCheck },
  amc: { proof: 'Monthly, 24/7', Icon: CalendarCheck },
}

const items = [
  { id: 'sprinkler-installation', title: 'Sprinkler System Installation', cat: 'Fire Fighting', serviceId: 'fire-fighting-systems', group: 'suppression' },
  { id: 'fire-pump-room', title: 'Fire Pump Room Setup', cat: 'Fire Fighting', serviceId: 'fire-fighting-systems', group: 'suppression' },
  { id: 'addressable-panel', title: 'Addressable Fire Alarm Panel', cat: 'Fire Alarm', serviceId: 'fire-alarm-systems', group: 'detection' },
  { id: 'conventional-network', title: 'Conventional Fire Alarm Network', cat: 'Fire Alarm', serviceId: 'fire-alarm-systems', group: 'detection' },
  { id: 'portable-extinguisher', title: 'Portable Extinguisher Supply', cat: 'Extinguishers', serviceId: 'fire-extinguishers', group: 'maintenance' },
  { id: 'extinguisher-service', title: 'Extinguisher Refilling & Service', cat: 'Extinguishers', serviceId: 'fire-extinguishers', group: 'maintenance' },
  { id: 'fm200-cylinders', title: 'FM200 Suppression Cylinders', cat: 'Suppression', serviceId: 'fire-suppression', group: 'suppression' },
  { id: 'novec-server-room', title: 'Server Room Novec Protection', cat: 'Suppression', serviceId: 'fire-suppression', group: 'suppression' },
  { id: 'emergency-lighting', title: 'Emergency & Exit Lighting', cat: 'Life Safety', serviceId: 'emergency-lighting', group: 'detection' },
  { id: 'hydrant-hose-reel', title: 'Fire Hydrant & Hose Reel System', cat: 'Fire Fighting', serviceId: 'fire-fighting-systems', group: 'suppression' },
  { id: 'amc-inspection', title: 'Annual Maintenance Contract (AMC) Inspection in Progress', cat: 'Maintenance', serviceId: 'amc', group: 'maintenance' },
  { id: 'hydro-testing', title: 'Hydro Testing Facility', cat: 'Extinguishers', serviceId: 'fire-extinguishers', group: 'maintenance' },
]

const galleryFilters = [
  { id: 'all', label: 'All' },
  { id: 'detection', label: 'Detection' },
  { id: 'suppression', label: 'Suppression' },
  { id: 'maintenance', label: 'Maintenance' },
]

function Gallery() {
  const [activeFilter, setActiveFilter] = useState('all')

  const visibleItems =
    activeFilter === 'all'
      ? items
      : items.filter((g) => g.group === activeFilter)

  return (
    <>
      <PageHero
        crumb="Gallery"
        title="Our Work"
        subtitle="Illustrative panels for the systems we design, install and maintain across the UAE. Filter by discipline, open a panel for system detail."
      />

      <section className="section">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">DCD-Approved Work</p>
            <h2>Systems we install and maintain</h2>
            <p>
              Twelve illustrative panels grouped by discipline. Open any panel
              for system detail, or contact us for recent references.
            </p>
          </div>
          <div className="services-filter-wrap">
            <div className="services-filter" role="group" aria-label="Filter gallery by discipline">
              {galleryFilters.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  className={activeFilter === f.id ? 'filter-chip is-active' : 'filter-chip'}
                  aria-pressed={activeFilter === f.id}
                  onClick={() => setActiveFilter(f.id)}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <p className="services-count" aria-live="polite">
              Showing {visibleItems.length} of {items.length} panels
            </p>
          </div>
          {/* TODO: panel photography, 800x600 per panel, real installs */}
          <div className="gallery-grid">
            {visibleItems.map((g) => {
              const { Icon, proof } = galleryVisuals[g.serviceId]
              return (
                <Link
                  to={`/services#${g.serviceId}`}
                  className="gallery-item"
                  key={g.id}
                  aria-label={`${g.title} (${g.cat}), view system detail`}
                >
                  <div className="gallery-visual" aria-hidden="true">
                    <div className="visual-stack">
                      <div className="visual-inner gallery-medallion">
                        <Icon size={36} color="#fff" />
                      </div>
                      <span className="visual-proof">{proof}</span>
                    </div>
                  </div>
                  <div className="gallery-caption">
                    <span className="gallery-cat">{g.cat}</span>
                    <h3>{g.title}</h3>
                    <span className="card-link">View system detail →</span>
                  </div>
                </Link>
              )
            })}
          </div>
          <p className="gallery-note">
            Project photography in progress. Panels above are illustrative, not
            site photos. For recent references or a site visit,{' '}
            <Link to="/contact">contact our engineers</Link> or WhatsApp{' '}
            <a href="https://wa.me/201095438894" target="_blank" rel="noopener noreferrer">+20 109 543 8894</a>.
          </p>
        </div>
      </section>

      <section className="cta">
        <div className="container cta-inner">
          <h2>Need a Quote or Site Inspection?</h2>
          <p>
            Send a quote request during working hours (Mon-Sat, 8:00 AM-6:00 PM),
            and our engineers will contact you within 1 hour.
          </p>
          <div className="cta-actions">
            <Link to="/contact" className="btn btn-solid btn-light">
              Get a Free Quote
            </Link>
            <a
              href="https://wa.me/201095438894"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline cta-emergency"
              aria-label="Chat on WhatsApp: +20 109 543 8894"
            >
              <WhatsappLogo size={16} aria-hidden="true" />
              Chat on WhatsApp
            </a>
          </div>
          <p className="cta-note">
            WhatsApp 24/7: <a href="https://wa.me/201095438894" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', fontWeight: 700 }}>+20 109 543 8894</a> · Dubai Civil Defense-approved partner.
          </p>
        </div>
      </section>
    </>
  )
}

export default Gallery
