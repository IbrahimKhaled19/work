# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary: facility owners and managers in the UAE (commercial, industrial, residential) evaluating a fire-protection partner. Situation: responsible for Civil Defense compliance, avoiding penalties, and keeping life-safety systems operational. Job: get an inspection, installation, or AMC quote fast and confirm the vendor can design, install, certify, and maintain the system.

Other audiences (present in navigation but secondary): contractors/developers needing certified installation work; small businesses and villa owners needing extinguishers, refilling, and certification.

## Product Purpose

Marketing and lead-generation website for Universal Fire Fighting (UFS). It explains fire-protection services, establishes trust through tenure and approvals, and drives quote/contact requests with a 1-hour engineer callback promise during working hours. Success means qualified quote requests via the Contact page.

## Positioning

35+ years of experience, Dubai Civil Defense approval, and end-to-end delivery — survey, design, supply, installation, testing, commissioning, and maintenance (including AMC) — under one roof to NFPA and UAE Fire Code standards. A neighboring firm could claim one of these, but not the combined tenure + approval + breadth truthfully.

## Operating Context

UAE regulatory environment: Dubai Civil Defense approval, NFPA, UAE Fire Code. Core workflow: survey → design → install → test → commission → maintain, plus monthly AMC inspections and 24/7 emergency call-out. Business hours Mon–Sat 8:00 AM–6:00 PM with 24/7 emergency coverage. Quote flow: visitor submits Contact form → engineer contacts them within 1 hour during working hours. Site routes: `/` Home, `/services`, `/about`, `/gallery`, `/contact` (React Router in `src/App.jsx`).

## Capabilities and Constraints

Confirmed functionality: six service lines (Fire Fighting Systems; Fire Alarm Systems; Fire Extinguishers incl. refilling, hydro testing, hiring, certification; Emergency & Exit Lighting; Fire Suppression incl. FM200/Novec/CO2/inert gas/kitchen hood; Annual Maintenance Contract with monthly inspections and 24/7 support). Quote form fields: name, phone, email, company (optional), service, message. Existing stack answers implementation: React 19 + Vite + react-router-dom (`package.json`, `vite.config.js`); entry `src/main.jsx`; no backend.

Explicitly undecided / missing: no backend or delivery path for quote submissions (`src/pages/Contact.jsx` keeps state locally and shows a success message only); no confirmed CRM, email routing, or SLA beyond the incumbent "within 1 hour" copy; real project photography and third-party proof are absent.

## Brand Commitments

Name: Universal Fire Fighting (UFS). Voice: factual, compliance-focused, safety-first. Binding facts carried from the incumbent implementation: DCD-approved partner claims, NFPA/UAE Fire Code language, theme-color `#C8102E`, contact facts (P.O. Box 113112, Mussafah 32/1, Abu Dhabi, UAE; WhatsApp +20 109 543 8894 via https://wa.me/201095438894; info@universalfirefighting.com; Mon–Sat 8:00 AM–6:00 PM · 24/7 Emergency). Assets on hand: `public/favicon.svg` only. No binding visual direction was volunteered during init.

## Evidence on Hand

Real content in code: service descriptions (`src/pages/Services.jsx`), company history and values (`src/pages/About.jsx`), contact details (`src/pages/Contact.jsx`, `src/components/Footer.jsx`), incumbent stat claims 35+ years / 1000+ projects / 500+ AMC clients / 24-7 support (`src/pages/Home.jsx`), meta description and title (`index.html`). Absences future work must not fabricate: no verified testimonials, case studies, press, client logos, pricing, or licensing documents; Gallery items are titled placeholders with an explicit note that `gallery-visual` blocks await real photos (`src/pages/Gallery.jsx`).

## Product Principles

1. Compliance is safety: every claim and workflow ties back to Civil Defense, NFPA, or UAE Fire Code requirements.
2. Single accountability end-to-end: one partner owns survey through maintenance, so the site always presents complete paths, not isolated products.
3. Speed builds trust: inspection, quote, and emergency response times are first-class promises, stated plainly.
4. Honest proof only: show only confirmed approvals, facts, and photos; mark placeholders as placeholders rather than inventing evidence.
