/**
 * ArtXFlow Design System Tokens
 * Source of truth: docs/design/design-system.md
 */

export const brandColors = {
  blue: '#0B87FE',
  cyan: '#19D7FE',
  purple: '#7A5CFD',
  ink: '#142436',
  mist: '#D0D9E5',
} as const;

export const lightPalette = {
  background: '#FFFFFF',
  backgroundSubtle: '#F7F9FC',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  textPrimary: '#101828',
  textSecondary: '#667085',
  textTertiary: '#98A2B3',
  borderSubtle: '#E4E7EC',
  borderDefault: '#D0D5DD',
} as const;

export const darkPalette = {
  background: '#070B12',
  backgroundSubtle: '#0B111B',
  surface: '#0D1420',
  surfaceElevated: '#131E2F',
  border: '#1C2A3A',
  borderSubtle: '#142232',
  textPrimary: '#F5F7FA',
  textSecondary: '#AAB5C4',
  textTertiary: '#718096',
} as const;

export const gradients = {
  brand: 'linear-gradient(135deg, #0B87FE 0%, #19D7FE 45%, #7A5CFD 100%)',
  flow: 'linear-gradient(90deg, #0B87FE 0%, #19D7FE 100%)',
  accent: 'linear-gradient(135deg, #19D7FE 0%, #7A5CFD 100%)',
} as const;

export const radii = {
  none: '0',
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  full: '9999px',
} as const;

export const typography = {
  fontSans: "'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  fontMono: "'Geist Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
} as const;

export const shadows = {
  sm: '0 1px 2px 0 rgba(16, 24, 40, 0.05)',
  md: '0 4px 6px -1px rgba(16, 24, 40, 0.1), 0 2px 4px -2px rgba(16, 24, 40, 0.05)',
  lg: '0 10px 15px -3px rgba(16, 24, 40, 0.1), 0 4px 6px -4px rgba(16, 24, 40, 0.05)',
  brandGlow: '0 0 20px rgba(11, 135, 254, 0.25)',
} as const;

/**
 * CSS custom properties representation for application styling.
 */
export const cssVariables = `
:root {
  --axf-blue: ${brandColors.blue};
  --axf-cyan: ${brandColors.cyan};
  --axf-purple: ${brandColors.purple};
  --axf-ink: ${brandColors.ink};
  --axf-mist: ${brandColors.mist};

  --background: ${darkPalette.background};
  --background-subtle: ${darkPalette.backgroundSubtle};
  --surface: ${darkPalette.surface};
  --surface-elevated: ${darkPalette.surfaceElevated};
  --border: ${darkPalette.border};
  --border-subtle: ${darkPalette.borderSubtle};
  --text-primary: ${darkPalette.textPrimary};
  --text-secondary: ${darkPalette.textSecondary};
  --text-tertiary: ${darkPalette.textTertiary};

  --axf-gradient: ${gradients.brand};
  --radius-sm: ${radii.sm};
  --radius-md: ${radii.md};
  --radius-lg: ${radii.lg};
  --radius-xl: ${radii.xl};
}
`;
