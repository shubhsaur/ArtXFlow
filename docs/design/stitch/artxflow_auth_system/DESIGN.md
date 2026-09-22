---
name: ArtXFlow Auth System
colors:
  surface: '#0f141b'
  surface-dim: '#0f141b'
  surface-bright: '#353941'
  surface-container-lowest: '#090e15'
  surface-container-low: '#171c23'
  surface-container: '#1b2027'
  surface-container-high: '#252a32'
  surface-container-highest: '#30353d'
  on-surface: '#dee2ed'
  on-surface-variant: '#c2c6d8'
  inverse-surface: '#dee2ed'
  inverse-on-surface: '#2c3138'
  outline: '#8c90a1'
  outline-variant: '#424655'
  surface-tint: '#b3c5ff'
  primary: '#b3c5ff'
  on-primary: '#002a76'
  primary-container: '#0b62f5'
  on-primary-container: '#eef0ff'
  inverse-primary: '#0054d8'
  secondary: '#bdc7d9'
  on-secondary: '#27313f'
  secondary-container: '#404a59'
  on-secondary-container: '#afb9cb'
  tertiary: '#7bd0ff'
  on-tertiary: '#00354a'
  tertiary-container: '#0076a0'
  on-tertiary-container: '#e4f3ff'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b3c5ff'
  on-primary-fixed: '#00184a'
  on-primary-fixed-variant: '#003fa5'
  secondary-fixed: '#d9e3f6'
  secondary-fixed-dim: '#bdc7d9'
  on-secondary-fixed: '#121c2a'
  on-secondary-fixed-variant: '#3d4756'
  tertiary-fixed: '#c4e7ff'
  tertiary-fixed-dim: '#7bd0ff'
  on-tertiary-fixed: '#001e2c'
  on-tertiary-fixed-variant: '#004c69'
  background: '#0f141b'
  on-background: '#dee2ed'
  surface-variant: '#30353d'
typography:
  display:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 38px
    letterSpacing: -0.025em
  headline-lg:
    fontFamily: Geist
    fontSize: 26px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Geist
    fontSize: 20px
    fontWeight: '500'
    lineHeight: 26px
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '500'
    lineHeight: 22px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: -0.01em
  body-md:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: -0.005em
  body-sm:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: 0em
  label-md:
    fontFamily: Geist
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Geist
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.03em
  code-sm:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: 0em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1rem
  margin: 1.25rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style
This design system pairs the clinical precision of modern developer tooling with high-performance creative workflows. Designed specifically for technical creators and pipeline engineers, it communicates security, low-friction entry, and state-of-the-art computational reliability.

The visual direction merges **Minimalism** with structural **Developer-Centric Utilitarianism**:
- Deep atmospheric dark-mode foundations that reduce retinal fatigue.
- Razor-sharp structural division achieved via low-contrast hairline borders rather than heavy shadows.
- Vibrant cobalt-electric accents directing immediate interaction focus without clutter.
- High-density typographic hierarchy prioritizing scanning speed, credential safety, and deterministic feedback.

## Colors
The palette is engineered around pure visual focus and ergonomic contrast in low-light environments:

- **Surface Base (`#0f141b`)**: The primary canvas background; an ink-tinted carbon tone providing deep black value without harshness.
- **Surface Elevation (`#151c24` / `#1c2430`)**: Tiered charcoal layers used for interactive containers, panels, and input surfaces.
- **Brand Primary (`#0b62f5`)**: An intense, calibrated blue signaling primary action points, active indicators, and focus rings.
- **Secondary Neutral (`#1f2937`)**: Structural borders, divider rules, and secondary button fills.
- **Accent Highlight (`#38bdf8`)**: A cyan-blue modifier for inline links, secure verification statuses, and micro-metrics.
- **Text & Foreground**:
  - `High-Contrast`: `#f8fafc` (Headings, primary input text, button text)
  - `Muted / Secondary`: `#94a3b8` (Labels, tooltips, secondary guidance)
  - `Ghost / Subdued`: `#475569` (Placeholders, disabled markers, perimeter borders)
- **Functional Signals**:
  - Error: `#ef4444` (Validation alerts, destructive prompts)
  - Success: `#10b981` (Biometric confirmed, password strength complete)

## Typography
Leveraging the geometric precision and mono-linear weight distribution of Geist, typography across authentication views remains neutral, highly legible, and engineered for fast cognitive capture.

- **Numerics & Keys**: Numbers and code inputs (e.g., 2FA verification codes, API keys) inherit proportional tabular alignment for crisp visual stacking.
- **Hierarchy Structure**: Form screens lead with concise `headline-lg` titles coupled with `body-md` secondary descriptors.
- **Labels**: Strict uppercase or tracking-adjusted `label-sm` weights establish unambiguous form boundaries.

