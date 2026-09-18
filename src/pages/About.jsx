import { Link } from 'react-router-dom'
import PageHero from '../components/PageHero'

const milestones = [
  { year: '1989', text: 'Founded: the start of 35+ years of fire protection experience.' },
  { year: '2007', text: 'Established full-service UAE operation covering design, installation and maintenance.' },
  { year: '2015', text: 'Expanded services to cover complete Annual Maintenance Contract (AMC) and suppression systems.' },
  { year: 'Today', text: 'Trusted by 500+ clients across commercial, industrial and residential sectors.' },
]

const coverage = [
  { label: 'Fire Fighting Systems', anchor: 'fire-fighting-systems' },
  { label: 'Fire Alarm Systems', anchor: 'fire-alarm-systems' },
  { label: 'Fire Extinguishers', anchor: 'fire-extinguishers' },
  { label: 'Emergency & Exit Lighting', anchor: 'emergency-lighting' },
  { label: 'Fire Suppression Systems', anchor: 'fire-suppression' },
  { label: 'Annual Maintenance Contract (AMC)', anchor: 'amc' },
]

const values = [
  { title: 'Safety First', desc: 'Every system we touch is engineered to protect lives and property.', icon: 'shield' },
  { title: 'Compliance', desc: 'All works follow NFPA, UAE Fire Code and Civil Defense requirements.', icon: 'doc' },
  { title: 'Quality Products', desc: 'We deliver trusted brands and certified, code-compliant equipment.', icon: 'extinguisher' },
  { title: 'Dedicated Support', desc: 'Responsive service teams backed by 24/7 emergency support.', icon: 'phone' },
]

function ValueIcon({ name }) {
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
  if (name === 'doc') {
    return (
      <svg {...common}>
        <path d="M6 3h9l4 4v14H6V3z" />
        <path d="M14 3v5h5" />
        <path d="M9 13h6M9 16.5h6" />
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
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.13.96.36 1.9.7 2.8a2 2 0 0 1-.45 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.25a2 2 0 0 1 2.1-.45c.9.34 1.84.57 2.8.7A2 2 0 0 1 22 16.9z" />
    </svg>
  )
}

function About() {
  return (
    <>
      <PageHero
        crumb="About Us"
        title="About Universal Fire Fighting"
        subtitle="Over 35 years of experience designing, installing and maintaining fire protection and life safety systems to Dubai Civil Defense standards."
      />

      <section className="section">
        <div className="container about-layout">
          <div className="about-text">
            <p className="eyebrow">Who We Are</p>
            <h2>35+ Years of Fire Protection Experience</h2>
            <p>
              Universal Fire Fighting is a Dubai Civil Defense-approved fire
              protection company in the UAE with 35+ years of experience. We
              deliver end-to-end solutions (survey, design, supply,
              installation, testing, commissioning and maintenance, including
              AMC) to NFPA and UAE Fire Code standards.
            </p>
            <p>
              Our engineers and technicians certify and maintain complete fire
              and life safety systems under one roof, including extinguisher
              service, refilling, hydro testing, suppression systems and hiring
              services to Civil Defense requirements.
            </p>
            <ul className="check-list" aria-label="Fire protection coverage">
              {coverage.map((c) => (
                <li key={c.anchor}>
                  <Link to={`/services#${c.anchor}`}>{c.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="about-card">
            <span className="proof-seal-badge" aria-hidden="true">
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3l7 2.8v5.4c0 4.4-2.9 8.3-7 9.8-4.1-1.5-7-5.4-7-9.8V5.8L12 3z" />
                <path d="M9.2 11.8l2 2 3.6-3.8" />
              </svg>
            </span>
            <h3>35+ Years of Experience</h3>
            <p>
              Dubai Civil Defense approved contractor for fire fighting and life
              safety systems across the UAE.
            </p>
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">Our Journey</p>
            <h2>Milestones</h2>
            <p>
              From 1989 to today: 35+ years of DCD-approved survey, design,
              installation and maintenance across the UAE.
            </p>
          </div>
          <div className="milestones">
            {milestones.map((m) => (
              <div className="milestone" key={m.year}>
                <strong>{m.year}</strong>
                <p>{m.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">Our Values</p>
            <h2>What We Stand For</h2>
          </div>
          <div className="card-grid">
            {values.map((v) => (
              <div className="card card-center" key={v.title}>
                <span className="why-icon" aria-hidden="true">
                  <ValueIcon name={v.icon} />
                </span>
                <h3>{v.title}</h3>
                <p>{v.desc}</p>
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

export default About