---
name: Technical Distribution Engine
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
  secondary: '#ffb95f'
  on-secondary: '#472a00'
  secondary-container: '#ee9800'
  on-secondary-container: '#5b3800'
  tertiary: '#cabeff'
  on-tertiary: '#30009b'
  tertiary-container: '#6f50f1'
  on-tertiary-container: '#f5efff'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b3c5ff'
  on-primary-fixed: '#00184a'
  on-primary-fixed-variant: '#003fa5'
  secondary-fixed: '#ffddb8'
  secondary-fixed-dim: '#ffb95f'
  on-secondary-fixed: '#2a1700'
  on-secondary-fixed-variant: '#653e00'
  tertiary-fixed: '#e6deff'
  tertiary-fixed-dim: '#cabeff'
  on-tertiary-fixed: '#1b0062'
  on-tertiary-fixed-variant: '#4718c9'
  background: '#0f141b'
  on-background: '#dee2ed'
  surface-variant: '#30353d'
  surface-base: '#070B12'
  surface-raised: '#0D1420'
  surface-overlay: '#111A28'
  border-subtle: '#172333'
  border-default: '#243447'
  border-highlight: rgba(11, 98, 245, 0.35)
  secondary-container-deep: '#451A03'
  secondary-foreground: '#F59E0B'
  secondary-foreground-bright: '#FBBF24'
  flow-cyan: '#19D7FE'
  status-success: '#12B76A'
  status-warning: '#F59E0B'
  status-error: '#D92D20'
  status-info: '#0B62F5'
  text-primary: '#F5F7FA'
  text-secondary: '#AAB5C4'
  text-muted: '#66768D'
typography:
  display:
    fontFamily: Geist
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 52px
    letterSpacing: -0.03em
  display-mobile:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.025em
  headline-lg:
    fontFamily: Geist
    fontSize: 36px
    fontWeight: '600'
    lineHeight: 42px
    letterSpacing: -0.025em
  headline-lg-mobile:
    fontFamily: Geist
    fontSize: 26px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 30px
    letterSpacing: -0.02em
  headline-sm:
    fontFamily: Geist
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 26px
    letterSpacing: -0.015em
  title-md:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 22px
    letterSpacing: -0.01em
  title-sm:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: -0.005em
  body-lg:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
    letterSpacing: -0.005em
  body-md:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
    letterSpacing: 0em
  body-sm:
    fontFamily: Geist
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0em
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: -0.01em
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.02em
  caption:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: 0.01em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-lg: 1.5rem
  margin: 1rem
  margin-md: 1.5rem
  margin-lg: 2.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

This design system targets technical creators, platform engineers, and systems developers who require robust, low-latency deployment and distribution infrastructure. The visual personality communicates precision, uncompromised performance, and structural reliability—reminiscent of mission-critical developer platforms like Linear, Raycast, and modern cloud orchestrators.

