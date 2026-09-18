import { Link } from 'react-router-dom'
import PageHero from '../components/PageHero'

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
          <div className="section-head">
            <p className="eyebrow">404: Missing page</p>
            <h2>We could not find that page</h2>
            <p>
              Check the address, or use one of these recovery links. For an
              urgent fire-protection need, message us directly.
            </p>
          </div>
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
            <a href="https://wa.me/201095438894" target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-outline-dark">
              WhatsApp +20 109 543 8894
            </a>
          </div>
        </div>
      </section>
    </>
  )
}

export default NotFound
