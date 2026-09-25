---
name: ALNANDA Contracting
description: Civil Defense-approved fire protection partner for the UAE.
colors:
  signal-red: "#CC2643"
  signal-dark: "#B81F39"
  signal-deep: "#000000"
  ink: "#221F1F"
  ink-soft: "#404040"
  muted: "#666666"
  footer-mist: "#B9B9C6"
  paper: "#F6F6F9"
  paper-alt: "#E9E9ED"
  line: "#E5E7EB"
typography:
  display:
    fontFamily: "Montserrat, system-ui, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
    fontSize: "clamp(2.1rem, 5vw, 3.4rem)"
    fontWeight: 800
    lineHeight: 1.2
  headline:
    fontFamily: "Montserrat, system-ui, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
    fontSize: "clamp(1.8rem, 3.4vw, 2.4rem)"
    fontWeight: 800
    lineHeight: 1.2
  title:
    fontFamily: "Montserrat, system-ui, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
    fontSize: "1.1rem"
    fontWeight: 800
    lineHeight: 1.2
  body:
    fontFamily: "Montserrat, system-ui, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Montserrat, system-ui, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
    fontSize: "0.82rem"
    fontWeight: 700
    lineHeight: 1.4
    letterSpacing: "2px"
rounded:
  xs: "6px"
  sm: "10px"
  md: "12px"
  lg: "14px"
  pill: "999px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "48px"
  section: "84px"
components:
  button-primary:
    backgroundColor: "{colors.signal-red}"
    textColor: "{colors.paper}"
    rounded: "{rounded.pill}"
    padding: "12px 26px"
  button-primary-hover:
    backgroundColor: "{colors.signal-dark}"
    textColor: "{colors.paper}"
    rounded: "{rounded.pill}"
    padding: "12px 26px"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.paper}"
    rounded: "{rounded.pill}"
    padding: "12px 26px"
  button-light:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.signal-red}"
    rounded: "{rounded.pill}"
    padding: "12px 26px"
  card-default:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink-soft}"
    rounded: "{rounded.lg}"
    padding: "30px"
  input-default:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "12px 14px"
---

# Design System: ALNANDA Contracting

## Overview

**Creative North Star: "The Civil Defense Standard"**

This is a confident, industrial compliance system: a gray-paper base with white cards, dark ink structure, and black stat banding, sealed by a single authoritative red. It reads like an approval stamp, not a decoration — every screen proves tenure, certification, and end-to-end accountability before asking for the quote. Density is medium and task-driven: centered section headers, three-up service grids, and alternating detail blocks that move survey → design → install → maintain without detours.

White and gray carry every screen; ink carries the structure. Red is premium and rare — reserved for primary actions, eyebrows, the proof medallion, and interactive feedback. Everything else stays calm, engineered, and scannable so emergency numbers, compliance claims, and the quote form survive stress reading.

**Key Characteristics:**
- Compliance-first authority: red as seal, neutrals doing the work
- Solid and engineered controls: pill actions, chunky 14px surfaces, decisive hover
- Layered and tonal depth: bands and borders first, shadow only as response
- System-sans confidence: heavy headings, plain 16px/1.6 body, tracked uppercase eyebrows

## Colors

A single-signal palette: authoritative Civil Defense reds over a clean ink-on-paper neutral stack, warmed only in hero gradients.

