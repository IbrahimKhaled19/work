import { Link } from 'react-router-dom'
import { ShieldCheck } from '@phosphor-icons/react/ShieldCheck'
import { FileText } from '@phosphor-icons/react/FileText'
import { Clock } from '@phosphor-icons/react/Clock'
import { FireExtinguisher } from '@phosphor-icons/react/FireExtinguisher'
import { Buildings } from '@phosphor-icons/react/Buildings'
import { Lightning } from '@phosphor-icons/react/Lightning'
import SectionHead from '../components/SectionHead'
import Picture from '../components/Picture'
import WaveSeparator from '../components/WaveSeparator'
import LogoCarousel from '../components/LogoCarousel'
import StatGrid from '../components/StatGrid'
import ProofBand from '../components/ProofBand'
import Milestones from '../components/Milestones'
import ServicesTabs from '../components/ServicesTabs'
import WhyList from '../components/WhyList'
import CTA from '../components/CTA'

const stats = [
  { target: 25, suffix: '+', label: 'Years of Experience', duration: 1100 },
  { target: 100, suffix: '+', label: 'Projects Delivered', to: '/gallery', aria: 'View project gallery: 100+ projects delivered', duration: 1400 },
  { target: 500, suffix: '+', label: 'Active AMC Clients', duration: 1200 },
  { value: '24/7', label: 'Emergency Support' },
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
    desc: 'System design to NFPA and Egyptian Fire Protection Code for approval-first delivery.',
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

const whyUs = [
  {
    Icon: ShieldCheck,
    title: 'Civil Defense Approved',
    desc: 'Fully licensed and approved by Civil Defense for all fire protection works.',
  },
  {
    Icon: Buildings,
    title: 'End-to-End Solutions',
    desc: 'From survey and design to installation, testing, commissioning and maintenance.',
  },
  {
    Icon: FireExtinguisher,
    title: 'All Equipment Types',
    desc: 'One supplier for your complete fire and life safety equipment.',
  },
  {
    Icon: Lightning,
    title: 'Fast Response',
    desc: 'Get an inspection, quote or emergency call-out. Our engineers respond fast.',
  },
]

function Home() {
  return (
    <>
      <section className="hero">
        <div className="hero-bg" aria-hidden="true">
          <Picture
            id="hero"
            alt=""
            loading="eager"
            fetchPriority="high"
          />
        </div>
        <div className="hero-overlay"></div>
        <WaveSeparator />
        <div className="container hero-content">
          <h1>
            Complete fire protection,
            <br />
            <span>engineered to code, not just to spec.</span>
          </h1>
          <p className="hero-lead">
            From hydraulic calculations to the Civil Defense signature, one
            accountable team handles every layer: pumps, sprinklers, detection,
            suppression.
          </p>
          <div className="hero-actions">
            <Link to="/contact" className="btn btn-solid">Request a Site Assessment</Link>
            <Link to="/services" className="btn btn-outline">Explore Services</Link>
          </div>
          <ul className="hero-proof" aria-label="Compliance and availability">
            <li>
              <ShieldCheck size={16} aria-hidden="true" />
              <span>Civil Defense Approved</span>
            </li>
            <li>
              <FileText size={16} aria-hidden="true" />
              <span>NFPA & Egyptian Code</span>
            </li>
            <li>
              <Clock size={16} aria-hidden="true" />
              <a href="https://wa.me/201003620490" target="_blank" rel="noopener noreferrer">Mon-Sat 8-6 &middot; WhatsApp: +20 100 362 0490</a>
            </li>
          </ul>
        </div>
      </section>

      <LogoCarousel />

      <StatGrid stats={stats} />

      <ProofBand />

      {/* cv-skip: below the fold, so the browser can skip laying out and
          painting it until it approaches the viewport. Never applied to the
          hero or the stat grid - the hero holds the LCP element. */}
      <section className="section section-alt cv-skip cv-tall">
        <div className="container">
          <Milestones
            headerClassName="section-head-wide"
            header={{
              eyebrow: 'How We Deliver',
              title: 'Survey \u2192 Design \u2192 Install \u2192 Maintain',
              text: 'One Civil Defense-approved partner owns every step, so 25+ years of tenure shows up as a complete compliance path, not isolated products.',
            }}
            items={pathSteps}
          />
        </div>
      </section>

      <section className="section cv-skip cv-tall">
        <div className="container">
          <SectionHead
            eyebrow="What We Do"
            title="Our Fire Protection Services"
            text="One contractor, every fire protection discipline your facility requires."
          />
          <ServicesTabs />
        </div>
      </section>

      <section className="section section-alt why cv-skip">
        <div className="container">
          <SectionHead title="Reliable Protection, Backed by Experience" />
          <WhyList items={whyUs} />
        </div>
      </section>

      <CTA />
    </>
  )
}

export default Home