# ArtXFlow — Design System

> **Write once. Flow everywhere.**

## Brand

**ArtXFlow** represents:

- Art — Article / Authoring
- X — Cross-platform / intersection / connection
- Flow — movement of content from one source to many destinations

Core concept:

```text
ONE SOURCE → MANY DESTINATIONS
```

## Logo

The selected identity uses a lowercase/abstract **AXF** monogram with a flow/distribution motif.

It should communicate:

- one source entering
- intersection through X
- multiple paths leaving
- distribution without a generic network-diagram appearance

Use the full logo for primary brand surfaces and the compact AXF mark for app icon, favicon, and compact navigation.

## Color palette

### Brand

```css
--axf-blue: #0b87fe;
--axf-cyan: #19d7fe;
--axf-purple: #7a5cfd;
--axf-ink: #142436;
--axf-mist: #d0d9e5;
```

### Signature gradient

```css
--axf-gradient: linear-gradient(135deg, #0b87fe 0%, #19d7fe 45%, #7a5cfd 100%);
```

Use the gradient selectively for:

- logo
- primary actions
- active flow states
- hero accents
- distribution visualizations

### Light neutrals

```css
--background: #ffffff;
--background-subtle: #f7f9fc;
--surface: #ffffff;
--text-primary: #101828;
--text-secondary: #667085;
--text-tertiary: #98a2b3;
--border-subtle: #e4e7ec;
--border-default: #d0d5dd;
```

### Dark neutrals

```css
--dark-background: #070b12;
--dark-surface: #0d1420;
--dark-surface-elevated: #111a28;
--dark-text-primary: #f5f7fa;
--dark-text-secondary: #aab5c4;
--dark-border-subtle: #172333;
--dark-border-default: #243447;
```

## Semantic colors

```css
--success: #12b76a;
--warning: #f79009;
--error: #d92d20;
--info: #2e90fa;
```

Do not use brand colors as semantic-status substitutes.

## Typography

### Primary

**Geist**

```css
font-family:
  'Geist',
  'Inter',
  -apple-system,
  BlinkMacSystemFont,
  'Segoe UI',
  sans-serif;
```

### Monospace

**Geist Mono**

Use for code, technical metadata, IDs, and API examples.

## Type scale

```text
Display       64px / 650–700 / 1.05
H1            48px / 650–700 / 1.10
H2            36px / 650 / 1.15
H3            28px / 600–650 / 1.20
H4            22px / 600 / 1.25
Body Large    18px / 400 / 1.55
Body          16px / 400 / 1.55
Small         14px / 400–500 / 1.45
Caption       12px / 500 / 1.35
```

Product UI:

```text
Page title     28px / 600
Section title  20px / 600
Body           15–16px / 400
Control        14px / 500
Caption        12–13px / 500
```

## Spacing

Use a 4px base grid:

```text
4   micro
8   compact
12  small
16  standard
20  control
24  card
32  section
40  large
48  layout
64  major section
80  page separation
96+ marketing
```

## Radius

```text
4px   tiny controls
6px   inputs / compact UI
8px   buttons
12px  cards
16px  larger panels
20px  hero/app icon containers
24px  major marketing surfaces
```

## Iconography

Use **Lucide** consistently.

Guidelines:

- 1.5–2px stroke
- rounded joins/caps
- minimal visual noise
- 16–20px controls
- 20–24px feature icons

## UI primitives

```text
Button
IconButton
Input
Textarea
Select
Combobox
Tabs
Dialog
Drawer
Popover
Tooltip
Dropdown
Card
Badge
Avatar
Toast
Alert
Table
Pagination
CommandPalette
EmptyState
Skeleton
```

## ArtXFlow-specific primitives

```text
PlatformIcon
PlatformBadge
DestinationCard
DistributionGraph
PublishStatus
ArticleCard
ArticleEditor
ArticlePreview
ContentBlock
PublishFlow
```

## Signature interaction pattern

```text
                         DEV.to
                            ↑
                            │
Medium ←────────────── ArtXFlow ──────────────→ Blog
                            │
                            ↓
                         Hashnode
```

The distribution graph is functional communication, not decoration.

## Buttons

Primary examples:

```text
Flow Everywhere
Publish
Connect Platform
Create Article
```

Primary buttons:

- 40–44px high
- 8–10px radius
- 500–600 weight
- strong contrast
- gradient only when it reinforces the brand

## Motion

Motion should communicate flow.

```text
Article
   ↓
Transform
   ↓
ArtXFlow
 ↙  ↓  ↘
Blog Dev Medium
```

Recommended:

```text
UI transitions       180–250ms
Meaningful motion    250–450ms
```

Respect `prefers-reduced-motion`.

## Responsive behavior

Breakpoints:

```text
sm   640px
md   768px
lg  1024px
xl  1280px
2xl 1536px
```

Mobile principles:

- content first
- publishing actions stay accessible
- sidebars become drawers/sheets
- compact destination selectors
- no horizontal overflow
- keep AXF mark visible when wordmark collapses

## Accessibility

Target **WCAG 2.2 AA**.

Requirements:

- keyboard navigation
- visible focus states
- semantic HTML
- adequate contrast
- screen-reader labels
- status not conveyed by color alone
- accessible touch targets
- reduced-motion support

## Voice

ArtXFlow should sound:

**Clear. Technical. Confident. Helpful.**

Good:

> Publish this article to 4 destinations.

> Your article is ready to flow.

Avoid:

> Blast your content everywhere instantly!!! 🚀

## Design principles

### One source, many destinations

Reinforce the core model throughout the product.

### Flow, not friction

Complex workflows should feel simple.

### Content first

The article is the primary object.

### Technical, not intimidating

Developer-grade capability with approachable UX.

### Restraint creates identity

The AXF mark, signature gradient, and motion are used selectively.

## Starter token block

```css
:root {
  --axf-blue: #0b87fe;
  --axf-cyan: #19d7fe;
  --axf-purple: #7a5cfd;
  --axf-ink: #142436;
  --axf-mist: #d0d9e5;

  --axf-gradient: linear-gradient(135deg, #0b87fe 0%, #19d7fe 45%, #7a5cfd 100%);

  --background: #ffffff;
  --background-subtle: #f7f9fc;
  --surface: #ffffff;

  --text-primary: #101828;
  --text-secondary: #667085;
  --text-tertiary: #98a2b3;

  --border-subtle: #e4e7ec;
  --border-default: #d0d5dd;

  --dark-background: #070b12;
  --dark-surface: #0d1420;
  --dark-surface-elevated: #111a28;

  --dark-text-primary: #f5f7fa;
  --dark-text-secondary: #aab5c4;

  --dark-border-subtle: #172333;
  --dark-border-default: #243447;

  --success: #12b76a;
  --warning: #f79009;
  --error: #d92d20;
  --info: #2e90fa;
}
```
