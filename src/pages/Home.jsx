import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ShieldCheck } from '@phosphor-icons/react/ShieldCheck'
import { FileText } from '@phosphor-icons/react/FileText'
import { Clock } from '@phosphor-icons/react/Clock'
import { Buildings } from '@phosphor-icons/react/Buildings'
import { FireExtinguisher } from '@phosphor-icons/react/FireExtinguisher'
import { Lightning } from '@phosphor-icons/react/Lightning'

const stats = [
  { value: '35+', label: 'Years of Experience' },
  { value: '1000+', label: 'Projects Delivered', to: '/gallery', aria: 'View project gallery: 1000+ projects delivered' },
  { value: '500+', label: 'Active AMC Clients' },
  { value: '24/7', label: 'Emergency Support' },
]

const serviceGroups = [
  {
    id: 'detection',
    label: 'Detection',
    services: [
      {
        title: 'Fire Alarm Systems',
        desc: 'Addressable and conventional detection, call points and monitoring for complete protection.',
        anchor: 'fire-alarm-systems',
      },
      {
        title: 'Emergency Lighting',
        desc: 'Exit and emergency lighting for safe evacuation during power failure.',
        anchor: 'emergency-lighting',
      },
    ],
  },
  {
    id: 'suppression',
    label: 'Suppression',
    services: [
      {
        title: 'Fire Fighting Systems',
        desc: 'Sprinkler, hydrant, hose reel and fire pump systems. Designed, installed and commissioned to NFPA & UAE Fire Code.',
        anchor: 'fire-fighting-systems',
      },
      {
        title: 'Fire Suppression',
        desc: 'FM200, Novec and CO2 clean-agent systems for server rooms and sensitive assets.',
        anchor: 'fire-suppression',
      },
    ],
  },
  {
    id: 'maintenance',
    label: 'Maintenance',
    services: [
      {
        title: 'Fire Extinguishers',
        desc: 'Supply, refilling, hydro testing and certification of all portable types.',
        anchor: 'fire-extinguishers',
      },
      {
        title: 'Annual Maintenance Contract (AMC)',
        desc: 'Monthly inspections, 24/7 support and full Civil Defense compliance.',
        anchor: 'amc',
      },
    ],
  },
]

const whyUs = [
  {
    icon: ShieldCheck,
    title: 'DCD Approved',
    desc: 'Fully licensed and approved by Dubai Civil Defense for all fire protection works.',
  },
  {
    icon: Buildings,
    title: 'End-to-End Solutions',
    desc: 'From survey and design to installation, testing, commissioning and maintenance.',
  },
  {
    icon: FireExtinguisher,
    title: 'All Equipment Types',
    desc: 'Single source for supply of complete fire and life safety equipment.',
  },
  {
    icon: Lightning,
    title: 'Fast Response',
    desc: 'Get an inspection, quote or emergency call-out. Our engineers respond fast.',
  },
]

const pathSteps = [
  {
    step: '01 - Survey',
    title: 'Site Survey',
    desc: 'On-site inspection and Civil Defense requirements review before any quote.',
  },
  {
    step: '02 - Design',
    title: 'Code Design',
    desc: 'System design to NFPA and UAE Fire Code for approval-first delivery.',
  },
  {
    step: '03 - Install',
    title: 'Install & Commission',
    desc: 'Certified supply, installation, testing and commissioning in one scope.',
  },
  {
    step: '04 - Maintain',
    title: 'Maintain & Cover',
    desc: 'Monthly Annual Maintenance Contract (AMC) inspections with 24/7 emergency call-out and compliance cover.',
  },
]

function ServicesTabs() {
  const [active, setActive] = useState(serviceGroups[0].id)
  const group = serviceGroups.find((g) => g.id === active)

  return (
    <div className="services-tabs">
      <div className="tab-list" role="tablist" aria-label="Service disciplines">
        {serviceGroups.map((g) => (
          <button
            key={g.id}
            type="button"
            role="tab"
            id={`tab-${g.id}`}
            aria-selected={active === g.id}
            aria-controls={`panel-${g.id}`}
            className="tab-btn"
            onClick={() => setActive(g.id)}
          >
            {g.label}
          </button>
        ))}
      </div>
      <div
        className="tab-panel"
        role="tabpanel"
        id={`panel-${group.id}`}
        aria-labelledby={`tab-${group.id}`}
      >
        {group.services.map((s) => (
          <Link to={`/services#${s.anchor}`} className="tab-service" key={s.title}>
            <h3>{s.title}</h3>
            <p>{s.desc}</p>
            <span className="card-link">View detail →</span>
          </Link>
        ))}
      </div>
    </div>
  )
}

