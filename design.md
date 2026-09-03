# ArtXFlow — Design System

> **Write once. Flow everywhere.**

ArtXFlow is a content distribution platform that lets creators and developers author content once and distribute it across multiple destinations. The visual identity should communicate **one source → many destinations**, movement, connection, and effortless distribution.

---

## 1. Brand Identity

### Brand name

**ArtXFlow**

### Brand meaning

- **Art** — Article / Authoring
- **X** — Cross-platform, intersection, connection, transformation
- **Flow** — The movement of content from one source to multiple destinations

### Brand idea

**One source. Every destination.**

### Primary tagline

**Write once. Flow everywhere.**

### Secondary messaging

- One source. Every destination.
- Create once. Reach everywhere.
- Your content, everywhere it belongs.
- One article. Every destination.

---

## 2. Logo

### Primary logo

The final ArtXFlow logo combines an abstract **AXF monogram** with a flowing distribution motif.

The mark represents:

```text
             Destination
                  ↑
                  |
Source ─────── AXF ───────→ Destination
                / \
               /   \
              ↓     ↓
         Destination  Destination
```

The visual system is intentionally abstract:

- A single source enters the mark.
- The **X** acts as the connection/distribution point.
- Flowing branches represent multiple destinations.
- The AXF monogram ties **Article + Cross-platform + Flow** into one symbol.

### Logo construction principles

- Keep the mark geometrically balanced.
- Preserve the negative space between flowing paths.
- Keep line endings smooth and rounded.
- Use the accent gradient only where it improves recognition.
- The symbol must remain recognizable at favicon/app-icon size.
- Never stretch, skew, rotate, outline, bevel, or add decorative effects to the logo.
- Avoid placing the logo over visually noisy backgrounds.

### Logo variants

1. **Primary gradient logo** — preferred for brand surfaces.
2. **Dark monochrome logo** — preferred for light backgrounds.
3. **White monochrome logo** — preferred for dark backgrounds.
4. **AXF icon** — app icon, favicon, compact navigation.
5. **Wordmark only** — use when the symbol is already established nearby.

---

## 3. Color Palette

The ArtXFlow palette uses a dark technical foundation with an energetic blue/cyan/purple flow gradient.

### Core colors

| Token | Hex | Purpose |
|---|---|---|
| `--axf-blue` | `#0B87FE` | Primary action / flow blue |
| `--axf-cyan` | `#19D7FE` | Flow highlight / energetic accent |
| `--axf-purple` | `#7A5CFD` | Secondary accent / destination end |
| `--axf-ink` | `#142436` | Deep brand ink / dark surfaces |
| `--axf-mist` | `#D0D9E5` | Light neutral / borders / subtle surfaces |

### UI neutrals

Use a neutral scale in addition to the brand colors.

```css
--background: #FFFFFF;
--background-subtle: #F7F9FC;

--surface: #FFFFFF;
--surface-elevated: #FFFFFF;

--text-primary: #101828;
--text-secondary: #667085;
--text-tertiary: #98A2B3;

--border-subtle: #E4E7EC;
--border-default: #D0D5DD;

--dark-background: #070B12;
--dark-surface: #0D1420;
--dark-border: #1C2A3A;

--dark-text-primary: #F5F7FA;
--dark-text-secondary: #AAB5C4;
```

### Brand gradient

The signature ArtXFlow gradient represents **content moving through the distribution layer**.

```css
background: linear-gradient(
  135deg,
  #0B87FE 0%,
  #19D7FE 45%,
  #7A5CFD 100%
);
```

Recommended usage:

- Logo flow paths
- Primary CTAs
- Selected states
- Hero accents
- Progress/distribution indicators
- Marketing illustrations

Do **not** use the gradient on every component. It should remain a distinctive brand accent.

### Color usage ratio

A useful baseline:

```text
Neutrals / surfaces    75–85%
Brand blue / cyan      10–15%
Purple accent           3–7%
```

The product should feel predominantly neutral, with the gradient reserved for moments of action, movement, and identity.

---

## 4. Typography

### Primary typeface

**Geist**

Use Geist as the primary interface and marketing typeface.

Why:

- Modern developer/SaaS aesthetic
- Excellent UI readability
- Strong numeric and technical character
- Works well in both dense dashboards and large marketing headings

### Fallback stack

```css
font-family:
  "Geist",
  "Inter",
  -apple-system,
  BlinkMacSystemFont,
  "Segoe UI",
  sans-serif;
```

### Monospace

**Geist Mono** for:

- Code
- Technical metadata
- API examples
- Content platform identifiers
- IDs / slugs
- Developer-focused UI

Fallback:

```css
font-family:
  "Geist Mono",
  "SFMono-Regular",
  Consolas,
  "Liberation Mono",
  monospace;
```

