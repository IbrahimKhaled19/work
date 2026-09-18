import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import PageHero from '../components/PageHero'

const serviceVisuals = {
  'fire-fighting-systems': {
    proof: 'DCD Approved • NFPA',
    icon: (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 3c3.5 4.2 6 7.3 6 10.2A6 6 0 0 1 6 13.2C6 10.3 8.5 7.2 12 3Z" />
        <path d="M9.5 13.5a2.5 2.5 0 0 0 2.5 2.5" />
      </svg>
    ),
  },
  'fire-alarm-systems': {
    proof: 'NFPA • UAE Fire Code',
    icon: (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 3l7 3v5c0 5-3.5 8-7 10-3.5-2-7-5-7-10V6l7-3Z" />
        <path d="M9.5 12a2.5 2.5 0 0 0 2.5 2.5" />
        <path d="M12 7.5V10M10 8.5h4" />
      </svg>
    ),
  },
  amc: {
    proof: 'Monthly • 24/7',
    icon: (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="4" y="5" width="16" height="15" rx="2" />
        <path d="M8 3v4M16 3v4M4 10h16" />
        <path d="M10 15l2 2 4-4" />
      </svg>
    ),
  },
}

const serviceSections = [
  {
    id: 'fire-fighting-systems',
    short: 'Fire Fighting',
    category: 'suppression',
    eyebrow: 'Water-Based Protection',
    title: 'Fire Fighting Systems',
    text: 'We supply, design, install, test and commission complete fire fighting systems in accordance with international standards (NFPA, UAE Fire Code) under the supervision of experienced and qualified engineers.',
    points: [
      'Fire Pump System',
      'Fire Hydrant System',
      'Fire Hose Reel System',
      'Sprinkler System',
      'Pressure Reducing Valves',
    ],
  },
  {
    id: 'fire-alarm-systems',
    short: 'Fire Alarms',
    category: 'detection',
    eyebrow: 'Early Detection',
    title: 'Fire Alarm Systems',
    text: 'Early detection saves lives. We install certified fire alarm systems engineered for fast detection, reliable notification and seamless compliance.',
    points: [
      'Addressable Fire Alarm System',
      'Conventional Fire Alarm',
      'Smoke & Heat Detectors',
      'Manual Call Points',
      'Aspiration Smoke Detection (ASD), air-sampling early warning',
    ],
  },
  {
    id: 'fire-extinguishers',
    short: 'Extinguishers',
    category: 'maintenance',
    eyebrow: 'Inspect · Refill · Certify',
    title: 'Fire Extinguishers',
    text: 'We service, inspect, refill, maintain and certify all types of fire extinguishers to Civil Defense requirements, keeping every unit ready for action.',
    points: [
      'DCP, CO2, Water & Foam Extinguishers',
      'Hydro Testing',
      'Refilling of all types',
      'Extinguisher Hiring Service',
      'Annual Certification',
    ],
  },
  {
    id: 'emergency-lighting',
    short: 'Emergency Lighting',
    category: 'detection',
    eyebrow: 'Safe Evacuation',
    title: 'Emergency & Exit Lighting',
    text: 'Emergency and exit light systems ensure safe evacuation during power failure and guide occupants to exits in an emergency.',
    points: [
      'Emergency Lighting Installation',
      'Exit Sign Deployment',
      'Battery Backup Systems',
      'Testing & Maintenance',
    ],
  },
  {
    id: 'fire-suppression',
    short: 'Suppression',
    category: 'suppression',
    eyebrow: 'Clean-Agent Protection',
    title: 'Fire Suppression Systems',
    text: 'Clean agent suppression for environments with heavy power equipment and sensitive assets, with rapid response, no residue and no equipment damage.',
    points: [
      'FM200 (clean-agent gas) suppression',
      'Novec 1230 (clean-agent fluid) suppression',
      'CO2 Suppression',
      'Inert Gas (IG) systems (oxygen-reducing gas blends)',
      'Kitchen Hood Suppression',
    ],
  },
  {
    id: 'amc',
    short: 'AMC',
    category: 'maintenance',
    eyebrow: 'Maintain · Comply · Protect',
    title: 'Annual Maintenance Contract (AMC)',
    text: 'Comprehensive Annual Maintenance Contract (AMC) that guarantees 24/7 support, monthly inspections and full Civil Defense compliance, protecting you from penalties and risk.',
    points: [
      'Monthly Scheduled Inspections',
      '24/7 Emergency Call-Out',
      'System Testing & Reports',
      'Civil Defense Compliance',
      'Priority Response',
    ],
  },
]

