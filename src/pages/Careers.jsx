/**
 * Careers.
 *
 * Claim safety drove the shape of this page. Every fact on it is either
 * countable from the data (the disciplines, read from the service taxonomy so
 * the number cannot drift) or already confirmed in PRODUCT.md. There are no
 * invented openings, no benefits, no team size, no salary and no "why you'll
 * love it here" copy - see src/data/careers.js for why the roles array is
 * empty and what adding a role looks like.
 *
 * It imports serviceIndex rather than services.js, for the same reason Navbar
 * and Footer do: the full 36 KB of per-service prose is not needed to list
 * thirteen titles, and this route should not pay for it.
 */
import { Link } from 'react-router-dom'
import { ShieldCheck } from '@phosphor-icons/react/ShieldCheck'
import { Certificate } from '@phosphor-icons/react/Certificate'
import { Ruler } from '@phosphor-icons/react/Ruler'
import { Wrench } from '@phosphor-icons/react/Wrench'
import { EnvelopeSimple } from '@phosphor-icons/react/EnvelopeSimple'
import { WhatsappLogo } from '@phosphor-icons/react/WhatsappLogo'
import PageHero from '../components/PageHero'
import Reveal from '../components/Reveal'
import SectionHead from '../components/SectionHead'
import WhyList from '../components/WhyList'
import CTA from '../components/CTA'
import { serviceIndex as services } from '../data/serviceIndex.js'
import { openRoles } from '../data/careers.js'
import site from '../seo/site.js'

// Counted from the taxonomy, not typed. A twelfth or fourteenth service changes
// this number on its own, which is the point: a hardcoded "13" would be a claim
// that could quietly stop being true.
const disciplineCount = services.length

const reasons = [
  {
    title: 'Thirteen Disciplines, One Employer',
    desc: `A single employer across ${disciplineCount} fire protection disciplines, from hydraulic design to annual inspection, so a career here spans design, installation, commissioning and maintenance.`,
    Icon: Ruler,
  },
  {
    title: 'Work That Reaches the Code',
    desc: 'Projects are delivered to NFPA and Egyptian Fire Protection Code standards and reviewed by Civil Defense, not built to a schedule and corrected later.',
    Icon: Certificate,
  },
  {
    title: 'Engineers Who Stay Accountable',
    desc: 'The engineers who design a system are the ones who commission and maintain it, so the feedback loop is short and the handover is not a hand-off to a stranger.',
    Icon: Wrench,
  },
  {
    title: 'Protect What People Occupy',
    desc: 'Every system installed is one that has to work when a building is full. That is the standard the work is held to.',
    Icon: ShieldCheck,
  },
]

const applyRoutes = [
  {
    title: 'Send Your CV',
    desc: 'The contact form reaches the engineering team directly. Include the discipline you are applying for and what you have worked on.',
    Icon: EnvelopeSimple,
    to: '/contact',
    cta: 'Open the contact form',
  },
  {
    title: 'Message on WhatsApp',
    desc: 'The same number the site uses for site queries. Useful if you would rather talk it through first.',
    Icon: WhatsappLogo,
    href: 'https://wa.me/201003620490',
    cta: 'Chat on WhatsApp',
  },
]

function Careers() {
  const hasRoles = openRoles.length > 0

  return (
    <>
      <PageHero
        crumb="Careers"
        title="Careers at ALNANDA Contracting"
        subtitle="Engineering, installation, commissioning and maintenance of fire protection systems across Egypt. Civil Defense approved, established 1993."
      />

      <section className="section">
        <div className="container">
          <SectionHead
            eyebrow="Why Here"
            title="The Work Itself"
            text="What a career here actually involves, stated plainly rather than sold."
          />
          <WhyList items={reasons} />
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <SectionHead
            eyebrow="Disciplines"
            title={`${disciplineCount} Fire Protection Disciplines`}
            text="Every one of these is a career here. Each links to what the discipline involves day to day."
          />
          <Reveal>
            <ul className="check-list" aria-label={`Careers across ${disciplineCount} fire protection disciplines`}>
              {services.map((s) => (
                <li key={s.id}>
                  <Link to={`/services/${s.id}`}>{s.title}</Link>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHead
            eyebrow="Open Roles"
            title={hasRoles ? `${openRoles.length} Current Openings` : 'No Current Openings'}
            text={
              hasRoles
                ? 'Every role below is open now. Apply through either route at the foot of this page.'
                : 'There are no published vacancies at the moment. That is a deliberate choice rather than a stale page: we would rather show nothing than advertise a role that is not open. Send a CV anyway if you are interested - we keep them on file and go straight to the list when a role does open.'
            }
          />

          {hasRoles ? (
            <div className="service-detail-block">
              <ul className="check-list check-list-cards" aria-label="Current openings">
                {openRoles.map((role) => (
                  <li key={role.id}>
                    <strong>{role.title}</strong>
                    <span>
                      {role.location} &middot; {role.type}
                    </span>
                    <p className="service-detail-text">{role.summary}</p>
                    {role.responsibilities?.length > 0 && (
                      <ul className="check-list">
                        {role.responsibilities.map((r) => (
                          <li key={r}>{r}</li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <Reveal className="about-card">
              <span className="proof-seal-badge" aria-hidden="true">
                <Ruler size={44} />
              </span>
              <h3>Send a Speculative CV</h3>
              <p>
                We hire against specific roles when they open, and we go to the
                applicants we already have on file first. A CV that shows
                hydraulic design, pump and sprinkler installation, or inspection
                and commissioning work is worth more to us than a cover letter.
              </p>
            </Reveal>
          )}
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <SectionHead
            eyebrow="Apply"
            title="How to Reach Us"
            text={`Both routes go to the same engineering team. Office hours are ${site.hours.display}.`}
          />
          <Reveal>
            <ul className="check-list check-list-cards" aria-label="Ways to apply">
              {applyRoutes.map((route) => {
                const inner = (
                  <>
                    <strong>{route.title}</strong>
                    <span>{route.desc}</span>
                    <em>{route.cta}</em>
                  </>
                )
                return (
                  <li key={route.title}>
                    {route.to ? <Link to={route.to}>{inner}</Link> : <a href={route.href}>{inner}</a>}
                  </li>
                )
              })}
            </ul>
          </Reveal>
        </div>
      </section>

      <CTA />
    </>
  )
}

export default Careers
