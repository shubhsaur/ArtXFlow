/**
 * @artxflow/design-system
 * Design tokens, colors, typography, and theme definitions.
 */

export * from './tokens';

// Backward compatibility shortcuts
import { brandColors, gradients } from './tokens';
export const colors = brandColors;
export const brandGradient = gradients.brand;