function Home() {
  return (
    <>
      <section className="hero">
        {/* TODO: hero visual, 1600x1200 photographic, pump room or suppression install */}
        <div className="hero-overlay"></div>
        <div className="container hero-content">
          <h1>
            Protecting Lives &amp; Assets
            <br />
            <span>with Reliable Fire Protection Systems</span>
          </h1>
          <p className="hero-lead">
            Over 35 years designing, installing and maintaining
            fire fighting and life safety systems to Dubai Civil Defense standards.
          </p>
          <div className="hero-actions">
            <Link to="/contact" className="btn btn-solid">Get a Free Quote</Link>
            <Link to="/services" className="btn btn-outline">Explore Services</Link>
          </div>
          <ul className="hero-proof" aria-label="Compliance and availability">
            <li>
              <ShieldCheck size={16} aria-hidden="true" />
              <span>DCD Approved</span>
            </li>
            <li>
              <FileText size={16} aria-hidden="true" />
              <span>NFPA &amp; UAE Fire Code</span>
            </li>
            <li>
              <Clock size={16} aria-hidden="true" />
              <a href="tel:+97125512311">Mon-Sat 8-6 · 24/7 Emergency: +971 2 5512 311</a>
            </li>
          </ul>
        </div>
      </section>

      <section className="stats">
        <div className="container stats-grid">
          {stats.map((s) =>
            s.to ? (
              <Link to={s.to} className="stat stat-link" key={s.label} aria-label={s.aria}>
                <strong>{s.value}</strong>
                <span>{s.label}</span>
              </Link>
            ) : (
              <div className="stat" key={s.label}>
                <strong>{s.value}</strong>
                <span>{s.label}</span>
              </div>
            )
          )}
        </div>
      </section>

      <section className="section proof-band" aria-label="Compliance proof">
        <div className="container">
          <div className="section-head">
            <h2>Compliance you can point to</h2>
            <p>
              A DCD-approved partner from survey to maintenance, delivering
              to NFPA and UAE Fire Code standards.
            </p>
          </div>
          <div className="proof-grid">
            <div className="proof-seal">
              <span className="proof-seal-badge" aria-hidden="true">
                <ShieldCheck size={44} />
              </span>
              <p className="proof-seal-kicker">Dubai Civil Defense</p>
              <h3>Approved Partner</h3>
              <ul>
                <li>NFPA &amp; UAE Fire Code delivery</li>
                <li>Survey → install → Annual Maintenance Contract (AMC), one scope</li>
                <li>Monthly inspections · 24/7 call-out</li>
              </ul>
              <p className="proof-seal-note">UFS visual, not an official seal.</p>
            </div>
            <div className="proof-strip">
              <ul className="proof-facts" aria-label="Verifiable compliance facts">
                <li>
                  <strong>NFPA &amp; UAE Fire Code</strong>
                  <span>Design, install &amp; commission to approved standards</span>
                </li>
                <li>
                  <strong>Monthly AMC inspections</strong>
                  <span>Mon-Sat 8-6 · 24/7 emergency call-out</span>
                </li>
                <li>
                  <strong>Survey → maintenance</strong>
                  <span>One DCD-approved scope, tested &amp; commissioned</span>
                </li>
              </ul>
              <div className="proof-cta">
                <Link to="/contact" className="btn btn-solid">Get a Free Quote</Link>
                <span>Engineer callback within 1 hour in working hours</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">How We Deliver</p>
            <h2>Survey → Design → Install → Maintain</h2>
            <p>
              One DCD-approved partner owns every step, so 35+ years of tenure
              shows up as a complete compliance path, not isolated products.
            </p>
          </div>
          <div className="milestones">
            {pathSteps.map((p) => (
              <div className="milestone" key={p.step}>
                <strong>{p.step}</strong>
                <h3>{p.title}</h3>
                <p>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">What We Do</p>
            <h2>Our Fire Safety Services</h2>
            <p>
              Survey, design, install and maintain to NFPA and UAE Fire Code.
            </p>
          </div>
          <ServicesTabs />
        </div>
      </section>

      <section className="section section-alt why">
        <div className="container">
          <div className="section-head">
            <h2>Reliable Protection, Backed by Experience</h2>
          </div>
          <ul className="why-list">
            {whyUs.map((w) => (
              <li className="why-row" key={w.title}>
                <span className="why-row-icon" aria-hidden="true">
                  <w.icon size={28} />
                </span>
                <div>
                  <h3>{w.title}</h3>
                  <p>{w.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="cta">
        <div className="container cta-inner">
          <h2>Talk to a fire-protection engineer within 1 hour</h2>
          <p>
            Send a quote request during working hours (Mon-Sat, 8:00 AM-6:00 PM),
            and a UFS engineer will call you back within 1 hour.
          </p>
          <div className="cta-actions">
            <Link to="/contact" className="btn btn-solid btn-light">
              Get a Free Quote
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
            Annual Maintenance Contract (AMC) cover includes monthly inspections, 24/7 emergency support, and full Civil Defense compliance.
          </p>
        </div>
      </section>
    </>
  )
}

export default Home