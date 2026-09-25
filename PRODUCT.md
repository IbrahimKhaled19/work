# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary: facility owners and managers in Egypt (industrial, commercial) responsible for Civil Defense compliance, avoiding penalties, and keeping life-safety systems operational. Job: get a site assessment, inspection, installation, or maintenance quote fast and confirm the vendor can design, install, certify, and maintain the system.

Other audiences (present in navigation but secondary): contractors/developers needing certified installation work; small businesses and facility teams needing extinguishers, training, and certification.

## Product Purpose

Marketing and lead-generation website for ALNANDA Contracting. It explains fire-protection services, establishes authority through engineering depth and Civil Defense compliance, and drives assessment/contact requests with a 1-hour engineer callback promise during working hours. Success means qualified quote requests via the Contact page.

## Positioning

Authority-led engineering: complete fire protection engineered to code (NFPA + Egyptian Fire Protection Code), from hydraulic calculations to the final Civil Defense signature, under one accountable team. A neighboring firm could claim installation or maintenance alone, but not the combined engineering depth + Civil Defense liaison + full-scope in-house delivery.

## Homepage Voice

Authority-Led variant (user-selected): headline "Complete fire protection, engineered to code, not just to spec." Subhead: "From hydraulic calculations to the Civil Defense signature, one accountable team handles every layer: pumps, sprinklers, detection, suppression." Primary CTA: "Request a Site Assessment."

## Operating Context

Egyptian regulatory environment: Civil Defense approval, licensing and permitting; Egyptian Fire Protection Code alongside NFPA. Core workflow: design & engineering → install → test → commission → maintain, plus scheduled inspection/testing and 24/7 emergency response. Business hours Mon–Sat 8:00 AM–6:00 PM with 24/7 emergency coverage. Quote flow: visitor submits Contact form → engineer contacts them within 1 hour during working hours. Site routes: `/` Home, `/services`, `/services/:serviceId` (one dedicated page per service line), `/about`, `/gallery`, `/contact` (React Router in `src/App.jsx`).

## Capabilities and Constraints

Confirmed functionality: thirteen service lines — Design & Engineering; Fire Pump Systems; Sprinkler Systems; Standpipe & Hose Systems; Fire Alarm & Detection; Portable Fire Extinguishers; Special Hazard & Suppression; Passive Fire Protection; Inspection, Testing & Maintenance; Civil Defense Compliance & Permitting; Retrofit & Upgrade; Emergency & Repair Services; Training & Consulting. Quote form fields: name, phone, email, company (optional), service, message. Existing stack answers implementation: React 19 + Vite + react-router-dom (`package.json`, `vite.config.js`); entry `src/main.jsx`; no backend.

Standards status: NFPA 13/14/20/25 citations are carried as user-supplied reference only. References beyond those (NFPA 72, 10, 2001, 96, 11, 80, UL-listed assemblies) are explicitly UNVERIFIED against what the team follows — confirm each before relying on them for client-facing commitments.

Explicitly undecided / missing: no backend or delivery path for quote submissions (`src/pages/Contact.jsx` keeps state locally and shows a success message only); no confirmed CRM, email routing, or SLA beyond the incumbent "within 1 hour" copy; real project photography and third-party proof are absent; Egypt street address is missing (address lines removed from UI until confirmed); the logo carousel runs on thirteen user-supplied client logo files in `public/logos/` (`src/components/LogoCarousel.jsx` renders nothing if the list is empty) — client relationships behind those marks are not independently verified. New services copy raises further pending items: pump manufacturer brands/partnerships (omitted from UI); company logo file (navbar uses `public/logo.png`); 1993 founding year (confirmed) vs 25-years-in-business tension (1993 implies ~33 years); unconfirmed 500+ AMC clients figure; no real project examples supplied yet (proof points stay general); per-section photography for detail spotlights still needed (pump room first, 1200×800). Resolved: GACP Egypt badge asset received (`public/logos/gacp-egypt-logo-hd.png`, shown framed in the home proof seal). Resolved: 01003620490 verified and unified as the single call/WhatsApp number across the site.

## Brand Commitments

Name: ALNANDA Contracting. Voice: factual, compliance-focused, safety-first. Email still uses the legacy info@universalfirefighting.com domain — rebrand the address when the new domain is confirmed. Binding facts: Civil Defense-approved partner claims (Egypt), NFPA + Egyptian Fire Protection Code language, theme-color `#CC2643`, contact facts (call/WhatsApp +20 100 362 0490 via tel:+201003620490 and https://wa.me/201003620490; info@universalfirefighting.com; Mon–Sat 8:00 AM–6:00 PM · 24/7 Emergency). Assets on hand: `public/favicon.svg` only. No binding visual direction was volunteered during init.

## Evidence on Hand

User-supplied source documents: homepage copy variations (Authority-Led selected for the hero), a 13-service detailed reference, full per-service detail copy, and a final services update (hub headline/intro/bottom CTA; per-service Overview, Why, typed coverage lists, Installation & Maintenance Excellence, Compliance, Benefits, per-service CTA) wired into `src/pages/Services.jsx` and banded `src/pages/ServiceDetail.jsx` sections via `src/data/services.js`. Standards shown beyond NFPA 13/14/20/25 are unverified (see above). "GACP Egypt certified" is user-confirmed as verified (badge asset received and shown in the home proof seal). Stats confirmed: 25+ years / 100+ projects; founded 1993 per user (sits beside the 25-year claim — arithmetic tension noted, not resolved). The 500+ AMC clients figure is unconfirmed and retained only until corrected. Meta description and title (`index.html`). Absences future work must not fabricate: no verified testimonials, case studies, press, pricing, licensing documents, or Egypt street address; Gallery items are titled placeholders with an explicit note that `gallery-visual` blocks await real photos (`src/pages/Gallery.jsx`).

## Product Principles

1. Compliance is safety: every claim and workflow ties back to Civil Defense, NFPA, or Egyptian Fire Protection Code requirements.
2. Single accountability end-to-end: one partner owns engineering through maintenance, so the site always presents complete paths, not isolated products.
3. Speed builds trust: inspection, quote, and emergency response times are first-class promises, stated plainly.
4. Honest proof only: show only confirmed approvals, facts, and photos; mark placeholders as placeholders rather than inventing evidence.
5. Verify before publishing: standards citations, street address, and logos stay out of the UI until confirmed or supplied.
