import { Link } from 'react-router-dom'

const stats = [
  { value: '35+', label: 'Years of Experience' },
  { value: '1000+', label: 'Projects Delivered', to: '/gallery', aria: 'View project gallery: 1000+ projects delivered' },
  { value: '500+', label: 'Active AMC Clients' },
  { value: '24/7', label: 'Emergency Support' },
]

const featuredServices = [
  {
    title: 'Fire Fighting Systems',
    desc: 'Sprinkler, hydrant, hose reel and fire pump systems. Designed, installed and commissioned to NFPA & UAE Fire Code.',
    anchor: 'fire-fighting-systems',
    link: 'View detail →',
  },
  {
    title: 'Fire Alarm Systems',
    desc: 'Addressable and conventional detection, call points and monitoring for complete protection.',
    anchor: 'fire-alarm-systems',
    link: 'View detail →',
  },
  {
    title: 'Annual Maintenance Contract (AMC)',
    desc: 'Monthly inspections, 24/7 support and full Civil Defense compliance.',
    anchor: 'amc',
    link: 'View detail →',
  },
]

const moreServices = [
  {
    title: 'Fire Extinguishers',
    tag: 'Refilling, hydro testing & certification',
    anchor: 'fire-extinguishers',
  },
  {
    title: 'Emergency Lighting',
    tag: 'Exit systems for power failure & evacuation',
    anchor: 'emergency-lighting',
  },
  {
    title: 'Fire Suppression',
    tag: 'FM200, Novec, CO2 & kitchen hood',
    anchor: 'fire-suppression',
  },
]

const whyUs = [
  {
    icon: 'shield',
    title: 'DCD Approved',
    desc: 'Fully licensed and approved by Dubai Civil Defense for all fire protection works.',
  },
  {
    icon: 'building',
    title: 'End-to-End Solutions',
    desc: 'From survey and design to installation, testing, commissioning and maintenance.',
  },
  {
    icon: 'extinguisher',
    title: 'All Equipment Types',
    desc: 'Single source for supply of complete fire and life safety equipment.',
  },
  {
    icon: 'bolt',
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

function WhyIcon({ name }) {
  const common = {
    width: 38,
    height: 38,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
  }
  if (name === 'shield') {
    return (
      <svg {...common}>
        <path d="M12 3l7 2.8v5.4c0 4.4-2.9 8.3-7 9.8-4.1-1.5-7-5.4-7-9.8V5.8L12 3z" />
        <path d="M9.2 11.8l2 2 3.6-3.8" />
      </svg>
    )
  }
  if (name === 'building') {
    return (
      <svg {...common}>
        <path d="M4 21h16" />
        <path d="M6 21V5.5L12 3l6 2.5V21" />
        <path d="M12 3v18" />
        <path d="M8.2 8h1.4M8.2 11.5h1.4M8.2 15h1.4M14.4 8h1.4M14.4 11.5h1.4M14.4 15h1.4" />
      </svg>
    )
  }
  if (name === 'extinguisher') {
    return (
      <svg {...common}>
        <path d="M9.5 10h5.5v9.2a2 2 0 0 1-2 2h-1.5a2 2 0 0 1-2-2V10z" />
        <path d="M10.5 10V7.5h4V10" />
        <path d="M10.5 7.5L8 5.5M14.5 7.5l2.5-2" />
        <path d="M14.5 5.5h2.8" />
        <path d="M15 10.5c2.2 0 3.5 1.8 3.5 4v1.5" />
        <path d="M11 14h3" />
      </svg>
    )
  }
  return (
    <svg {...common}>
      <path d="M13 2.5L4.5 13.5H10l-1 8 8.5-11H12l1-8z" />
    </svg>
  )
}

function Home() {
  return (
    <>
      <section className="hero">
        <div className="hero-overlay"></div>
        <div className="container hero-content">
          <p className="hero-eyebrow">Fire Safety &amp; Fire Fighting Company</p>
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
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 3l7 2.8v5.4c0 4.4-2.9 8.3-7 9.8-4.1-1.5-7-5.4-7-9.8V5.8L12 3z" />
                <path d="M9.2 11.8l2 2 3.6-3.8" />
              </svg>
              <span>DCD Approved</span>
            </li>
            <li>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M6 3h9l4 4v14H6V3z" />
                <path d="M14 3v5h5" />
                <path d="M9 13h6M9 16.5h6" />
              </svg>
              <span>NFPA &amp; UAE Fire Code</span>
            </li>
            <li>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="8.5" />
                <path d="M12 7.5V12l3 2" />
              </svg>
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
            <p className="eyebrow">DCD Approval</p>
            <h2>Compliance you can point to</h2>
            <p>
              A DCD-approved partner from survey to maintenance, delivering
              to NFPA and UAE Fire Code standards.
            </p>
          </div>
          <div className="proof-grid">
            <div className="proof-seal">
              <span className="proof-seal-badge" aria-hidden="true">
                <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3l7 2.8v5.4c0 4.4-2.9 8.3-7 9.8-4.1-1.5-7-5.4-7-9.8V5.8L12 3z" />
                  <path d="M9.2 11.8l2 2 3.6-3.8" />
                </svg>
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
          <div className="card-grid">
            {featuredServices.map((s) => (
              <Link to={`/services#${s.anchor}`} className="card" key={s.title}>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
                <span className="card-link">{s.link}</span>
              </Link>
            ))}
          </div>
          <div className="services-more">
            <p className="services-more-label">
              Also covered:
            </p>
            <ul className="services-more-list">
              {moreServices.map((s) => (
                <li key={s.title}>
                  <Link to={`/services#${s.anchor}`}>
                    <span className="services-more-title">{s.title}</span>
                    <span className="services-more-tag">{s.tag}</span>
                    <span className="services-more-arrow" aria-hidden="true">→</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="section section-alt why">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">Why Choose Us</p>
            <h2>Reliable Protection, Backed by Experience</h2>
          </div>
          <div className="card-grid">
            {whyUs.map((w) => (
              <div className="card card-center" key={w.title}>
                <span className="why-icon" aria-hidden="true">
                  <WhyIcon name={w.icon} />
                </span>
                <h3>{w.title}</h3>
                <p>{w.desc}</p>
              </div>
            ))}
          </div>
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