# Design Brief

## Direction

BizControl — Professional business management and financial tracking interface combining data density with clean visual hierarchy through dark sidebar + white cards + semantic color coding.

## Tone

Enterprise-grade minimalism: no decoration, no gradients, pure focus on functional clarity and trustworthiness in accounting/ERP contexts.

## Differentiation

Dark navy sidebar + pristine white content cards with intentional elevation (shadow), semantic semantic color vocabulary (green income, red expense, orange actions) creates instant visual parsing of business data.

## Color Palette

| Token | OKLCH | Role |
| --- | --- | --- |
| background | 1.0 0 0 | Pure white content area |
| foreground | 0.15 0.01 260 | Near-black text |
| card | 1.0 0 0 | Content container on white |
| primary | 0.5 0.15 240 | Primary actions, focus states |
| accent | 0.62 0.18 45 | Warm orange for secondary CTA |
| success | 0.45 0.18 140 | Green for income/profit |
| destructive | 0.55 0.22 25 | Red for expense/warning |
| muted | 0.95 0.01 260 | Disabled states, subtle text |
| border | 0.9 0.01 260 | Input/card edges |
| sidebar-background | 0.18 0.03 225 | Deep navy navigation |

## Typography

- Display: Bricolage Grotesque — page titles, section headers
- Body: DM Sans — all body copy, form labels, dense tables
- Scale: h1 28px/font-display, h2 20px/font-display, label 12px/font-body, body 14px/font-body

## Elevation & Depth

Single-layer elevation system: cards on white background use `shadow-card` (soft, 2px offset), muted borders on inputs, sidebar is darkest surface. No layered shadows or glassmorphism.

## Structural Zones

| Zone | Background | Border | Notes |
| --- | --- | --- | --- |
| Header | sidebar-background | None | White text/icons on navy, max-height 64px |
| Sidebar | sidebar-background | None | Left rail, white nav items, subtle hover states (no highlights) |
| Content | background (white) | None | Full-bleed white main area, card sections within |
| Cards | card (white) | border (light grey) | Rounded corners 8px, shadow-card, min-gap 1rem |
| Inputs | input (light grey) | border | Neutral grey background, dark text, 6px radius |

## Spacing & Rhythm

Consistent 1rem (16px) gaps between card sections, 0.5rem micro-spacing within cards; sidebar width 240px fixed on desktop, hamburger menu on mobile. Cards stack on mobile with full-width layout.

## Component Patterns

- Buttons: Primary (blue bg), Accent (orange), Success (green), Destructive (red); all 6px radius, no shadow, 44px min-height for touch
- Cards: 8px border-radius, white bg, soft shadow, 1rem padding
- Badges: 4px radius, muted background, condensed font-weight

## Motion

Entrance: no animations (dashboard context prioritizes perceived performance). Hover: all interactive elements use `transition-colors 200ms ease-out`. Focus: ring around focused elements using `--ring` (primary blue).

## Constraints

- No full-page gradients; white background only
- No bright drop shadows or neon effects
- Sidebar fixed minimum 240px; responsive hamburger on mobile
- All data tables use light grey borders for cell separation
- Form density prioritized over whitespace

## Signature Detail

Dark navy sidebar contrasts sharply against white content, creating instant visual separation between navigation and information — a design principle borrowed from mature accounting software (Xero, QuickBooks) that signals enterprise trust and clarity.

