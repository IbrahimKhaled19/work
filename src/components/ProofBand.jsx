import { Link } from 'react-router-dom'
import { ShieldCheck } from '@phosphor-icons/react/ShieldCheck'
import Reveal from './Reveal'

function ProofBand({
  className = '',
  headerDelay = 0,
  contentDelay = 100,
}) {
  return (
    <section className={`section proof-band ${className}`} aria-label="Compliance proof">
      <div className="container">
        <Reveal className="section-head" delay={headerDelay}>
          <h2>Compliance you can point to</h2>
          <p>
            A Civil Defense-approved partner from survey to maintenance, delivering
            to NFPA and Egyptian Fire Protection Code standards.
          </p>
        </Reveal>
        <Reveal className="proof-grid" delay={contentDelay}>
          <div className="proof-seal">
            <span className="proof-seal-badge" aria-hidden="true">
              <ShieldCheck size={44} />
            </span>
            <p className="proof-seal-kicker">Civil Defense</p>
            <h3>Approved Partner</h3>
            <ul>
              <li>NFPA & Egyptian Code delivery</li>
              <li>Survey &rarr; install &rarr; Annual Maintenance Contract (AMC), one scope</li>
              <li>Monthly inspections &middot; 24/7 call-out</li>
            </ul>
              <p className="proof-seal-note">ALNANDA Contracting visual, not an official seal.</p>
          </div>
          <div className="proof-strip">
            <ul className="proof-facts" aria-label="Verifiable compliance facts">
              <li>
                <strong>NFPA & Egyptian Code</strong>
                <span>Design, install & commission to approved standards</span>
              </li>
              <li>
                <strong>Monthly AMC inspections</strong>
                <span>Mon-Sat 8-6 &middot; 24/7 emergency call-out</span>
              </li>
              <li>
                <strong>Survey &rarr; maintenance</strong>
                <span>One Civil Defense-approved scope, tested & commissioned</span>
              </li>
            </ul>
            <figure className="proof-badge-frame">
              <img
                src="/logos/gacp-egypt-logo-hd.png"
                alt="GACP Egypt certification seal"
                loading="lazy"
                width="148"
                height="165"
              />
              <figcaption>GACP Egypt Certified</figcaption>
            </figure>
            <div className="proof-cta">
              <Link to="/contact" className="btn btn-solid">Get a Free Quote</Link>
              <span>Engineer callback within 1 hour in working hours</span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

export default ProofBand