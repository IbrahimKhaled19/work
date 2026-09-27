import { ShieldCheck } from '@phosphor-icons/react/ShieldCheck'
import Reveal from './Reveal'
import Picture from './Picture'

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
              <li>Survey &rarr; install &rarr; maintain</li>
            </ul>
            <p className="proof-seal-note">ALNANDA Contracting visual, not an official seal.</p>
          </div>
          <div className="proof-strip">
            {/* Badge only. The three fact columns and the inline quote CTA were
                removed deliberately: the same claims and the same quote path are
                carried by the seal card to the left and by <CTA /> further down,
                and the extra density was competing with the section head. */}
            <figure className="proof-badge-frame">
              <Picture id="gacpSeal" loading="lazy" />
              <figcaption>GACP Egypt Certified</figcaption>
            </figure>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

export default ProofBand