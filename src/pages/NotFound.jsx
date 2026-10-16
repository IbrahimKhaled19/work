import { Link } from 'react-router-dom'
import PageHero from '../components/PageHero'
import SectionHead from '../components/SectionHead'
import site from '../seo/site.js'

function NotFound() {
  return (
    <>
      <PageHero
        crumb="Not found"
        title="Page not found"
        subtitle="The page you asked for does not exist or was moved. Choose a path below to keep going."
      />

      <section className="section">
        <div className="container notfound-wrap">
          <SectionHead
            eyebrow="404: Missing page"
            title="We could not find that page"
            text="Check the address, or use one of these recovery links. For an urgent fire-protection need, message us directly."
          />
          <div className="notfound-actions">
            <Link to="/" className="btn btn-solid">
              Back to Home
            </Link>
            <Link to="/services" className="btn btn-solid btn-ghost-dark">
              View Services
            </Link>
            <Link to="/contact" className="btn btn-solid btn-ghost-dark">
              Request a Quote
            </Link>
            <a href={site.contact.whatsapp} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-outline-dark">
              WhatsApp {site.contact.phoneDisplay}
            </a>
          </div>
        </div>
      </section>
    </>
  )
}

export default NotFound
