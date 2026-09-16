# ArtXFlow — Design System Implementation

## Sources of truth

Visual rules:

```text
docs/design/design-system.md
```

Identity guidelines:

```text
ArtXFlow AXF logo
Brand gradient
Geist typography
```

## Packages

```text
packages/design-system/
packages/ui/
```

## Design-system owns

```text
colors
semantic colors
typography
spacing
radius
shadows
motion
breakpoints
themes
```

Use CSS variables for shared runtime tokens.

## Core brand tokens

```css
--axf-blue: #0b87fe;
--axf-cyan: #19d7fe;
--axf-purple: #7a5cfd;
--axf-ink: #142436;
--axf-mist: #d0d9e5;
```

## Signature gradient

```css
linear-gradient(
  135deg,
  #0B87FE 0%,
  #19D7FE 45%,
  #7A5CFD 100%
)
```

Use selectively.

## Typography

```text
Geist
Geist Mono
```

## Generic components

```text
Button
IconButton
Input
Textarea
Select
Combobox
Checkbox
Switch
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
Skeleton
EmptyState
CommandPalette
```

## ArtXFlow-specific components

```text
PlatformIcon
PlatformBadge
DestinationCard
DistributionGraph
PublishStatus
ArticleCard
ArticleEditorShell
ArticlePreview
PublishFlow
```

## Component rules

Every shared component should have:

- predictable API
- keyboard behavior
- visible focus
- documented variants
- semantic HTML
- no business logic

## Motion

Centralize motion tokens and use motion to communicate flow/state.

Respect `prefers-reduced-motion`.

## Accessibility

Target WCAG 2.2 AA.

## Testing

Shared UI should have behavior/accessibility tests. Add isolated visual development tooling such as Storybook once the component set stabilizes.

## Brand asset

The selected AXF mark is canonical. Do not create different redraws for different surfaces.
