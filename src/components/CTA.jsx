import { Link } from 'react-router-dom'
import { WhatsappLogo } from '@phosphor-icons/react/WhatsappLogo'
import Reveal from './Reveal'

function CTA({
  title = 'Talk to a fire-protection engineer within 1 hour',
  subtitle = 'Send a quote request during working hours (Mon-Sat, 8:00 AM-6:00 PM), and an ALNANDA Contracting engineer will call you back within 1 hour.',
  quoteText = 'Get a Free Quote',
  quoteHref = '/contact',
  whatsappText = 'Chat on WhatsApp',
  whatsappHref = 'https://wa.me/201003620490',
  note = 'Annual Maintenance Contract (AMC) cover includes monthly inspections, 24/7 emergency support, and full Civil Defense compliance.',
  className = '',
  variant = 'light',
  delay = 0,
}) {
  const isLight = variant === 'light'

  return (
    <section className="cta">
      <Reveal className={`container cta-inner ${className}`} delay={delay}>
        <h2>{title}</h2>
        <p>{subtitle}</p>
        <div className="cta-actions">
          <Link to={quoteHref} className={`btn btn-solid ${isLight ? 'btn-light' : ''}`}>
            {quoteText}
          </Link>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline cta-emergency"
            aria-label={`Chat on WhatsApp: +20 100 362 0490`}
          >
            <WhatsappLogo size={16} aria-hidden="true" />
            {whatsappText}
          </a>
        </div>
        {note && <p className="cta-note">{note}</p>}
      </Reveal>
    </section>
  )
}

export default CTA