import { Link } from 'react-router-dom'
import { FacebookLogo } from '@phosphor-icons/react/FacebookLogo'
import { InstagramLogo } from '@phosphor-icons/react/InstagramLogo'
import { LinkedinLogo } from '@phosphor-icons/react/LinkedinLogo'
// The slim index, not the full catalogue - the footer links only, so the 36 KB
// of prose in services.js has no business in the critical path. See
// src/data/serviceIndex.js.
import { serviceIndex as serviceSections } from '../data/serviceIndex'
import site from '../seo/site.js'

function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div className="footer-col">
          <h3>ALNANDA Contracting</h3>
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

        <div className="footer-col">
          <h4>Quick Links</h4>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/services">Services</Link></li>
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/gallery">Gallery</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Our Services</h4>
          <ul className="footer-services">
            {serviceSections.map((s) => (
              <li key={s.id}>
                <Link to={`/services/${s.id}`}>{s.title}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="footer-col">
          <h4>Contact Us</h4>
          <ul className="footer-contact">
            <li>Serving industrial and commercial facilities across Egypt</li>
            <li>
              <a href="https://wa.me/201003620490" target="_blank" rel="noopener noreferrer">
                WhatsApp: +20 100 362 0490
              </a>
            </li>
            <li>
              <a href="mailto:info@universalfirefighting.com">
                info@universalfirefighting.com
              </a>
            </li>
            <li>{site.hours.display}</li>
          </ul>
        </div>
      </div>

      <div className="container footer-bottom">
        <p>© {new Date().getFullYear()} ALNANDA Contracting. All rights reserved.</p>
      </div>
    </footer>
  )
}

export default Footer