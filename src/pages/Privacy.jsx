/**
 * Privacy policy.
 *
 * The policy describes only what this site actually does, so every sentence in
 * it can be checked against the code:
 *
 *   - the enquiry fields are the ones src/pages/Contact.jsx renders;
 *   - the two CV routes are the ones src/pages/Careers.jsx offers;
 *   - there is no analytics script, no cookie and no third-party embed
 *     anywhere in src/, so the policy says the site does not track rather than
 *     describing a tracking regime that does not exist;
 *   - the hosting provider is the one that serves the built site, and the
 *     contact details come from site.contact, so the policy cannot drift from
 *     the rest of the site.
 *
 * Two things are deliberately not promised, because the business has not
 * confirmed them: a response time and a fixed retention period. The one-hour
 * response claim was withdrawn from this site earlier, so it must not come
 * back here in another form.
 */
import { Link } from 'react-router-dom'
import PageHero from '../components/PageHero'
import Reveal from '../components/Reveal'
import site from '../seo/site.js'

/** Bumped when the copy changes. A policy without a date reads as never reviewed. */
const LAST_UPDATED = '21 October 2026'

function Privacy() {
  return (
    <>
      <PageHero
        crumbs={[{ label: 'Privacy Policy' }]}
        title="Privacy Policy"
        subtitle="What we collect when you contact us or send us your CV, why we collect it, and how to ask us to correct or delete it."
      />

      <section className="section">
        <Reveal className="container legal">
          <p className="legal-meta">Last updated: {LAST_UPDATED}</p>

          <p>
            This policy explains how ALNADA Contracting handles personal
            information that reaches us through this website. It covers the
            enquiry form on the Contact page and the CVs sent to us through the
            Careers page. ALNADA Contracting is the company responsible for that
            information. We are an Egyptian contracting company, and the data
            protection law that applies to us is Egypt&apos;s Personal Data
            Protection Law No. 151 of 2020.
          </p>

          <h2>Information you give us</h2>

          <h3>Enquiries through the contact form</h3>
          <p>
            The quote form on the Contact page asks for your name, your phone
            number, your email address, your company name (optional), the
            service you are interested in, and your message. We use those
            details to answer your enquiry, to prepare a quotation, and to keep
            the record of the enquiry.
          </p>

          <h3>CVs and job applications</h3>
          <p>
            The Careers page has no application form. It gives you two ways to
            reach us, by email and by WhatsApp, and both open a message that
            you write yourself, so what reaches us is yours to choose. When you
            send a CV, we receive the name and contact details in it, together
            with the work history, qualifications and certificates you listed.
            We use that material to assess your application, to contact you
            about it, and to keep our recruitment records.
          </p>

          <h3>Technical information</h3>
          <p>
            The site is served by Vercel through a global content delivery
            network. Like any web server, the hosting provider records
            technical request data: the IP address the request came from, the
            browser and device type, the page that was requested, and the time
            of the request. That data is used to deliver the site and to keep it
            secure. We do not use it to identify visitors or to build a profile
            of them.
          </p>

          <h2>What this website does not do</h2>
          <ul>
            <li>It sets no cookies.</li>
            <li>It runs no analytics, advertising or social tracking scripts.</li>
            <li>It embeds no third-party advertising or remarketing pixels.</li>
            <li>
              It does not follow you around other websites. The typeface on
              every page is served from our own domain, so no request is made
              to a third-party font service.
            </li>
          </ul>
          <p>
            There is no cookie banner on this site because there is nothing
            here that needs one.
          </p>

          <h2>How we use your information</h2>
          <p>We use personal information for these purposes:</p>
          <ul>
            <li>
              To answer enquiries, prepare quotations, and carry out the work
              you ask us to quote for.
            </li>
            <li>
              To assess job applications, arrange interviews, and keep our
              recruitment records.
            </li>
            <li>
              To operate, secure and maintain the website, and to understand
              which pages are used so the site can be improved.
            </li>
            <li>
              To meet the legal obligations that apply to us, including record
              keeping for contracts, tax and employment.
            </li>
          </ul>
          <p>
            We do not use your information for automated decision making or
            profiling, and we do not sell, rent or trade it.
          </p>

          <h2>Why we are allowed to use it</h2>
          <p>
            <strong>Where we rely on your consent.</strong> Sending us an
            enquiry or a CV is your consent for us to use those details to
            respond to you and to keep the record of the enquiry. You can
            withdraw that consent at any time, and withdrawing it does not
            affect anything we did before you withdrew it.
          </p>
          <p>
            <strong>Where we rely on our legitimate interests.</strong> Running
            and securing the site, understanding how it is used, and keeping the
            professional records a contracting company is expected to keep. We
            weigh those interests against your rights, and you can object to
            this processing.
          </p>
          <p>
            <strong>Where the law requires it.</strong> Where retaining or
            disclosing information is required of us, we do that much and no
            more.
          </p>

          <h2>How long we keep it</h2>
          <ul>
            <li>
              <strong>Enquiries.</strong> For as long as it takes to deal with
              the enquiry and any quotation or contract that follows, and
              afterwards for as long as our professional and legal records
              require.
            </li>
            <li>
              <strong>CVs.</strong> For as long as the recruitment process
              needs them, and for candidates we do not hire for as long as we
              keep recruitment records. We then delete them.
            </li>
            <li>
              <strong>Technical request logs.</strong> For as long as the
              hosting provider needs them for security and troubleshooting. We
              keep no separate copy of them.
            </li>
          </ul>
          <p>
            If you ask us to delete your information, we will do so unless we
            are required by law to keep it.
          </p>

          <h2>Who we share it with</h2>
          <ul>
            <li>
              Our hosting provider, Vercel, which processes technical request
              data in order to deliver and secure the site.
            </li>
            <li>
              Our email provider, which carries the messages you send us and
              the messages we send back.
            </li>
            <li>
              WhatsApp, if you choose to send an enquiry or a CV that way. Your
              message is then handled under WhatsApp&apos;s own privacy policy
              as well as ours.
            </li>
            <li>
              Our professional advisers, and authorities such as Civil Defense
              or the tax authorities, where we are legally required to disclose
              information in connection with a project, a licence or a legal
              claim.
            </li>
          </ul>
          <p>
            We do not share your information with advertisers, data brokers or
            social platforms, because we have none.
          </p>

          <h2>Where your information is processed</h2>
          <p>
            Our hosting provider runs a global network, so technical request
            data may be processed on servers outside Egypt. Enquiries and CVs
            are read by our team in Egypt.
          </p>

          <h2>Your rights</h2>
          <p>Under the law that applies to us, you have the right to:</p>
          <ul>
            <li>Ask what information we hold about you, and get a copy of it.</li>
            <li>Ask us to correct information that is wrong or incomplete.</li>
            <li>Ask us to delete information we no longer have a reason to keep.</li>
            <li>Withdraw your consent, where we are relying on it.</li>
            <li>Object to processing we do on the basis of legitimate interests.</li>
            <li>
              Complain to Egypt&apos;s Data Protection Centre, the authority
              established under that law.
            </li>
          </ul>

          <h2>How to use those rights</h2>
          <p>
            Write to us at{' '}
            <a href={`mailto:${site.contact.email}`}>{site.contact.email}</a>{' '}
            or message us on WhatsApp at{' '}
            <a href={site.contact.whatsapp} target="_blank" rel="noopener noreferrer">
              {site.contact.phoneDisplay}
            </a>
            , with &quot;Privacy request&quot; in the subject line. We will ask
            you to confirm your identity before we act, so that nobody else can
            ask for your information. If you are writing on behalf of someone
            else, tell us, and we will need their authority.
          </p>

          <h2>How we protect it</h2>
          <ul>
            <li>
              Access to enquiries and CVs is limited to the people who need
              it: the engineers handling enquiries, and the people handling
              recruitment.
            </li>
            <li>
              The site is served over encrypted HTTPS, so what you send is
              protected in transit between you and our hosting provider.
            </li>
            <li>
              Nothing you send us is published on this site or shared with
              anyone outside the purposes described above.
            </li>
          </ul>
          <p>
            No system protects everything. Email and WhatsApp are ordinary
            channels, so treat a CV sent that way as you would any other
            message you send.
          </p>

          <h2>Children</h2>
          <p>
            This site is not directed at children, and we do not knowingly
            collect information from anyone under 18. If you believe a child
            has sent us information, tell us and we will delete it.
          </p>

          <h2>Changes to this policy</h2>
          <p>
            When the way we handle information changes, we update this page
            and change the date at the top. The version published here is
            always the current one.
          </p>
        </Reveal>
      </section>

      <section className="section section-alt">
        <Reveal className="container legal">
          <h2>Contact</h2>
          <p>
            Questions about this policy, or a request under it, go to the same
            people who handle enquiries:
          </p>
          <ul>
            <li>
              Email:{' '}
              <a href={`mailto:${site.contact.email}`}>{site.contact.email}</a>
            </li>
            <li>
              WhatsApp:{' '}
              <a href={site.contact.whatsapp} target="_blank" rel="noopener noreferrer">
                {site.contact.phoneDisplay}
              </a>
            </li>
            <li>
              Or send an enquiry through the <Link to="/contact">contact form</Link>.
            </li>
          </ul>
        </Reveal>
      </section>
    </>
  )
}

export default Privacy
