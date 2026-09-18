import { Link } from 'react-router-dom'

function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div className="footer-col">
          <h3>Universal Fire Fighting</h3>
          <p>
            Dubai's trusted Civil Defense approved partner for fire fighting and
            life safety systems. Design, supply, installation, testing and
            maintenance under one roof.
          </p>
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
          <ul>
            <li>Fire Fighting Systems</li>
            <li>Fire Alarm Systems</li>
            <li>Fire Extinguishers</li>
            <li>Emergency Lighting</li>
            <li>Annual Maintenance Contract (AMC)</li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Contact Us</h4>
          <ul className="footer-contact">
            <li>P.O. Box 113112, Mussafah 32/1, Abu Dhabi, UAE</li>
            <li>
              <a href="tel:+97125512311">+971 2 5512 311</a> ·{' '}
              <a href="tel:+97125575527">+971 2 5575 527</a>
            </li>
            <li>
              <a href="mailto:info@universalfirefighting.com">
                info@universalfirefighting.com
              </a>
            </li>
            <li>Mon-Sat: 8:00 AM-6:00 PM</li>
          </ul>
        </div>
      </div>

      <div className="container footer-bottom">
        <p>© {new Date().getFullYear()} Universal Fire Fighting. All rights reserved.</p>
      </div>
    </footer>
  )
}

export default Footer