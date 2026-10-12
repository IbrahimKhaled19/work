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
import Picture from '../components/Picture'
import CTA from '../components/CTA'

const milestones = [
  { year: '1993', text: 'Founded as a general contracting company, delivering large projects including water desalination plants, schools and post offices.' },
  { year: '2016', text: 'Added fire protection to the company\u2019s work, while continuing as a general contracting company. It has offered fire protection for the past 10 years.' },
  { year: 'Today', text: '100+ fire protection projects completed across Egypt, with 13 services delivered under one roof.' },
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

const principles = [
  { title: 'Design from calculations', desc: 'Pump size, pipe size, sprinkler spacing and water supply are all determined by hydraulic calculations and the hazard classification of each area.', Icon: ShieldCheck },
  { title: 'Test before handover', desc: 'Every system is flushed, pressure-tested and flow-tested, and the results are documented.', Icon: FileText },
  { title: 'Support after installation', desc: 'Equipment ages, buildings expand and codes change. We provide inspection, maintenance, upgrades and emergency repair for the systems we install.', Icon: Phone },
]

const commitments = [
  'We size fire pumps by calculation, not estimate.',
  'We do not hand over a system that has not been tested.',
  'If your existing equipment can be corrected and brought up to code, we will tell you, rather than recommend replacing it.',
  'We provide documents you can present to an insurer or a Civil Defense inspector.',
  'We remain available after handover for maintenance and emergencies.',
]

const projectSteps = [
  { step: '01', title: 'Site Survey', desc: 'We visit your facility and review what you store, what processes you run, the layout and the water supply available.' },
  { step: '02', title: 'Design & Calculation', desc: 'We assign hazard classifications, complete the hydraulic calculations, size the pumps and prepare shop drawings. The design is checked against NFPA standards, the Egyptian Fire Protection Code and Civil Defense requirements before any material is ordered.' },
  { step: '03', title: 'Installation', desc: 'Our crews install the system with as little disruption to your operations as possible. Our engineers stay involved to make sure the installation matches the design.' },
  { step: '04', title: 'Testing & Handover', desc: 'We carry out flushing, hydrostatic testing, flow and churn testing, and acceptance testing, then hand over the full documentation.' },
  { step: '05', title: 'Approval & Maintenance', desc: 'We manage Civil Defense approval, then provide scheduled inspection, maintenance and emergency repair.' },
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
        title="About ALNADA Contracting"
        subtitle="ALNADA Contracting designs, installs and maintains fire protection systems for factories, warehouses and commercial buildings across Egypt."
      />

      <section className="section">
        <Reveal className="container about-layout">
          <div className="about-text">
            <p className="eyebrow">Who We Are</p>
            <h2>Fire Protection Contractor in Egypt</h2>
            <p>
              ALNADA Contracting is an Egyptian contracting company that works in
              general construction and fire protection. On this site we focus on
              our fire protection services. We work with business owners,
              facility managers and project consultants who need a system that
              meets code, passes Civil Defense inspection and works when it is
              needed.
            </p>
            <p>
              The company was established in 1993 and has offered fire
              protection for the past 10 years. In that time we have completed
              more than 100 fire protection projects. We cover every part of a
              fire protection system ourselves, so you work with one company
              from the first site visit to the last inspection.
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
            <h3>10+ Years in Fire Protection</h3>
            <p>
              Civil Defense approved contractor for fire fighting and life
              safety systems across Egypt.
            </p>
          </div>
        </Reveal>
      </section>

      <section className="section section-alt">
        <div className="container">
          <SectionHead
            eyebrow="Why It Matters"
            title="Why Engineering and Testing Matter"
            text="A fire protection system can be installed and approved on paper and still not perform properly. A pump may never have been tested at its rated flow. A sprinkler network may have been designed without correct hydraulic calculations. A valve may have been left closed after maintenance."
          />
          <Reveal className="why-list">
            <p>
              For this reason, we base every design on calculations and test
              every system before handover. We still handle all approvals and
              documentation, but we treat them as the record of a system that
              works.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHead
            eyebrow="How We Work"
            title="Our Principles"
          />
          <WhyList items={principles} />
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <SectionHead
            eyebrow="What We Promise"
            title="Our Commitments"
            text="Five commitments that shape every project we deliver."
          />
          <Reveal className="check-list">
            {commitments.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <Milestones
            header={{
              eyebrow: 'How a Project Runs',
              title: 'From Survey to Maintenance',
              text: 'Five steps, one accountable team, no handoffs between vendors.',
            }}
            items={projectSteps}
          />
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <SectionHead
            eyebrow="One Company"
            title="One Company for the Whole System"
            text="Many facilities have to deal with separate contractors for pumps, sprinklers, alarms and permits, and problems often appear in the gaps between them. We provide all thirteen services ourselves, so each part of the system is designed to work with the others from the start."
          />
          <Reveal className="check-list">
            {coverage.map((c) => (
              <li key={c.anchor}>
                <Link to={`/services/${c.anchor}`}>{c.label}</Link>
              </li>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="section">
        <div className="container about-layout">
          <div className="about-text">
            <p className="eyebrow">Our Experience</p>
            <h2>Built on Contracting, Focused on Fire Protection</h2>
            <p>
              Over the past 10 years of fire protection work, and in contracting
              before that, we have worked in factories, warehouses and
              commercial buildings across Egypt. That work has given us
              practical knowledge of how pump rooms are built on real sites,
              what Civil Defense inspectors check, and where older installations
              tend to fail.
            </p>
            <p>
              ALNADA Contracting was established in 1993 as a general
              contracting company, delivering large projects such as water
              desalination plants, schools and post offices. The company later
              added fire protection to its work, while continuing as a
              contracting company.
            </p>
          </div>
          <div className="about-card">
            <Picture
              id="founder"
              alt="Abdalatty Mohamed Abdalatty, founder of ALNADA Contracting"
              className="founder-photo"
            />
            <h3>Our Founder</h3>
            <p className="about-founder-name">Abdalatty Mohamed Abdalatty</p>
            <p>
              Founded ALNADA Contracting in 1993. In its early years the
              company took on large contracting projects, built to detailed
              specifications, run on demanding schedules, and required to pass
              formal inspection. Those requirements shaped how the company
              works today.
            </p>
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <SectionHead
            eyebrow="Credentials"
            title="Certified and Approved"
            text="ALNADA Contracting is certified by Egypt's General Administration for Civil Protection (GACP). Our work is designed and tested to NFPA 13, 14, 20 and 25, together with the Egyptian Fire Protection Code and Civil Defense requirements."
          />
        </div>
      </section>

      <section className="section">
        <div className="container">
          <Milestones
            header={{
              eyebrow: 'Our Journey',
              title: 'Milestones',
              text: 'From general contracting to full-service fire protection.',
            }}
            items={milestones}
          />
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <SectionHead title="What We Stand For" />
          <WhyList items={values} />
        </div>
      </section>

      <CTA />
    </>
  )
}

export default About