const serviceFilters = [
  { id: 'all', label: 'All' },
  { id: 'detection', label: 'Detection' },
  { id: 'suppression', label: 'Suppression' },
  { id: 'maintenance', label: 'Maintenance' },
]

const VISIBLE_POINTS = 4

function Services() {
  const [activeId, setActiveId] = useState(serviceSections[0].id)
  const [activeFilter, setActiveFilter] = useState('all')
  const [expanded, setExpanded] = useState({})

  const visibleSections =
    activeFilter === 'all'
      ? serviceSections
      : serviceSections.filter((s) => s.category === activeFilter)

  useEffect(() => {
    const currentSections =
      activeFilter === 'all'
        ? serviceSections
        : serviceSections.filter((s) => s.category === activeFilter)
    const sections = currentSections
      .map((s) => document.getElementById(s.id))
      .filter(Boolean)
    if (sections.length === 0) return
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id)
        })
      },
      { rootMargin: '-30% 0px -60% 0px', threshold: 0 }
    )
    sections.forEach((sec) => observer.observe(sec))
    return () => observer.disconnect()
  }, [activeFilter])

  const toggleExpanded = (id) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }))

  const handleFilter = (id) => {
    setActiveFilter(id)
    const first =
      id === 'all'
        ? serviceSections[0]
        : serviceSections.find((s) => s.category === id)
    if (first) setActiveId(first.id)
  }

  const handleTocClick = (e, id) => {
    const target = serviceSections.find((s) => s.id === id)
    if (
      activeFilter !== 'all' &&
      target &&
      target.category !== activeFilter
    ) {
      e.preventDefault()
      setActiveFilter('all')
      setActiveId(id)
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
      }, 60)
    }
  }

  return (
    <>
      <PageHero
        crumb="Services"
        title="Our Services"
        subtitle="End-to-end fire protection solutions: design, supply, installation, testing, commissioning and maintenance."
      />

      <div className="services-toc-bar">
        <div className="container">
          <nav className="services-toc" aria-label="Services sections">
            {serviceSections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                onClick={(e) => handleTocClick(e, s.id)}
                className={activeId === s.id ? 'toc-chip is-active' : 'toc-chip'}
                aria-current={activeId === s.id ? 'location' : undefined}
              >
                {s.short}
              </a>
            ))}
          </nav>
        </div>
      </div>

      <section className="section">
        <div className="container">
          <div className="services-filter-wrap">
            <div className="services-filter" role="group" aria-label="Filter services by category">
              {serviceFilters.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  className={activeFilter === f.id ? 'filter-chip is-active' : 'filter-chip'}
                  aria-pressed={activeFilter === f.id}
                  onClick={() => handleFilter(f.id)}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <p className="services-count" aria-live="polite">
              Showing {visibleSections.length} of {serviceSections.length} services
            </p>
          </div>
          <div className="services-list">
            {visibleSections.map((s, idx) => {
              const originalIndex = serviceSections.findIndex((item) => item.id === s.id)
              const isOpen = !!expanded[s.id]
              const needsExpander = s.points.length > VISIBLE_POINTS
              const visiblePoints = isOpen || !needsExpander ? s.points : s.points.slice(0, VISIBLE_POINTS)
              const hiddenCount = s.points.length - VISIBLE_POINTS
              return (
                <article className="service-block" id={s.id} key={s.id}>
                  <div className={`service-body ${idx % 2 ? 'order-2' : ''}`}>
                    <p className="eyebrow">{String(originalIndex + 1).padStart(2, '0')} · {s.eyebrow}</p>
                    <h2>{s.title}</h2>
                    <p>{s.text}</p>
                    <ul className="check-list" id={`${s.id}-list`}>
                      {visiblePoints.map((p) => (
                        <li key={p}>{p}</li>
                      ))}
                    </ul>
                    {needsExpander && (
                      <button
                        type="button"
                        className="service-expander"
                        aria-expanded={isOpen}
                        aria-controls={`${s.id}-list`}
                        onClick={() => toggleExpanded(s.id)}
                      >
                        {isOpen ? 'Show less' : `Show all ${s.points.length} inclusions (+${hiddenCount} more)`}
                      </button>
                    )}
                  </div>
                  <div className={`service-visual ${idx % 2 ? 'order-1' : ''}`}>
                    <div className="visual-stack">
                      <div className="visual-inner" aria-hidden="true">
                        {serviceVisuals[s.id]?.icon}
                      </div>
                      <span className="visual-proof">{serviceVisuals[s.id]?.proof}</span>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
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

export default Services