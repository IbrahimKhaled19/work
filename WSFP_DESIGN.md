# Fire Protection Company

## Mission
Create implementation-ready, token-driven UI guidance for Fire Protection Company that is optimized for consistency, accessibility, and fast delivery across documentation site.

## Brand
- Product/brand: Fire Protection Company
- URL: https://www.wsfp.com/
- Audience: developers and technical teams
- Product surface: documentation site

## Style Foundations
- Visual style: clean, functional, implementation-oriented
- Main font style: `font.family.primary=Montserrat`, `font.family.stack=Montserrat, sans-serif`, `font.size.base=16px`, `font.weight.base=400`, `font.lineHeight.base=24px`
- Typography scale: `font.size.xs=11.2px`, `font.size.sm=13.44px`, `font.size.md=13.6px`, `font.size.lg=14px`, `font.size.xl=14.4px`, `font.size.2xl=16px`, `font.size.3xl=18px`, `font.size.4xl=18.72px`
- Color palette: `color.text.primary=#ffffff`, `color.text.secondary=#221f1f`, `color.text.tertiary=#404040`, `color.text.inverse=#666666`, `color.surface.base=#000000`, `color.surface.raised=#b81f39`, `color.surface.strong=#cc2643`
- Spacing scale: `space.1=3.36px`, `space.2=6px`, `space.3=7.2px`, `space.4=8px`, `space.5=10px`, `space.6=10.8px`, `space.7=14px`, `space.8=14.4px`
- Radius/shadow/motion tokens: `radius.xs=2px`, `radius.sm=3.6px`, `radius.md=8px`, `radius.lg=14.4px` | `shadow.1=rgb(34, 31, 31) 2px 1px 8px 0px`, `shadow.2=rgb(34, 31, 31) 2px 2px 4px 0px` | `motion.duration.instant=500ms`

## Accessibility
- Target: WCAG 2.2 AA
- Keyboard-first interactions required.
- Focus-visible rules required.
- Contrast constraints required.

## Writing Tone
Concise, confident, implementation-focused.

## Rules: Do
- Use semantic tokens, not raw hex values, in component guidance.
- Every component must define states for default, hover, focus-visible, active, disabled, loading, and error.
- Component behavior should specify responsive and edge-case handling.
- Interactive components must document keyboard, pointer, and touch behavior.
- Accessibility acceptance criteria must be testable in implementation.

## Rules: Don't
- Do not allow low-contrast text or hidden focus indicators.
- Do not introduce one-off spacing or typography exceptions.
- Do not use ambiguous labels or non-descriptive actions.
- Do not ship component guidance without explicit state rules.

## Guideline Authoring Workflow
1. Restate design intent in one sentence.
2. Define foundations and semantic tokens.
3. Define component anatomy, variants, interactions, and state behavior.
4. Add accessibility acceptance criteria with pass/fail checks.
5. Add anti-patterns, migration notes, and edge-case handling.
6. End with a QA checklist.

## Required Output Structure
- Context and goals.
- Design tokens and foundations.
- Component-level rules (anatomy, variants, states, responsive behavior).
- Accessibility requirements and testable acceptance criteria.
- Content and tone standards with examples.
- Anti-patterns and prohibited implementations.
- QA checklist.

## Component Rule Expectations
- Include keyboard, pointer, and touch behavior.
- Include spacing and typography token requirements.
- Include long-content, overflow, and empty-state handling.
- Include known page component density: links (63), buttons (22), inputs (22), lists (22), navigation (2).


## Quality Gates
- Every non-negotiable rule must use "must".
- Every recommendation should use "should".
- Every accessibility rule must be testable in implementation.
- Teams should prefer system consistency over local visual exceptions.