---

## 5. Type Scale

### Marketing

| Style | Size | Weight | Line height |
|---|---:|---:|---:|
| Display | 64px | 650–700 | 1.05 |
| H1 | 48px | 650–700 | 1.10 |
| H2 | 36px | 650 | 1.15 |
| H3 | 28px | 600–650 | 1.20 |
| H4 | 22px | 600 | 1.25 |
| Body Large | 18px | 400 | 1.55 |
| Body | 16px | 400 | 1.55 |
| Small | 14px | 400–500 | 1.45 |
| Caption | 12px | 500 | 1.35 |

### Product UI

```text
Page title       28px / 600
Section title    20px / 600
Body             15–16px / 400
Control label    14px / 500
Caption          12–13px / 500
```

Avoid excessive font weights. Prefer **400, 500, 600, and 700**.

---

## 6. Spacing

Use a consistent 4px base grid.

```text
4   px   → micro spacing
8   px   → icon / label spacing
12  px   → compact spacing
16  px   → standard spacing
20  px   → control spacing
24  px   → card padding
32  px   → section spacing
40  px   → large component spacing
48  px   → layout spacing
64  px   → major sections
80  px   → page-level separation
96+ px   → marketing hero separation
```

Prefer consistent rhythm over arbitrary values.

---

## 7. Radius

ArtXFlow should feel modern but not overly playful.

```text
4px   → tiny controls
6px   → inputs / compact UI
8px   → buttons / standard controls
12px  → cards
16px  → feature cards / panels
20px  → hero surfaces / app icon containers
24px  → large marketing surfaces
```

Use larger radii only when they improve hierarchy.

---

## 8. Shadows

Keep elevation subtle.

### Small

```css
box-shadow: 0 1px 2px rgba(16, 24, 40, 0.05);
```

### Medium

```css
box-shadow:
  0 4px 12px rgba(16, 24, 40, 0.08);
```

### Large

```css
box-shadow:
  0 12px 32px rgba(16, 24, 40, 0.12);
```

Avoid heavy, glossy, or skeuomorphic shadows.

---

## 9. Buttons

### Primary

Use the ArtXFlow gradient sparingly for primary brand actions.

```text
Flow Everywhere
Publish
Connect Platform
Create Article
```

Shape:

- Height: 40–44px
- Radius: 8–10px
- Weight: 500–600
- Strong contrast
- Optional subtle gradient highlight

### Secondary

Neutral surface with visible border.

```text
Background: transparent / surface
Border: --border-default
Text: --text-primary
```

### Destructive

Use a semantic red rather than the brand palette.

```css
--danger: #D92D20;
--danger-surface: #FEF3F2;
```

---

## 10. Iconography

Use a consistent outline icon system.

Recommended:

**Lucide**

Guidelines:

- 1.5–2px stroke
- Rounded joins
- Rounded caps
- Minimal visual noise
- 16–20px for controls
- 20–24px for feature icons

Avoid mixing filled and outlined icon families without clear intent.

---

## 11. Motion & Interaction

Motion should reinforce the concept of **flow**, not distract from the task.

### Distribution animation

A publish action can visually communicate:

```text
Article
   ↓
Transform
   ↓
ArtXFlow
   ↙ ↓ ↘
Blog  Dev  Medium
```

Use:

- 180–250ms for UI transitions
- 250–450ms for meaningful flow animations
- `ease-out` for entrances
- `ease-in-out` for state transitions

Avoid perpetual motion in the main dashboard.

### Reduced motion

Always respect:

```css
@media (prefers-reduced-motion: reduce) {
  /* Disable non-essential animation */
}
```

---

## 12. Surfaces & Layout

### Dashboard aesthetic

The product UI should feel closer to:

- Linear
- Vercel
- Stripe
- modern developer tooling

than to traditional social-media scheduling dashboards.

Characteristics:

- Generous whitespace
- Thin borders
- restrained elevation
- compact controls
- clear hierarchy
- keyboard-friendly interactions
- dense information without visual clutter

### Layout

Use a centered content container:

```text
Desktop max-width: 1200–1440px
Page horizontal padding: 24–40px
```

For editors and long-form content, prioritize readable text width:

```text
Article reading width: ~680–760px
```

---

## 13. Distribution Visualization

One of ArtXFlow's signature UI patterns should be the **source → destinations** visualization.

Example:

```text
                         Dev.to
                            ↑
                            │
Medium  ←──────────────  ArtXFlow  ──────────────→  Blog
                            │
                            ↓
                         Hashnode
```

Use the actual connected platforms as destinations.

The visual should:

- keep the source visually dominant
- use flowing paths rather than hard arrows
- animate only during publishing
- use brand colors to indicate active flow
- support success, pending, and failed states

---

## 14. Status Colors

