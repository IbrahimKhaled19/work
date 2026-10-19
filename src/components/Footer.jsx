import { Link } from 'react-router-dom'
import { FacebookLogo } from '@phosphor-icons/react/FacebookLogo'
import { InstagramLogo } from '@phosphor-icons/react/InstagramLogo'
import { LinkedinLogo } from '@phosphor-icons/react/LinkedinLogo'
// The slim index, not the full catalogue - the footer links only, so the 36 KB
// of prose in services.js has no business in the critical path. See
// src/data/serviceIndex.js.
import { serviceIndex as serviceSections } from '../data/serviceIndex'
import { navLinks } from '../seo/routeMeta'
import site from '../seo/site.js'

function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <h3>ALNADA Contracting</h3>
          <p>
            Egypt's trusted Civil Defense approved partner for fire fighting and
            life safety systems. Design, supply, installation, testing and
            maintenance under one roof.
          </p>
          <ul className="footer-social" aria-label="Social media">
            <li>
              <a href="#" aria-label="Facebook">
                <FacebookLogo size={18} aria-hidden="true" />
              </a>
            </li>
            <li>
              <a href="#" aria-label="Instagram">
                <InstagramLogo size={18} aria-hidden="true" />
              </a>
            </li>
            <li>
              <a href="#" aria-label="LinkedIn">
                <LinkedinLogo size={18} aria-hidden="true" />
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h4>Quick Links</h4>
          <ul>
            {navLinks.map((l) => (
              <li key={l.to}>
                <Link to={l.to}>{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4>Our Services</h4>
          <ul className="footer-services">
            {serviceSections.map((s) => (
              <li key={s.id}>
                <Link to={`/services/${s.id}`}>{s.title}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4>Contact Us</h4>
          <ul className="footer-contact">
            <li>Serving industrial and commercial facilities across Egypt</li>
            <li>
              <a href={site.contact.whatsapp} target="_blank" rel="noopener noreferrer">
                WhatsApp: {site.contact.phoneDisplay}
              </a>
            </li>
            <li>
              <a href={`mailto:${site.contact.email}`}>
                {site.contact.email}
              </a>
            </li>
            <li>{site.hours.display}</li>
          </ul>
        </div>
      </div>

      <div className="container footer-bottom">
        <p>© {new Date().getFullYear()} ALNADA Contracting. All rights reserved.</p>
      </div>
    </footer>
  )
}

export default Footer