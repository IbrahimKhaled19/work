import { useState } from 'react'
import { MapPin } from '@phosphor-icons/react/MapPin'
import { WhatsappLogo } from '@phosphor-icons/react/WhatsappLogo'
import { Envelope } from '@phosphor-icons/react/Envelope'
import { Clock } from '@phosphor-icons/react/Clock'
import { CheckCircle } from '@phosphor-icons/react/CheckCircle'
import PageHero from '../components/PageHero'
import Reveal from '../components/Reveal'

const initialForm = {
  name: '',
  email: '',
  phone: '',
  company: '',
  service: 'Fire Pump Systems',
  message: '',
}

function Contact() {
  const [form, setForm] = useState(initialForm)
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <>
      <PageHero
        crumb="Contact"
        title="Contact Us"
        subtitle="Need an inspection, installation or Annual Maintenance Contract (AMC) quote? Fill out the form and our engineers will contact you within 1 hour."
      />

      <section className="section">
        <Reveal className="container contact-layout">
          <div className="contact-info">
            <p className="eyebrow">Get In Touch</p>
            <h2>Contact our engineers</h2>
            <ul className="contact-list">
              <li>
                <span className="contact-icon" aria-hidden="true"><MapPin size={24} /></span>
                <div>
                  <strong>Service Area</strong>
                  <p>Industrial and commercial facilities across Egypt</p>
                </div>
              </li>
              <li>
                <span className="contact-icon" aria-hidden="true"><WhatsappLogo size={24} /></span>
                <div>
                  <strong>WhatsApp</strong>
                  <p>
                    <a href="https://wa.me/201003620490" target="_blank" rel="noopener noreferrer">
                      +20 100 362 0490
                    </a>
                  </p>
                </div>
              </li>
              <li>
                <span className="contact-icon" aria-hidden="true"><Envelope size={24} /></span>
                <div>
                  <strong>Email</strong>
                  <p>
                    <a href="mailto:info@universalfirefighting.com">
                      info@universalfirefighting.com
                    </a>
                  </p>
                </div>
              </li>
              <li>
                <span className="contact-icon" aria-hidden="true"><Clock size={24} /></span>
                <div>
                  <strong>Working Hours</strong>
                  <p>Mon-Sat: 8:00 AM-6:00 PM · 24/7 Emergency</p>
                </div>
              </li>
            </ul>
          </div>

          <div className="contact-form-wrap">
            {submitted ? (
              <div className="form-success">
                <span className="form-success-icon" aria-hidden="true"><CheckCircle size={40} /></span>
                <h3>Thank You!</h3>
                <p>
                  Your quote request has been received. Our engineers will
                  contact you within 1 hour during working hours.
                </p>
                <button
                  type="button"
                  className="btn btn-solid"
                  onClick={() => {
                    setForm(initialForm)
                    setSubmitted(false)
                  }}
                >
                  Send Another Request
                </button>
              </div>
            ) : (
              <form className="quote-form" onSubmit={handleSubmit}>
                <h3>Request a Free Quote</h3>
                <div className="form-row">
                  <label>
                    <span>Full Name *</span>
                    <input
                      type="text"
                      name="name"
                      required
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Your name"
                    />
                  </label>
                  <label>
                    <span>Phone *</span>
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="+20 ..."
                    />
                  </label>
                </div>
                <div className="form-row">
                  <label>
                    <span>Email *</span>
                    <input
                      type="email"
                      name="email"
                      required
                      value={form.email}
                      onChange={handleChange}
                      placeholder="you@company.com"
                    />
                  </label>
                  <label>
                    <span>Company</span>
                    <input
                      type="text"
                      name="company"
                      value={form.company}
                      onChange={handleChange}
                      placeholder="Company name (optional)"
                    />
                  </label>
                </div>
                <label>
                  <span>Service Required *</span>
                  <select name="service" value={form.service} onChange={handleChange}>
                    <option>Design &amp; Engineering</option>
                    <option>Fire Pump Systems</option>
                    <option>Sprinkler Systems</option>
                    <option>Standpipe &amp; Hose Systems</option>
                    <option>Fire Alarm &amp; Detection</option>
                    <option>Portable Fire Extinguishers</option>
                    <option>Special Hazard &amp; Suppression</option>
                    <option>Passive Fire Protection</option>
                    <option>Inspection, Testing &amp; Maintenance</option>
                    <option>Civil Defense Compliance &amp; Permitting</option>
                    <option>Retrofit &amp; Upgrade</option>
                    <option>Emergency &amp; Repair Services</option>
                    <option>Training &amp; Consulting</option>
                    <option>Other / Inspection</option>
                  </select>
                </label>
                <label>
                  <span>Message</span>
                  <textarea
                    name="message"
                    rows="5"
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Tell us about your project or requirement..."
                  ></textarea>
                </label>
                <button type="submit" className="btn btn-solid btn-block">
                  Get a Free Quote
                </button>
              </form>
            )}
          </div>
        </Reveal>
      </section>
    </>
  )
}

export default Contact