### Primary
- **Civil Signal Red** (#CC2643): the one action and emphasis color — primary buttons, eyebrows, active nav, stat figures, card hover borders, focus rings.
- **Signal Dark** (#B81F39): primary button hover and pressed depth.
- **Deep Signal Black** (#000000): gradient anchor for heroes, CTAs, and the sticky proof card; never body text.

### Neutral
- **Ink** (#221F1F): headings, footer ground, dark visual base.
- **Ink Soft** (#404040): body-adjacent emphasis, nav links, checklist text.
- **Muted Slate** (#666666): secondary copy, stat labels, section-head descriptions.
- **Footer Mist** (#B9B9C6): footer body copy on dark ground.
- **Paper** (#F6F6F9): default page ground.
- **Paper Alt** (#E9E9ED): alternating section bands and tab cards; white cards sit on top.
- **Hairline** (#E5E7EB): borders, dividers, card outlines, form strokes.

### Named Rules
**The One Signal Rule.** Signal Red holds to roughly 5–10% of any screen: primary actions, eyebrows, the proof medallion, and hover rewards — never a resting surface. Icon wells and proof chips rest in gray ink and earn red only on interaction. Its rarity is the point — neutrals carry the layout, red seals the decision.

## Typography

**Display Font:** Montserrat (with system-ui, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif fallback)
**Body Font:** Montserrat (with system-ui, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif fallback)

**Character:** Confident and industrial — extra-bold short-line headings over a plain, highly legible body. No display serif, no geometric voice; authority comes from weight and order.

### Hierarchy
- **Display** (800, clamp(2.1rem, 5vw, 3.4rem), 1.2): hero headline only, white on the photographic hero with dark scrim.
- **Headline** (800, clamp(1.8rem, 3.4vw, 2.4rem), 1.2): centered section titles and inner page heroes (inner heroes use clamp(2rem, 4.4vw, 2.8rem)).
- **Title** (800, 1.1rem–1.9rem, 1.2): card titles (1.1rem), service block titles (clamp(1.4rem, 2.8vw, 1.9rem)), footer brand (1.15rem).
- **Body** (400, 16px/1.6, Ink Soft): default reading text; muted variant for descriptions (0.9–1.05rem).
- **Label** (700, 0.82rem, 2px tracking, uppercase): red eyebrows, service numerals (0.85rem, 800), gallery categories (0.75rem, 1.5px tracking), footer subheads (0.95rem, 1px tracking).

### Named Rules
**The Eyebrow-First Rule.** Every major section opens with a red uppercase eyebrow before the headline — no bare headlines.

## Layout

Centered-container engineering with tonal banding: a narrow content measure (min(1160px, 100% − 48px) centered) inside full-bleed bands. Vertical rhythm is generous and fixed — generous section padding (84px desktop, 56px mobile), 48px below centered headers (640px max measure), 24px card and gallery gaps, 40–56px split gaps.

Responsive behavior is two-step: at 980px three- and four-column grids collapse to two columns and splits stack; at 720px everything goes single column, the nav collapses to a dropdown panel, and stats lose side dividers for stacked dividers. Density stays airy on desktop, compact but never cramped on mobile.

## Elevation & Depth

Layered and tonal by default: depth comes from paper versus Paper Alt bands, 1px hairline borders, and dark gradient image wells — not shadow. Surfaces sit flat at rest.

### Shadow Vocabulary
- **Resting hairline** (`box-shadow: 0 1px 3px rgba(20, 20, 40, 0.05)`): sticky nav separation only.
- **Ambient lift** (`box-shadow: 0 10px 30px rgba(20, 20, 40, 0.08)`): resting quote form, success panel, milestone cards.
- **Hover surge** (`box-shadow: 0 20px 50px rgba(20, 20, 40, 0.16)`): card and gallery lift on hover with a 4–5px rise.

### Named Rules
**The Flat-By-Default Rule.** Surfaces are flat at rest. Shadow appears only as a response to state (hover, focus, sticky proof card).

## Shapes

Engineered roundness with one decisive gesture: pill actions (999px) against gently curved surfaces (14px). Supporting radii step down deliberately — contact icon wells (12px), text fields and brand badge (10px), inline code chips (6px), toggle bars (2px). Hero and visual wells use the same 14px language, with one perfect circle reserved for the service icon medallion (96px disc with a 14px red halo ring). Borders are 1px hairlines, thickening only as intent: 2px button outlines, 4px milestone top seals.

## Components

### Buttons
- Solid and engineered pill actions with a hard color shift on hover.
- **Shape:** fully pill (999px); full-width form submit uses the surface radius (14px).
- **Primary:** Civil Signal Red ground with white text and generous padding (12px 26px, quote variant 10px 22px).
- **Hover / Focus:** shifts to Signal Dark; outline variant washes white at 15%; light variant settles to Paper Alt.
- **Secondary / Ghost:** outline (translucent white border, white text, hero use) and light (white ground, red text, CTA use).

### Cards / Containers
- **Corner Style:** gently curved (14px).
- **Background:** white on Paper Alt bands, white on white with hairline when grouped.
- **Shadow Strategy:** flat at rest; hover surges with a 5px rise (see Elevation & Depth).
- **Border:** 1px hairline, turning Signal Red on hover.
- **Internal Padding:** generous (30px); centered variant adds icon (2rem) with tight title spacing.

### Inputs / Fields
- **Style:** white ground, hairline stroke, chunky small radius (10px), roomy padding (12px 14px), inherited 16px type.
- **Focus:** red stroke with a soft 3px signal halo (rgba(200, 16, 46, 0.12)).
- **Error / Disabled:** not yet systematized — do not invent; use native required behavior only.

### Navigation
- Sticky black bar (76px) with hairline base and faint separation shadow, blurring to translucent black on scroll. Links are semibold pill chips (8px 14px): mist at rest, white on a white wash for hover, white on a red wash for active. Quote action is the primary red pill; WhatsApp is a white-outline ghost. Mobile collapses behind a three-bar toggle into a full-width black dropdown panel (16px padding, surge shadow, staggered entrance).

### Stats Strip
- Black band with hairline dividers (4-up desktop, 2-up tablet, stacked mobile): oversized white figures (2.3rem, 900) over mist labels (0.88rem); figures turn red on hover only. Dividers are hairlines, never shadows.

### Milestones
- White cards with a 4px red top seal (14px radius, ambient lift, 24px padding): red year (1.2rem, 900) over muted copy. The top border is the brand — never remove it.

## Do's and Don'ts

Concrete guardrails grounded in the incumbent implementation.

### Do:
- **Do** keep heroes on the photographic visual with the dark scrim, page heroes and CTAs on near-black ink, and the proof medallion as the single red jewel on each dark surface.
- **Do** open sections with a red eyebrow, then headline, then muted supporting line.
- **Do** use the 14px / pill / 10px radius ladder exactly as staged in frontmatter.
- **Do** convey placeholder imagery as dark engineered wells with a red medallion until real photos ship.

### Don't:
- **Don't** introduce a second accent hue — white is the only highlight on red surfaces, never buttons or links.
- **Don't** add always-on card shadows or new shadow values outside the three-step vocabulary.
- **Don't** set body copy in red or on red except hero, CTA, and proof-card surfaces.
- **Don't** fabricate testimonials, logos, pricing, or license imagery — mark placeholders as placeholders.
