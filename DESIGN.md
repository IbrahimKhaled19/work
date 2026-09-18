---
name: Universal Fire Fighting
description: Civil Defense-approved fire protection partner for the UAE.
colors:
  signal-red: "#C8102E"
  signal-dark: "#9C0C24"
  signal-deep: "#74081A"
  ember-flare: "#E6452D"
  alert-sand: "#FFD9A0"
  ink: "#1C1C28"
  ink-soft: "#3A3A4A"
  muted: "#6B7280"
  footer-mist: "#B9B9C6"
  paper: "#FFFFFF"
  paper-alt: "#F6F6F9"
  line: "#E5E7EB"
typography:
  display:
    fontFamily: "system-ui, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
    fontSize: "clamp(2.1rem, 5vw, 3.4rem)"
    fontWeight: 800
    lineHeight: 1.2
  headline:
    fontFamily: "system-ui, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
    fontSize: "clamp(1.8rem, 3.4vw, 2.4rem)"
    fontWeight: 800
    lineHeight: 1.2
  title:
    fontFamily: "system-ui, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
    fontSize: "1.1rem"
    fontWeight: 800
    lineHeight: 1.2
  body:
    fontFamily: "system-ui, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "system-ui, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
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

# Design System: Universal Fire Fighting

## Overview

**Creative North Star: "The Civil Defense Standard"**

This is a confident, industrial compliance system: a white-paper base with dark ink structure, sealed by a single authoritative red. It reads like an approval stamp, not a decoration — every screen proves tenure, certification, and end-to-end accountability before asking for the quote. Density is medium and task-driven: centered section headers, three-up service grids, and alternating detail blocks that move survey → design → install → maintain without detours.

Expression lives in two places only: deep-red gradient heroes with an amber alert glow, and the red seal itself on actions and eyebrows. Everything else stays calm, engineered, and scannable so emergency numbers, compliance claims, and the quote form survive stress reading.

**Key Characteristics:**
- Compliance-first authority: red as seal, neutrals doing the work
- Solid and engineered controls: pill actions, chunky 14px surfaces, decisive hover
- Layered and tonal depth: bands and borders first, shadow only as response
- System-sans confidence: heavy headings, plain 16px/1.6 body, tracked uppercase eyebrows

## Colors

A single-signal palette: authoritative Civil Defense reds over a clean ink-on-paper neutral stack, warmed only in hero gradients.

### Primary
- **Civil Signal Red** (#C8102E): the one action and emphasis color — primary buttons, eyebrows, active nav, stat figures, card hover borders, focus rings.
- **Signal Dark** (#9C0C24): primary button hover and pressed depth.
- **Deep Signal Red** (#74081A): gradient anchor for heroes, CTAs, and the sticky proof card; never body text.
- **Ember Flare** (#E6452D): hero and CTA gradient end-stop only; never a text or border token.
- **Alert Sand** (#FFD9A0): hero headline highlight word only; the single warm contrast against deep red.

### Neutral
- **Ink** (#1C1C28): headings, footer ground, dark visual base.
- **Ink Soft** (#3A3A4A): body-adjacent emphasis, nav links, checklist text.
- **Muted Slate** (#6B7280): secondary copy, stat labels, section-head descriptions.
- **Footer Mist** (#B9B9C6): footer body copy on dark ground.
- **Paper** (#FFFFFF): default surface.
- **Paper Alt** (#F6F6F9): alternating section bands and subtle input-code chips.
- **Hairline** (#E5E7EB): borders, dividers, card outlines, form strokes.

### Named Rules
**The One Signal Rule.** Signal Red covers ≤10% of any screen. Its rarity is the point — neutrals carry the layout, red seals the decision.

## Typography

**Display Font:** system-ui stack (with 'Segoe UI', Roboto, Helvetica, Arial, sans-serif fallback)
**Body Font:** system-ui stack (with 'Segoe UI', Roboto, Helvetica, Arial, sans-serif fallback)

**Character:** Confident and industrial — extra-bold short-line headings over a plain, highly legible body. No display serif, no geometric voice; authority comes from weight and order.

### Hierarchy
- **Display** (800, clamp(2.1rem, 5vw, 3.4rem), 1.2): hero headline only, white on deep-red gradient with one Alert Sand highlight phrase.
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
- Sticky white bar (76px) with hairline base and faint separation shadow. Links are semibold pill chips (8px 14px): Ink Soft at rest, Signal Red on a 6–8% red wash for hover and active. Quote action is the primary pill. Mobile collapses behind a three-bar toggle into a full-width dropdown panel (16px padding, surge shadow).

### Stats Strip
- Border-divided proof row (4-up desktop, 2-up tablet, stacked mobile): oversized red figures (2.3rem, 900) over semibold muted labels (0.88rem). Dividers are hairlines, never shadows.

### Milestones
- White cards with a 4px red top seal (14px radius, ambient lift, 24px padding): red year (1.2rem, 900) over muted copy. The top border is the brand — never remove it.

## Do's and Don'ts

Concrete guardrails grounded in the incumbent implementation.

### Do:
- **Do** keep heroes on the Deep Signal → Signal → Ember gradient (135deg) with the amber radial glow and dark scrim.
- **Do** open sections with a red eyebrow, then headline, then muted supporting line.
- **Do** use the 14px / pill / 10px radius ladder exactly as staged in frontmatter.
- **Do** convey placeholder imagery as dark engineered wells with a red medallion until real photos ship.

### Don't:
- **Don't** introduce a second accent hue — Alert Sand is a hero highlight only, never buttons or links.
- **Don't** add always-on card shadows or new shadow values outside the three-step vocabulary.
- **Don't** set body copy in red or on red except hero, CTA, and proof-card surfaces.
- **Don't** fabricate testimonials, logos, pricing, or license imagery — mark placeholders as placeholders.