## Layout & Spacing
Authentication workflows follow a single-column, fluid mobile architecture designed to sit comfortably between 360px and 480px viewports without horizontal bleed.

- **Horizontal Canvas Margin**: A fixed outer safe boundary of `1.25rem` (20px) guarantees touch accessibility near display edges.
- **Form Vertical Rhythm**:
  - `space-xs` (4px): Micro-spacing between input labels and error helpers.
  - `space-sm` (8px): Distance between label and input frame.
  - `space-md` (16px): Standard gap between independent form groups.
  - `space-lg` (24px): Boundary between form fields and primary execution actions.
  - `space-xl` (32px): Division between primary credential blocks, social auth dividers, and footer registration switcher links.
- **Adaptive Height**: Action buttons and interactive panels maintain a minimum 48px hit target to ensure immediate single-hand tap responsiveness on native mobile browsers.

## Elevation & Depth
Depth is constructed using **tonal surface layering** combined with **low-contrast outlines** rather than heavy drop shadows:

- **Level 0 (Canvas Base)**: Pure `#0f141b`. Houses branding marks, ambient background grids, and static legal copy.
- **Level 1 (Form Containers & Cards)**: `#151c24` background with a subtle border of `rgba(255, 255, 255, 0.08)`.
- **Level 2 (Active Elements & Inputs)**: `#1c2430` background. On focus, surfaces project an inner perimeter glow: `0 0 0 1px #0b62f5` coupled with an ambient outer glow of `0 0 16px rgba(11, 98, 245, 0.25)`.
- **Level 3 (Modals & Overlays)**: `#1a222d` backdrop with `backdrop-filter: blur(12px)` and a crisp outer border of `rgba(255, 255, 255, 0.12)`.

## Shapes
To preserve the technical, IDE-inspired character, this system adheres to compact, controlled radii (`roundedness: 1`):

- **Inputs, Buttons, & Field Wrappers**: `0.25rem` (4px). Delivers a crisp, tool-like edge.
- **Cards, Auth Panels, & Sheets**: `0.5rem` (8px) (`rounded-lg`). Ensures macroscopic framing remains soft without drifting into playful consumer shapes.
- **Selection Controls & Checkboxes**: `0.25rem` (4px) corner radius for visual cohesion.

## Components

### Buttons
- **Primary Auth Button**:
  - Background: `#0b62f5`
  - Text: `#ffffff`, `label-md`, font weight `500`
  - Height: `48px`, full container width
  - Hover / Active: `#094ec2` background; subtle tactile scale compression to `0.99`
  - Disabled: `#151c24` fill, `#475569` text, `border: 1px solid rgba(255, 255, 255, 0.04)`
- **Secondary / OAuth Buttons (GitHub, Google, SSO)**:
  - Background: `#151c24`
  - Border: `1px solid rgba(255, 255, 255, 0.1)`
  - Text: `#f8fafc` with a left-aligned monochrome or brand icon
  - Height: `44px`
- **Text & Inline Actions**:
  - Transparent fill, `#38bdf8` text, underline on tap.

### Input Fields
- **Container**: `44px` height, background `#151c24`, border `1px solid rgba(255, 255, 255, 0.08)`.
- **Typography**: Geist `body-md` (`#f8fafc`), placeholder text `#475569`.
- **States**:
  - Focus: Border shifts to `#0b62f5`, ambient halo `0 0 0 1px #0b62f5`.
  - Error: Border shifts to `#ef4444`, caption helper turns `#ef4444` using `body-sm`.
- **Add-ons**: Trailing toggle icons (e.g., show/hide password, clear value) rendered in `#94a3b8` with a 24x24px tap hit area.

### Checkboxes & Segmented Controls
- **Remember Me Checkbox**:
  - `18px x 18px`, `roundedness: 1`, border `1px solid rgba(255, 255, 255, 0.2)`.
  - Checked: `#0b62f5` fill with a crisp white checkmark glyph.
- **Auth Toggle (Sign In / Sign Up Tabs)**:
  - Surface: Segmented pill container `#10161f` with `p-1`.
  - Inactive Tab: Transparent background, `#94a3b8` text.
  - Active Tab: `#1c2430` background, `#f8fafc` text, subtle hairline border.

### Security Badges & Micro-Feedback
- **Password Complexity Meter**:
  - A 4-segment continuous bar (`h-1`, gap `space-xs`).
  - Active segments transition sequentially from `#ef4444` (weak) to `#f59e0b` (medium) to `#10b981` (strong).
- **One-Time Code (OTP) Inputs**:
  - Row of 6 isolated input blocks (`42px x 48px`).
  - Active cell carries the electric primary border `#0b62f5` with an active blink caret.