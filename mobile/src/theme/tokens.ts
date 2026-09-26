/**
 * AURA Design System Tokens
 * Backwards compatible adapter and token re-export
 */

import { colors as newColors } from "./colors";
import { spacing as newSpacing, radii as newRadii } from "./spacing";
import { shadows as newShadows } from "./shadows";
import { typography as newTypography } from "./typography";

export const colors = {
  ...newColors,
  // Backward compatibility keys
  bg: newColors.background,
  bgElevated: newColors.surfaceElevated,
  surface: newColors.surface,
  surface2: newColors.surfaceElevated,
  surfaceHover: newColors.surfaceHover,
  border: newColors.border,
  borderSoft: newColors.borderLight,
  text1: newColors.text,
  text2: newColors.textMuted,
  text3: newColors.textDim,
  accent: newColors.primary,
  accent2: newColors.secondary,
  accentSoft: newColors.primaryGlow,
  accentContrast: newColors.background,
  glow: newColors.coral,
  glowSoft: newColors.coralGlow,
  glowRgba: newColors.primaryGlow,
  coralRgba: newColors.coralGlow,
  cyanSoft: newColors.cyanGlow,
  overlay: newColors.overlay,
};

export const radii = newRadii;
export const spacing = newSpacing;
export const shadows = newShadows;
export const typography = newTypography;

export default { colors, radii, spacing, shadows, typography };
