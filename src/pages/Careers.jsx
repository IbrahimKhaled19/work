/**
 * Careers.
 *
 * Claim safety still decides what may be printed. Every number here is
 * countable from the data - the discipline count is read from the service
 * taxonomy, so a twelfth or fourteenth service moves it on its own rather than
 * quietly making a sentence false - and the sentences about the work are the
 * ones PRODUCT.md already supports. There are no invented openings, no
 * benefits, no salary and no team size. src/data/careers.js explains why
 * openRoles is empty and what adding a role looks like.
 *
 * The page has one job: get a CV to the engineering team. So it says that once,
 * at the end, with two routes that actually work. The previous build sent
 * candidates to /contact, which asked a candidate which service they wanted
 * and delivered nothing when they pressed send; both routes here open a real
 * message, pre-filled with the field of work they picked.
 *
 * It imports serviceIndex rather than services.js, for the reason Navbar and
 * Footer do: the 36 KB of per-service prose is not needed to count disciplines
 * or to name the four fields of work.
 */
import { useState } from 'react'
import PageHero from '../components/PageHero'
import Reveal from '../components/Reveal'
import Picture from '../components/Picture'
import { serviceIndex as services, disciplines } from '../data/serviceIndex.js'
import { openRoles } from '../data/careers.js'
import site from '../seo/site.js'

const disciplineCount = services.length

/** The photographs sit inside the text column, at its width, doing one job each. */
const SHOTS = [
  {
    id: 'careers-servicing',
    alt: 'Portable fire extinguishers during scheduled servicing',
    caption: 'Extinguishers during scheduled servicing',
  },
  {
    id: 'careers-installation',
    alt: 'Smoke detector being installed into a suspended ceiling',
    caption: 'Detection commissioned on site',
  },
  {
    id: 'careers-pump-room',
    alt: 'Fire pump set with pressure gauges and isolation valves',
    caption: 'A pump set sized by calculation',
  },
]

function Careers() {
  const hasRoles = openRoles.length > 0
  const [fields, setFields] = useState([])

  const chosen = fields.length
    ? disciplines
        .filter((d) => fields.includes(d.id))
        .map((d) => d.label)
        .join(', ')
    : 'fire protection'

  const toggle = (id) =>
    setFields((current) =>
      current.includes(id) ? current.filter((f) => f !== id) : [...current, id]
    )

  // Both are plain links, so they work with no script and with the visitor's
  // mail client or WhatsApp. Nothing is collected or held anywhere.
  const whatsappHref = `${site.contact.whatsapp}?text=${encodeURIComponent(
    `CV for ALNADA Contracting — ${chosen}. I have attached my CV.`
  )}`
  const mailHref = `mailto:${site.contact.email}?subject=${encodeURIComponent(
    'CV — ALNADA Contracting'
  )}&body=${encodeURIComponent(`Discipline: ${chosen}\n\n`)}`

  return (
    <>
      <PageHero
        crumb="Careers"
        imageId="hero-careers"
        title="Careers at ALNADA Contracting"
        subtitle="Design, installation, commissioning and maintenance of fire protection systems across Egypt."
      />

      <section className="section">
        <div className="container">
          <div className="careers-column">
            <Reveal>
              <p className="careers-lead">
                No published vacancies at the moment. We would rather say so
                than advertise a role that is not open.
              </p>
              {/* The one primary action, on the first screen. It goes to the
                  close of the page, where the two ways to send it live. */}
              <a className="btn btn-solid careers-jump" href="#apply">
                Send your CV
              </a>
            </Reveal>

            <div className="careers-entries">
              <Reveal delay={60}>
                <p>
                  <strong>{disciplineCount} disciplines, one employer.</strong>{' '}
                  A career here spans hydraulic design, installation,
                  commissioning and maintenance of the same systems, from the
                  first calculation to the annual inspection.
                </p>
              </Reveal>
              <Reveal delay={120}>
                <p>
                  <strong>Work that reaches the code.</strong> Projects are
                  delivered to NFPA and Egyptian Fire Protection Code standards
                  and reviewed by Civil Defense, not built to a schedule and
                  corrected later.
                </p>
              </Reveal>
              <Reveal delay={180}>
                <p>
                  <strong>Engineers who stay accountable.</strong> The
                  engineers who design a system are the ones who commission and
                  maintain it, so a handover is not a hand-off to a stranger.
                </p>
              </Reveal>
              <Reveal delay={240}>
                <p>
                  <strong>Work that has to hold.</strong> Every system installed
                  is one that must perform when a building is full.
                </p>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <div className="careers-column">
            <div className="careers-shots">
              {SHOTS.map((shot, i) => (
                <Reveal key={shot.id} delay={i * 90}>
                  <figure>
                    <Picture id={shot.id} alt={shot.alt} loading="lazy" />
                    <figcaption>{shot.caption}</figcaption>
                  </figure>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {hasRoles ? (
        <section className="section">
          <div className="container">
            <div className="careers-column">
              <h2>{openRoles.length} Current Openings</h2>
              <ul className="careers-roles">
                {openRoles.map((role) => (
                  <li key={role.id}>
                    <strong>{role.title}</strong>
                    <span>
                      {role.location} &middot; {role.type}
                    </span>
                    <p>{role.summary}</p>
                    {role.responsibilities?.length > 0 && (
                      <ul>
                        {role.responsibilities.map((r) => (
                          <li key={r}>{r}</li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      ) : null}

      <section className="section" id="apply">
        <div className="container">
          <div className="careers-band">
            <div className="careers-band-ask">
              <h2 className="careers-band-lead">Send us your CV.</h2>
              <p className="careers-band-note">
                Attach it to either message below. What matters is the work:
                hydraulic design, pump and sprinkler installation, or inspection
                and commissioning. Every CV that arrives goes on file, and that
                list is where we go first when a role opens.
              </p>
            </div>

            <Reveal delay={90} className="careers-band-shot">
              <Picture
                id="careers-cylinders"
                alt="Suppression agent cylinders with pressure gauges and release lines"
                loading="lazy"
              />
            </Reveal>

            <div className="careers-band-send">
              <fieldset className="careers-fields">
                <legend>What have you worked in?</legend>
                {disciplines.map((d) => (
                  <label key={d.id}>
                    <input
                      type="checkbox"
                      checked={fields.includes(d.id)}
                      onChange={() => toggle(d.id)}
                    />
                    <span>{d.label}</span>
                  </label>
                ))}
              </fieldset>
              <div className="careers-actions">
                <a
                  className="btn btn-solid"
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Send on WhatsApp
                </a>
                {/* One accent on this screen, so the second route is a link. */}
                <a className="careers-mailto" href={mailHref}>
                  or send it by email
                </a>
              </div>
              <p className="careers-hours">Office hours are {site.hours.display}.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default Careers