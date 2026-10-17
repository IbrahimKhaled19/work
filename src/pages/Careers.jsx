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
 * in the last stage, with two routes that actually work. The previous build sent
 * candidates to /contact, which asked a candidate which service they wanted
 * and delivered nothing when they pressed send; both routes here open a real
 * message, pre-filled with the field of work they picked.
 *
 * The shape is the work. A fire protection system is built once and then looked
 * after for years, so the page runs down those stages in order, one photograph
 * each, and a candidate can see where they would join it. The line down the
 * left is the one authored motion on the page: CSS scroll-driven, so it fills
 * as the stages pass and every browser without support gets the finished static
 * page. Nothing on the page depends on script: the two CV routes are ordinary
 * anchors with a fixed message in them.
 *
 * It imports serviceIndex rather than services.js, for the reason Navbar and
 * Footer do: the 36 KB of per-service prose is not needed to count disciplines.
 */
import PageHero from '../components/PageHero'
import Reveal from '../components/Reveal'
import Picture from '../components/Picture'
import { serviceIndex as services } from '../data/serviceIndex.js'
import { openRoles } from '../data/careers.js'
import site from '../seo/site.js'

const disciplineCount = services.length

/**
 * The stages a system goes through, in the order it happens. Each one carries
 * the photograph that shows it doing that job and nothing else - no stock shot
 * standing in for work the stage does not contain.
 */
const STAGES = [
  {
    id: 'design',
    title: 'Design and calculation',
    copy: 'Hazard classification, hydraulic calculations, pump sizing and shop drawings, checked against NFPA, the Egyptian Fire Protection Code and Civil Defense before any material is ordered.',
    imageId: 'careers-pump-room',
    alt: 'Fire pump set with pressure gauges and isolation valves',
    caption: 'A pump set sized by calculation',
  },
  {
    id: 'install',
    title: 'Installation',
    copy: 'Crews install to the design with as little disruption to operations as possible, and the engineers who drew it stay involved until the work matches it.',
    imageId: 'careers-installation',
    alt: 'Smoke detector being installed into a suspended ceiling',
    caption: 'Detection commissioned on site',
  },
  {
    id: 'test',
    title: 'Testing and handover',
    copy: 'Flushing, hydrostatic, flow and churn, then acceptance testing. Documented, handed over, and tested before anybody calls it finished.',
    imageId: 'careers-valve-test',
    alt: 'Portable fire extinguisher valve being checked during service',
    caption: 'Pressure and valve checked, one unit at a time',
  },
  {
    id: 'maintain',
    title: 'Approval and maintenance',
    copy: 'Civil Defense approval, then scheduled inspection, maintenance and emergency repair. This is the stage a CV here joins: work that reaches the code, and stays accountable after handover.',
    imageId: 'careers-servicing',
    alt: 'Portable fire extinguishers during scheduled servicing',
    caption: 'Extinguishers during scheduled servicing',
  },
]

function Careers() {
  const hasRoles = openRoles.length > 0

  // Both routes are plain links with one fixed message in them, so the panel
  // needs no state and works with no script at all. Nothing is collected or
  // held anywhere; the CV never touches a server on this site.
  const whatsappHref = `${site.contact.whatsapp}?text=${encodeURIComponent(
    'CV for ALNADA Contracting. I have attached my CV.'
  )}`
  const mailHref = `mailto:${site.contact.email}?subject=${encodeURIComponent(
    'CV — ALNADA Contracting'
  )}&body=${encodeURIComponent('I have attached my CV.\n\n')}`

  return (
    <>
      <PageHero
        crumb="Careers"
        imageId="hero-careers"
        className="careers-hero"
        title="Careers at ALNADA Contracting"
        subtitle="Design, installation, commissioning and maintenance of fire protection systems across Egypt."
      />

      <section className="section careers-intro">
        <div className="container">
          <div className="careers-intro-grid">
            <Reveal>
              <p className="careers-statement">
                No published vacancies at the moment. We would rather say so
                than advertise a role that is not open — and every CV that
                arrives goes on file, because that list is where we go first
                when one does.
              </p>
            </Reveal>
            <Reveal delay={80}>
              <p className="careers-statement">
                <strong>{disciplineCount} disciplines, one employer.</strong> A
                career here follows one system from its first calculation to its
                annual inspection, instead of handing it to a stranger at the
                end of every stage.
              </p>
              {/* The one primary action, on the first screen. It goes to the
                  close of the page, where the two ways to send it live. */}
              <a className="btn btn-solid careers-jump" href="#apply">
                Send your CV
              </a>
            </Reveal>
          </div>
        </div>
      </section>

      {hasRoles ? (
        <section className="section">
          <div className="container">
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
        </section>
      ) : null}

      <section className="section careers-run-section">
        <div className="container">
          <div className="careers-run">
            {STAGES.map((stage) => (
              <article className="careers-stage" id={stage.id} key={stage.id}>
                <Reveal>
                  <h2>{stage.title}</h2>
                  <p>{stage.copy}</p>
                </Reveal>
                <Reveal delay={90}>
                  <figure>
                    <Picture id={stage.imageId} alt={stage.alt} loading="lazy" />
                    <figcaption>{stage.caption}</figcaption>
                  </figure>
                </Reveal>
              </article>
            ))}
          </div>

          {/* Where the rail arrives. A sibling of the run, not a child: the line
              has to end at this panel's top edge, and it can only do that if the
              panel is not inside the thing the line measures. */}
          <div className="careers-send" id="apply">
            <Reveal>
              <div className="careers-send-ask">
                <h2>Send us your CV.</h2>
                <p>
                  Attach it to either message below — a PDF, or a clear photo of
                  one, is fine. Every CV that arrives goes on file, and that file
                  is where we go first when a role opens.
                </p>
                <p className="careers-hours">
                  Office hours are {site.hours.display}.
                </p>
              </div>
            </Reveal>

            <Reveal delay={80}>
              <div className="careers-send-ways">
                <div className="careers-actions">
                  <a
                    className="btn btn-solid"
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Send on WhatsApp
                  </a>
                  {/* One accent on this screen, so the second route is a link.
                      The address is in the words, not behind a hover: on a phone
                      the label is the only thing that says where it goes. */}
                  <a
                    className="careers-mailto"
                    href={mailHref}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    or email {site.contact.email}
                  </a>
                </div>
                <p className="careers-send-note">
                  Useful in it: what you installed or maintained, the standards
                  you worked to, and your certifications.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  )
}

export default Careers