The aesthetic philosophy balances **Sleek Technical Density** with **Controlled Energy**:
- **Utilitarian Ergonomics:** Compact UI controls, clear keyboard commands, dense telemetry monitors, and minimal decorative noise.
- **Architectural Dark Mode:** Deep obsidian surfaces paired with micro-borders to maintain sustained visual comfort in high-density engineering environments.
- **High-Velocity Accents:** An electric royal cobalt blue primary color (#0B62F5) signals deterministic execution and active runtime operations, balanced by an authoritative warm amber secondary (#F59E0B) for stage validation, review gates, and warning states.

## Colors

The color palette is architected for dark-mode technical workflows, strictly adhering to WCAG 2.2 AA contrast standards.

### Primary Cobalt (#0B62F5)
The primary hue anchors dispatch triggers, active routing channels, focus rings, and primary interactive surfaces. It represents certainty, mechanical execution, and authoritative machine states.

### Secondary Amber (#F59E0B)
The secondary amber accent drives pipeline staging, review gates, webhook verification warnings, and rate-limiting alerts.
- Solid amber actions utilize `#FFFFFF` (or high-contrast dark slate `#070B12`) text.
- Secondary container states leverage deep amber bases (`#362005` or `#451A03`) coupled with luminous amber text (`#F59E0B` and `#FBBF24`) to denote non-blocking warnings or staged payloads.

### Obsidian Surface Infrastructure
- **Surface Base (`#070B12`):** Ground level canvas for terminal logs, graphs, and backdrop spaces.
- **Surface Raised (`#0D1420` / `#181C23`):** Core working cards, interactive code blocks, and editor panels.
- **Surface Overlay (`#111A28`):** Elevated popovers, command palettes, and modals.
- **Hairline Dividers:** Panel partitions use `#172333`; interactive form borders and cards use `#243447`.

## Typography

The typographic pairing provides high scanning speed and surgical legibility:
- **Geist** drives interface hierarchies, headlines, navigation rails, and core content body. With engineered geometric proportions and tight negative tracking, it gives tabular views and analytical dashboards a clean, modern aesthetic.
- **JetBrains Mono** is reserved strictly for operational parameters: commit hashes, deployment endpoints, response status codes, payload schemas, and keyboard shortcuts.
- **Readability Rules:** Long-form prose and markdown documentation containers must constrain maximum width to 680px–740px to eliminate horizontal visual scanning fatigue.

## Layout & Spacing

A strict 4px grid controls spatial density and structural alignment throughout the canvas:
- **Screen Architecture:** Maximum outer envelope is capped at 1440px with margins scaling dynamically from 16px (mobile) to 40px (desktop workstations).
- **Responsive Adaptations:**
  - **Mobile (< 768px):** Single-column stacked stream. Complex multi-destination channels collapse into sliding action sheets; system logs collapse into a compact bottom dock.
  - **Tablet (768px - 1024px):** Split-view workspace balancing input telemetry and target platform settings.
  - **Desktop (> 1024px):** Three-tier layout comprising a fixed compact navigation rail (64px collapsed / 240px expanded), an elastic center workspace, and a 340px inspector panel for routing rules and pipeline adapters.

## Elevation & Depth

Visual depth is achieved through crisp tonal layering and hairline edge definitions rather than heavy diffused drop shadows:
- **Level 0 (Canvas Base):** `#070B12` solid background.
- **Level 1 (Panels & Workspace Cards):** `#0D1420` surface with a 1px `#172333` boundary stroke.
- **Level 2 (Popovers, Select Menus, Tooltips):** `#111A28` surface with a `#243447` border and low-opacity ambient drop (`0 8px 24px -4px rgba(0, 0, 0, 0.55)`).
- **Level 3 (Modal Overlays & Command Bar):** Translucent backdrop (`rgba(13, 20, 32, 0.85)`) with a 12px blur effect and an inset top hairline (`rgba(255, 255, 255, 0.08)`).
- **Accent Glows:** Primary active triggers emit a focused cobalt aura (`0 0 16px -2px rgba(11, 98, 245, 0.35)`), while amber warning callouts use an ambient secondary glow (`0 0 16px -4px rgba(245, 158, 11, 0.2)`).

## Shapes

The design system adheres to a calibrated **Soft** roundedness level (`roundedness: 1`):
- **Tags, Micro Indicators & Keycaps:** 4px radius (`rounded-sm`).
- **Form Controls, Buttons & Inputs:** 6px radius (`rounded-md`).
- **Cards, Code Containers & Modal Surfaces:** 8px–10px radius (`rounded-lg`).
- **Pill Badges & Status LEDs:** 9999px radius (`rounded-full`) for continuous status markers.

## Components

### Buttons
- **Primary Dispatch Button:** Solid electric royal cobalt blue (`#0B62F5`), white text, medium weight (600), 6px border radius. Hover state lightens to `#2675F7` with an active inner hairline highlight (`box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.2)`).
- **Secondary / Staging Button:** Amber `#F59E0B` base with `#070B12` text for urgent manual approval gates, or container style with `#362005` fill, `1px solid rgba(245, 158, 11, 0.4)`, and `#FBBF24` label.
- **Ghost / Utility Button:** Translucent or `#0D1420` base with a 1px `#243447` border. Hover shifts border color to `#0B62F5` and text to `#F5F7FA`.

### Multi-Platform Badges & Chips
- Rendered using `JetBrains Mono` (`label-sm`).
- **Active / Dispatched:** Deep blue or green tint with a steady ping indicator.
- **Staging / Rate-Limited (Secondary Amber):** Background `#362005`, border `rgba(245, 158, 11, 0.4)`, text `#FBBF24`, containing a pulsing amber status LED.
- **Failed / Blocked:** Background `rgba(217, 45, 32, 0.1)`, border `rgba(217, 45, 32, 0.35)`, text `#D92D20`.

### Technical Input Fields & Checkboxes
- **Inputs:** `#0D1420` surface with a crisp 1px `#243447` border and Geist typography. Focus states swap the border to `#0B62F5` backed by a 2px outer glow (`rgba(11, 98, 245, 0.2)`).
- **Staging / Warning Focus:** Inputs flagged for schema discrepancies transition focus rings to `#F59E0B` with `rgba(245, 158, 11, 0.2)` spread.
- **Checkboxes & Radios:** 4px radius with `#243447` inactive border; active state fills with `#0B62F5` and displays a high-contrast white check.

### Cards & Pipeline Nodes
- Base cards utilize `#0D1420` surface with `#172333` borders.
- Cards in staging review status apply a persistent 1px top border of `#F59E0B` and a subtle `#362005` gradient wash on the card header.