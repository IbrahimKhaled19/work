import { useState } from 'react'
import { Link } from 'react-router-dom'
import PageHero from '../components/PageHero'

const galleryVisuals = {
  'fire-fighting-systems': {
    proof: 'DCD Approved • NFPA',
    icon: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 3c3.5 4.2 6 7.3 6 10.2A6 6 0 0 1 6 13.2C6 10.3 8.5 7.2 12 3Z" />
        <path d="M9.5 13.5a2.5 2.5 0 0 0 2.5 2.5" />
      </svg>
    ),
  },
  'fire-alarm-systems': {
    proof: 'NFPA • UAE Fire Code',
    icon: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M18 9a6 6 0 1 0-12 0c0 5-2 6-2 6h16s-2-1-2-6" />
        <path d="M10 20a2 2 0 0 0 4 0" />
        <path d="M20.5 8.5a8 8 0 0 1 0 5" />
        <path d="M3.5 8.5a8 8 0 0 0 0 5" />
      </svg>
    ),
  },
  'fire-extinguishers': {
    proof: 'DCD Certified',
    icon: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M10 8h4v11a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1V8Z" />
        <path d="M10 8V6a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v2" />
        <path d="M12 4v3" />
        <path d="M14 6h4a1 1 0 0 1 1 1v1" />
        <path d="M19 8v2a3 3 0 0 1-3 3h-1" />
      </svg>
    ),
  },
  'emergency-lighting': {
    proof: 'UAE Fire Code',
    icon: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M9 18h6" />
        <path d="M10 21h4" />
        <path d="M12 3a6 6 0 0 0-3.6 10.8c.7.6 1.1 1.2 1.1 2.2h5c0-1 .4-1.6 1.1-2.2A6 6 0 0 0 12 3Z" />
        <path d="M4 6l1 1M20 6l-1 1" />
      </svg>
    ),
  },
  'fire-suppression': {
    proof: 'NFPA Engineered',
    icon: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 3l7 3v5c0 5-3.5 8-7 10-3.5-2-7-5-7-10V6l7-3Z" />
        <path d="M9.5 12a2.5 2.5 0 0 0 2.5 2.5" />
        <path d="M12 7.5V10M10 8.5h4" />
      </svg>
    ),
  },
  amc: {
    proof: 'Monthly • 24/7',
    icon: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="4" y="5" width="16" height="15" rx="2" />
        <path d="M8 3v4M16 3v4M4 10h16" />
        <path d="M10 15l2 2 4-4" />
      </svg>
    ),
  },
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
          <div className="gallery-grid">
            {visibleItems.map((g) => (
              <Link
                to={`/services#${g.serviceId}`}
                className="gallery-item"
                key={g.id}
                aria-label={`${g.title} (${g.cat}), view system detail`}
              >
                <div className="gallery-visual" aria-hidden="true">
                  <div className="visual-stack">
                    <div className="visual-inner gallery-medallion">
                      {galleryVisuals[g.serviceId]?.icon}
                    </div>
                    <span className="visual-proof">{galleryVisuals[g.serviceId]?.proof}</span>
                  </div>
                </div>
                <figcaption>
                  <span className="gallery-cat">{g.cat}</span>
                  <h3>{g.title}</h3>
                  <span className="card-link">View system detail →</span>
                </figcaption>
              </Link>
            ))}
          </div>
          {visibleItems.length === 0 && (
            <p className="gallery-note" role="status">
              No panels in this group yet. Contact us for references in this discipline.
            </p>
          )}
          <p className="gallery-note">
            Project photography in progress. Panels above are illustrative, not
            site photos. For recent references or a site visit,{' '}
            <Link to="/contact">contact our engineers</Link> or call{' '}
            <a href="tel:+97125512311">+971 2 5512 311</a>.
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
              Contact Us
            </Link>
            <a
              href="tel:+97125512311"
              className="btn btn-outline cta-emergency"
              aria-label="Call 24/7 Emergency: +971 2 5512 311"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.13.96.36 1.9.7 2.8a2 2 0 0 1-.45 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.25a2 2 0 0 1 2.1-.45c.9.34 1.84.57 2.8.7A2 2 0 0 1 22 16.9z" />
              </svg>
              Call 24/7 Emergency
            </a>
          </div>
          <p className="cta-note">
            24/7 emergency: <a href="tel:+97125512311" style={{ color: 'inherit', fontWeight: 700 }}>+971 2 5512 311</a> · <a href="tel:+97125575527" style={{ color: 'inherit', fontWeight: 700 }}>+971 2 5575 527</a> · Dubai Civil Defense-approved partner.
          </p>
        </div>
      </section>
    </>
  )
}

export default Gallery
