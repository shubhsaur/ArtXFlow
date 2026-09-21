/**
 * ArtXFlow Design System Tokens
 * Source of truth: docs/design/design-system.md
 * System is strictly obsidian dark mode.
 */

export const brandColors = {
  blue: '#0B87FE',
  cyan: '#19D7FE',
  purple: '#7A5CFD',
  ink: '#142436',
  mist: '#D0D9E5',
} as const;

export const darkPalette = {
  background: '#070B12',
  backgroundSubtle: '#0B111B',
  surface: '#0f141b',
  surfaceBase: '#070B12',
  surfaceRaised: '#0D1420',
  surfaceOverlay: '#111A28',
  surfaceElevated: '#131E2F',
  surfaceGlass: 'rgba(13, 20, 32, 0.82)',
  border: '#243447',
  borderDefault: '#243447',
  borderSubtle: '#172333',
  borderHighlight: 'rgba(11, 98, 245, 0.35)',
  textPrimary: '#F5F7FA',
  textSecondary: '#AAB5C4',
  textTertiary: '#718096',
  textMuted: '#66768D',
  primary: '#0B62F5',
  secondary: '#F59E0B',
  secondaryContainerDeep: '#451A03',
  secondaryForegroundBright: '#FBBF24',
  flowCyan: '#19D7FE',
  statusSuccess: '#12B76A',
  statusWarning: '#F59E0B',
  statusError: '#D92D20',
  statusInfo: '#0B62F5',
  glowPrimary: 'rgba(11, 98, 245, 0.28)',
  glowAccent: 'rgba(25, 215, 254, 0.25)',
  glowAmber: 'rgba(245, 158, 11, 0.22)',
  gridLine: 'rgba(255, 255, 255, 0.05)',
} as const;

export const gradients = {
  brand: 'linear-gradient(135deg, #00D2FF 0%, #0B62F5 50%, #A855F7 100%)',
  flow: 'linear-gradient(90deg, #0B87FE 0%, #19D7FE 100%)',
  accent: 'linear-gradient(135deg, #19D7FE 0%, #7A5CFD 100%)',
  glow: 'radial-gradient(ellipse at top, rgba(11, 98, 245, 0.18), transparent 70%)',
} as const;

export const radii = {
  none: '0',
  sm: '4px',
  md: '6px',
  lg: '8px',
  xl: '12px',
  '2xl': '16px',
  full: '9999px',
} as const;

export const typography = {
  fontSans: "'Geist', 'Figtree', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  fontMono: "'JetBrains Mono', 'Geist Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
} as const;

export const shadows = {
  sm: '0 1px 2px 0 rgba(16, 24, 40, 0.05)',
  md: '0 4px 6px -1px rgba(16, 24, 40, 0.1), 0 2px 4px -2px rgba(16, 24, 40, 0.05)',
  lg: '0 10px 15px -3px rgba(16, 24, 40, 0.1), 0 4px 6px -4px rgba(16, 24, 40, 0.05)',
  brandGlow: '0 0 32px -4px rgba(11, 98, 245, 0.28)',
  cardDark: '0 8px 32px 0 rgba(0, 0, 0, 0.36)',
} as const;

/**
 * CSS custom properties representation for application styling.
 */
export const cssVariables = `
:root, [data-theme="dark"] {
  --axf-blue: ${brandColors.blue};
  --axf-cyan: ${brandColors.cyan};
  --axf-purple: ${brandColors.purple};
  --axf-ink: ${brandColors.ink};
  --axf-mist: ${brandColors.mist};

  /* Default to Dark Mode tokens matching ArtXFlow Design System */
  --bg-primary: ${darkPalette.surfaceBase};
  --background: ${darkPalette.surfaceBase};
  --surface-base: ${darkPalette.surfaceBase};
  --surface-raised: ${darkPalette.surfaceRaised};
  --surface-overlay: ${darkPalette.surfaceOverlay};
  --surface: ${darkPalette.surface};
  --surface-elevated: ${darkPalette.surfaceElevated};
  --surface-glass: ${darkPalette.surfaceGlass};
  --border: ${darkPalette.border};
  --border-default: ${darkPalette.borderDefault};
  --border-subtle: ${darkPalette.borderSubtle};
  --border-highlight: ${darkPalette.borderHighlight};
  --text-primary: ${darkPalette.textPrimary};
  --text-secondary: ${darkPalette.textSecondary};
  --text-tertiary: ${darkPalette.textTertiary};
  --text-muted: ${darkPalette.textMuted};
  --primary: ${darkPalette.primary};
  --secondary: ${darkPalette.secondary};
  --secondary-container-deep: ${darkPalette.secondaryContainerDeep};
  --secondary-foreground-bright: ${darkPalette.secondaryForegroundBright};
  --flow-cyan: ${darkPalette.flowCyan};
  --status-success: ${darkPalette.statusSuccess};
  --status-warning: ${darkPalette.statusWarning};
  --status-error: ${darkPalette.statusError};
  --status-info: ${darkPalette.statusInfo};
  --glow-primary: ${darkPalette.glowPrimary};
  --glow-accent: ${darkPalette.glowAccent};
  --glow-amber: ${darkPalette.glowAmber};
  --grid-line: ${darkPalette.gridLine};

  --axf-gradient: ${gradients.brand};
  --radius-sm: ${radii.sm};
  --radius-md: ${radii.md};
  --radius-lg: ${radii.lg};
  --radius-xl: ${radii.xl};
  --radius-2xl: ${radii['2xl']};
  --radius-full: ${radii.full};
}
`;
