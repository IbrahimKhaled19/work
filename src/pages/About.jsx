import { Link } from 'react-router-dom'
import { ShieldCheck } from '@phosphor-icons/react/ShieldCheck'
import { FileText } from '@phosphor-icons/react/FileText'
import { FireExtinguisher } from '@phosphor-icons/react/FireExtinguisher'
import { Phone } from '@phosphor-icons/react/Phone'
import PageHero from '../components/PageHero'
import Reveal from '../components/Reveal'
import SectionHead from '../components/SectionHead'
import WhyList from '../components/WhyList'
import Milestones from '../components/Milestones'
import CTA from '../components/CTA'

const milestones = [
  { year: '1993', text: 'Founded: the start of our fire protection experience.' },
  { year: '2007', text: 'Established full-service operation covering design, installation and maintenance.' },
  { year: '2015', text: 'Expanded services to cover complete Annual Maintenance Contract (AMC) and suppression systems.' },
  { year: 'Today', text: 'Trusted by 500+ clients across commercial, industrial and residential sectors in Egypt.' },
]

const coverage = [
  { label: 'Design & Engineering', anchor: 'design-engineering' },
  { label: 'Fire Pump Systems', anchor: 'fire-pump-systems' },
  { label: 'Sprinkler Systems', anchor: 'sprinkler-systems' },
  { label: 'Standpipe & Hose Systems', anchor: 'standpipe-hose-systems' },
  { label: 'Fire Alarm & Detection', anchor: 'fire-alarm-detection' },
  { label: 'Portable Fire Extinguishers', anchor: 'portable-extinguishers' },
  { label: 'Special Hazard & Suppression', anchor: 'special-hazard-suppression' },
  { label: 'Passive Fire Protection', anchor: 'passive-fire-protection' },
  { label: 'Inspection, Testing & Maintenance', anchor: 'inspection-testing-maintenance' },
  { label: 'Civil Defense Compliance & Permitting', anchor: 'civil-defense-compliance' },
  { label: 'Retrofit & Upgrade', anchor: 'retrofit-upgrade' },
  { label: 'Emergency & Repair Services', anchor: 'emergency-repair-services' },
  { label: 'Training & Consulting', anchor: 'training-consulting' },
]

const values = [
  { title: 'Safety First', desc: 'Every system we touch is engineered to protect lives and property.', Icon: ShieldCheck },
  { title: 'Compliance', desc: 'All works follow NFPA, Egyptian Fire Protection Code and Civil Defense requirements.', Icon: FileText },
  { title: 'Quality Products', desc: 'We deliver trusted brands and certified, code-compliant equipment.', Icon: FireExtinguisher },
  { title: 'Dedicated Support', desc: 'Responsive service teams backed by engineers who already know your system.', Icon: Phone },
]

function About() {
  return (
    <>
      <PageHero
        crumb="About Us"
        title="About ALNANDA Contracting"
        subtitle="Over 25 years of experience designing, installing and maintaining fire protection and life safety systems to Civil Defense standards and the Egyptian Fire Protection Code."
      />

      <section className="section">
        <Reveal className="container about-layout">
          <div className="about-text">
            <p className="eyebrow">Who We Are</p>
            <h2>25+ Years of Fire Protection Experience</h2>
            <p>
              ALNANDA Contracting is a Civil Defense-approved fire
              protection company in Egypt with 25+ years of experience. We
              deliver end-to-end solutions (survey, design, supply,
              installation, testing, commissioning and maintenance, including
              AMC) to NFPA and Egyptian Fire Protection Code standards.
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
                  <Link to={`/services/${c.anchor}`}>{c.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="about-card">
            {/* TODO: company visual, 800x1000 photographic, team or facility */}
            <span className="proof-seal-badge" aria-hidden="true">
              <ShieldCheck size={44} />
            </span>
            <h3>25+ Years of Experience</h3>
            <p>
              Civil Defense approved contractor for fire fighting and life
              safety systems across Egypt.
            </p>
          </div>
        </Reveal>
      </section>

      <section className="section section-alt">
        <div className="container">
          <Milestones
            header={{
              eyebrow: 'Our Journey',
              title: 'Milestones',
              text: '25 years of Civil Defense-approved survey, design, installation and maintenance across Egypt.',
            }}
            items={milestones}
          />
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHead title="What We Stand For" />
          <WhyList items={values} />
        </div>
      </section>

      {/* No props: this used to override the CTA title, subtitle and note with
          copies of the defaults, which is how the withdrawn one-hour claim and
          the old Mon-Sat hours survived here after being fixed in the
          component. Three hardcoded copies of a shared string, none of them
          load-bearing. The defaults are now correct, so the overrides are
          gone rather than updated in step. */}
      <CTA />
    </>
  )
}

export default About