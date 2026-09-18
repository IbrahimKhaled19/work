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
              urgent fire-protection need, call us directly.
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
            <a href="tel:+97125512311" className="btn btn-outline btn-outline-dark">
              Call +971 2 5512 311
            </a>
          </div>
        </div>
      </section>
    </>
  )
}

export default NotFound
