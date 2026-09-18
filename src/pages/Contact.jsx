import { useState } from 'react'
import PageHero from '../components/PageHero'

const initialForm = {
  name: '',
  email: '',
  phone: '',
  company: '',
  service: 'Fire Fighting Systems',
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
        <div className="container contact-layout">
          <div className="contact-info">
            <p className="eyebrow">Get In Touch</p>
            <h2>We Are Ready to Help</h2>
            <ul className="contact-list">
              <li>
                <span className="contact-icon">📍</span>
                <div>
                  <strong>Address</strong>
                  <p>P.O. Box 113112, Mussafah 32/1, Abu Dhabi, UAE</p>
                </div>
              </li>
              <li>
                <span className="contact-icon">📞</span>
                <div>
                  <strong>Phone</strong>
                  <p>
                    <a href="tel:+97125512311">+971 2 5512 311</a> ·{' '}
                    <a href="tel:+97125575527">+971 2 5575 527</a>
                  </p>
                </div>
              </li>
              <li>
                <span className="contact-icon">✉️</span>
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
                <span className="contact-icon">🕗</span>
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
                <span className="card-icon">✅</span>
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
                      placeholder="+971 ..."
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
                    <option>Fire Fighting Systems</option>
                    <option>Fire Alarm Systems</option>
                    <option>Fire Extinguishers</option>
                    <option>Emergency Lighting</option>
                    <option>Fire Suppression</option>
                    <option>Annual Maintenance Contract (AMC)</option>
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
                  Submit Quote Request
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  )
}

export default Contact