Use semantic colors independently from the ArtXFlow brand colors.

```css
--success: #12B76A;
--warning: #F79009;
--error: #D92D20;
--info: #2E90FA;
```

Example:

```text
Published   → success
Publishing  → info
Scheduled   → neutral/info
Needs retry → warning
Failed      → error
```

Do not use purple/blue/cyan as a substitute for semantic status.

---

## 15. Dark Mode

Dark mode is a first-class experience.

### Base

```css
--background: #070B12;
--surface: #0D1420;
--surface-elevated: #111A28;

--text-primary: #F5F7FA;
--text-secondary: #AAB5C4;

--border-subtle: #172333;
--border-default: #243447;
```

The brand gradient should remain vibrant against dark surfaces, but reduce glow and blur effects to avoid visual fatigue.

---

## 16. Light Mode

Light mode should be the clean, editorial experience.

Use:

- white surfaces
- cool gray borders
- dark text
- subtle blue/cyan/purple accents

Avoid overly tinted backgrounds across the whole page.

---

## 17. Responsive Design

ArtXFlow must work well from mobile to large desktop.

### Breakpoints

```text
sm  → 640px
md  → 768px
lg  → 1024px
xl  → 1280px
2xl → 1536px
```

### Mobile principles

- Prioritize article/content first.
- Convert sidebars into sheets/drawers.
- Keep primary actions accessible.
- Avoid horizontal overflow.
- Use compact destination selectors.
- Preserve the AXF icon even when the wordmark disappears.

---

## 18. Accessibility

Target **WCAG 2.2 AA**.

Requirements:

- Keyboard navigable controls
- Visible focus states
- Sufficient text/background contrast
- Semantic HTML
- Screen-reader labels
- Never rely on color alone for status
- Touch targets of at least ~44px where practical
- Respect reduced-motion preferences

---

## 19. Voice & Tone

ArtXFlow should sound:

**Clear. Technical. Confident. Helpful.**

Avoid:

- hype
- buzzwords
- forced AI language
- corporate jargon
- overly casual copy

### Good

> Publish this article to 4 destinations.

> Your article is ready to flow.

> Medium needs attention before publishing.

### Avoid

> Blast your content everywhere instantly!!! 🚀

The product should feel like **serious infrastructure wrapped in an effortless interface**.

---

## 20. Design Principles

### 01 — One source, many destinations

The product should visually reinforce the core model everywhere.

### 02 — Flow, not friction

Complex distribution workflows should feel simple.

### 03 — Content first

The article is the primary object. Platform mechanics stay secondary.

### 04 — Technical, not intimidating

Developer-grade capability with approachable UX.

### 05 — Restraint creates identity

Use the gradient, X/AXF mark, and motion selectively so they remain recognizable brand cues.

---

## 21. Design Tokens Starter

```css
:root {
  /* Brand */
  --axf-blue: #0B87FE;
  --axf-cyan: #19D7FE;
  --axf-purple: #7A5CFD;
  --axf-ink: #142436;
  --axf-mist: #D0D9E5;

  /* Gradient */
  --axf-gradient: linear-gradient(
    135deg,
    #0B87FE 0%,
    #19D7FE 45%,
    #7A5CFD 100%
  );

  /* Light */
  --background: #FFFFFF;
  --background-subtle: #F7F9FC;
  --surface: #FFFFFF;
  --text-primary: #101828;
  --text-secondary: #667085;
  --text-tertiary: #98A2B3;
  --border-subtle: #E4E7EC;
  --border-default: #D0D5DD;

  /* Dark */
  --dark-background: #070B12;
  --dark-surface: #0D1420;
  --dark-surface-elevated: #111A28;
  --dark-text-primary: #F5F7FA;
  --dark-text-secondary: #AAB5C4;
  --dark-border-subtle: #172333;
  --dark-border-default: #243447;

  /* Semantic */
  --success: #12B76A;
  --warning: #F79009;
  --error: #D92D20;
  --info: #2E90FA;
}
```

---

## 22. Brand Snapshot

```text
Brand       ArtXFlow

Meaning     Article × Cross-platform × Flow

Concept     One source → Many destinations

Tagline     Write once. Flow everywhere.

Style       Premium developer SaaS

Primary     Dark / White / Electric Blue / Cyan / Purple

Type        Geist + Geist Mono

Icon        AXF flowing distribution monogram

UI          Clean, precise, fluid, technical

Motion      Content flowing from source to destinations
```

---

## 23. Non-negotiables

The ArtXFlow visual identity should always preserve these five things:

1. **AXF is the recognizable core mark.**
2. **The flow/distribution metaphor remains visible.**
3. **Blue → cyan → purple is the signature accent language.**
4. **Typography remains clean and technical.**
5. **The interface never becomes visually louder than the content.**
