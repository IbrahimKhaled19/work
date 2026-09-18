import { Link } from 'react-router-dom'
import { ShieldCheck } from '@phosphor-icons/react/ShieldCheck'
import { FileText } from '@phosphor-icons/react/FileText'
import { FireExtinguisher } from '@phosphor-icons/react/FireExtinguisher'
import { Phone } from '@phosphor-icons/react/Phone'
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
  { title: 'Safety First', desc: 'Every system we touch is engineered to protect lives and property.', Icon: ShieldCheck },
  { title: 'Compliance', desc: 'All works follow NFPA, UAE Fire Code and Civil Defense requirements.', Icon: FileText },
  { title: 'Quality Products', desc: 'We deliver trusted brands and certified, code-compliant equipment.', Icon: FireExtinguisher },
  { title: 'Dedicated Support', desc: 'Responsive service teams backed by 24/7 emergency support.', Icon: Phone },
]

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
            {/* TODO: company visual, 800x1000 photographic, team or facility */}
            <span className="proof-seal-badge" aria-hidden="true">
              <ShieldCheck size={44} />
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
            <h2>What We Stand For</h2>
          </div>
          <ul className="why-list">
            {values.map((v) => (
              <li className="why-row" key={v.title}>
                <span className="why-row-icon" aria-hidden="true">
                  <v.Icon size={28} />
                </span>
                <div>
                  <h3>{v.title}</h3>
                  <p>{v.desc}</p>
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
              <Phone size={16} aria-hidden="true" />
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