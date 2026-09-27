import { useState } from 'react'
import { Link } from 'react-router-dom'
import PageHero from '../components/PageHero'
import Reveal from '../components/Reveal'
import SectionHead from '../components/SectionHead'
import CTA from '../components/CTA'
import serviceVisuals from '../data/serviceVisuals'
import site from '../seo/site.js'

const items = [
  { id: 'hydraulic-design', title: 'Hydraulic Design & Shop Drawings', cat: 'Engineering', serviceId: 'design-engineering', group: 'engineering' },
  { id: 'fire-pump-room', title: 'Electric & Diesel Pump Sets', cat: 'Fire Pumps', serviceId: 'fire-pump-systems', group: 'suppression' },
  { id: 'sprinkler-installation', title: 'Sprinkler Network Installation', cat: 'Sprinklers', serviceId: 'sprinkler-systems', group: 'suppression' },
  { id: 'hydrant-hose-reel', title: 'Standpipe & Hose Reel Systems', cat: 'Standpipe & Hose', serviceId: 'standpipe-hose-systems', group: 'suppression' },
  { id: 'addressable-panel', title: 'Addressable Detection & Notification', cat: 'Fire Alarm', serviceId: 'fire-alarm-detection', group: 'detection' },
  { id: 'fm200-cylinders', title: 'Clean Agent & Foam Suppression', cat: 'Suppression', serviceId: 'special-hazard-suppression', group: 'suppression' },
  { id: 'fire-doors', title: 'Fire Doors & Firestopping', cat: 'Passive Protection', serviceId: 'passive-fire-protection', group: 'engineering' },
  { id: 'portable-extinguisher', title: 'Extinguisher Supply & Service', cat: 'Extinguishers', serviceId: 'portable-extinguishers', group: 'suppression' },
  { id: 'amc-inspection', title: 'Inspection, Testing & Maintenance', cat: 'Maintenance', serviceId: 'inspection-testing-maintenance', group: 'maintenance' },
  { id: 'compliance-review', title: 'Civil Defense Compliance & Permitting', cat: 'Compliance', serviceId: 'civil-defense-compliance', group: 'maintenance' },
  { id: 'retrofit-upgrade', title: 'System Retrofit & Upgrade', cat: 'Retrofit', serviceId: 'retrofit-upgrade', group: 'maintenance' },
  { id: 'emergency-response', title: '24/7 Emergency Response & Repair', cat: 'Emergency', serviceId: 'emergency-repair-services', group: 'maintenance' },
  { id: 'staff-training', title: 'Staff Training & Evacuation Drills', cat: 'Training', serviceId: 'training-consulting', group: 'maintenance' },
]

const galleryFilters = [
  { id: 'all', label: 'All' },
  { id: 'engineering', label: 'Engineering' },
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
        subtitle="Illustrative panels for the systems we design, install and maintain across Egypt. Filter by discipline, open a panel for system detail."
      />

      <section className="section">
        <div className="container">
          <SectionHead
            eyebrow="Civil Defense-Approved Work"
            title="Systems we install and maintain"
            text="Thirteen illustrative panels grouped by discipline. Open any panel for system detail, or contact us for recent references."
          />
          <Reveal className="services-filter-wrap" delay={100}>
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
          </Reveal>
          {/* TODO: panel photography, 800x600 per panel, real installs */}
          <Reveal className="gallery-grid" delay={150}>
            {visibleItems.map((g) => {
              const { Icon, proof } = serviceVisuals[g.serviceId]
              return (
                <Link
                  to={`/services/${g.serviceId}`}
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
          </Reveal>
          <p className="gallery-note">
            Project photography in progress. Panels above are illustrative, not
            site photos. For recent references or a site visit,{' '}
            <Link to="/contact">contact our engineers</Link> or WhatsApp{' '}
            <a href="https://wa.me/201003620490" target="_blank" rel="noopener noreferrer">+20 100 362 0490</a>.
          </p>
        </div>
      </section>

      <CTA
        title="Need a Quote or Site Inspection?"
        subtitle={`Send a quote request during working hours (${site.hours.inline}), and our engineers will contact you.`}
        note="WhatsApp 24/7: +20 100 362 0490 · Civil Defense-approved partner."
      />
    </>
  )
}

export default Gallery
