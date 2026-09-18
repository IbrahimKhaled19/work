import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Drop } from '@phosphor-icons/react/Drop'
import { BellRinging } from '@phosphor-icons/react/BellRinging'
import { FireExtinguisher } from '@phosphor-icons/react/FireExtinguisher'
import { Lamp } from '@phosphor-icons/react/Lamp'
import { ShieldCheck } from '@phosphor-icons/react/ShieldCheck'
import { CalendarCheck } from '@phosphor-icons/react/CalendarCheck'
import { CaretDown } from '@phosphor-icons/react/CaretDown'
import { WhatsappLogo } from '@phosphor-icons/react/WhatsappLogo'
import PageHero from '../components/PageHero'

const serviceVisuals = {
  'fire-fighting-systems': { proof: 'DCD Approved, NFPA', Icon: Drop },
  'fire-alarm-systems': { proof: 'NFPA, UAE Fire Code', Icon: BellRinging },
  'fire-extinguishers': { proof: 'DCD Certified', Icon: FireExtinguisher },
  'emergency-lighting': { proof: 'UAE Fire Code', Icon: Lamp },
  'fire-suppression': { proof: 'NFPA Engineered', Icon: ShieldCheck },
  amc: { proof: 'Monthly, 24/7', Icon: CalendarCheck },
}

const serviceSections = [
  {
    id: 'fire-fighting-systems',
    short: 'Fire Fighting',
    category: 'suppression',
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

const disciplines = [
  {
    id: 'detection',
    title: 'Detection',
    blurb: 'Early warning and safe evacuation.',
    services: ['fire-alarm-systems', 'emergency-lighting'],
  },
  {
    id: 'suppression',
    title: 'Suppression',
    blurb: 'Water-based and clean-agent fire control.',
    services: ['fire-fighting-systems', 'fire-suppression'],
  },
  {
    id: 'maintenance',
    title: 'Maintenance',
    blurb: 'Inspection, certification and year-round cover.',
    services: ['fire-extinguishers', 'amc'],
  },
]

const byId = Object.fromEntries(serviceSections.map((s) => [s.id, s]))

function Services() {
  const { hash } = useLocation()
  const [activeId, setActiveId] = useState(serviceSections[0].id)
  const [openId, setOpenId] = useState(() =>
    hash && byId[hash.slice(1)] ? hash.slice(1) : serviceSections[0].id
  )
  const [seenHash, setSeenHash] = useState(hash)
  if (hash !== seenHash) {
    setSeenHash(hash)
    const id = hash ? hash.slice(1) : null
    if (id && byId[id]) setOpenId(id)
  }

  useEffect(() => {
    const sections = serviceSections
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
  }, [])

  const handleTocClick = (e, id) => {
    e.preventDefault()
    setOpenId(id)
    setActiveId(id)
    requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
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
          <div className="services-list">
            {disciplines.map((d) => (
              <div className="discipline" key={d.id}>
                <h2 className="discipline-title">{d.title}</h2>
                <p className="discipline-blurb">{d.blurb}</p>
                <div className="discipline-items">
                  {d.services.map((id) => {
                    const s = byId[id]
                    const { proof, Icon } = serviceVisuals[s.id]
                    const open = openId === s.id
                    return (
                      <article className="service-acc" id={s.id} key={s.id}>
                        <button
                          type="button"
                          className="service-acc-head"
                          aria-expanded={open}
                          aria-controls={`${s.id}-panel`}
                          id={`${s.id}-button`}
                          onClick={() => setOpenId(open ? null : s.id)}
                        >
                          <span className="service-acc-icon" aria-hidden="true">
                            <Icon size={24} />
                          </span>
                          <span className="service-acc-title">{s.title}</span>
                          <span className="visual-proof">{proof}</span>
                          <span className="service-acc-chev" aria-hidden="true">
                            <CaretDown size={20} />
                          </span>
                        </button>
                        <div
                          className="service-acc-panel"
                          id={`${s.id}-panel`}
                          role="region"
                          aria-labelledby={`${s.id}-button`}
                          hidden={!open}
                        >
                          {/* TODO: discipline visual, 1200x800 photographic per service */}
                          <p>{s.text}</p>
                          <ul className="check-list">
                            {s.points.map((p) => (
                              <li key={p}>{p}</li>
                            ))}
                          </ul>
                        </div>
                      </article>
                    )
                  })}
                </div>
              </div>
            ))}
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

export default Services