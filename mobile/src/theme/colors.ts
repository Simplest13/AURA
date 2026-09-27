/**
 * AURA Design Tokens — Color
 *
 * Editorial identity: warm paper canvas, ink typography, restrained accents.
 * LIGHT is the primary AURA experience. Dark is a secondary theme (warm
 * charcoal, off-white text, muted accents) sharing the same key names.
 *
 * Accent usage rule: ~75% paper neutrals, 15% ink, 7% secondary neutrals,
 * 3% accent. Accents mark state — they never fill screens.
 */

// ── Primary (light / editorial paper) ───────────────────────────────────────
export const lightColors = {
  background: "#F6F5F0", // warm paper
  paper: "#F6F5F0",
  white: "#FFFFFF",
  surface: "#F0EFE9",
  surfaceElevated: "#FFFFFF",
  surfaceHover: "#E9E8E1",

  ink: "#17151C",
  text: "#17151C",
  textMuted: "#66636B",
  textDim: "#8E8B94",

  border: "#D8D5CC",
  borderLight: "#C9C6BB",

  // Accents — small doses only
  coral: "#F28C88",
  pink: "#F3B8C1",
  olive: "#7C8465",
  sage: "#A8B49A",
  blue: "#7188B8",
  yellow: "#E4C66A",

  // Interactive / brand pointers
  accent: "#17151C", // solid ink buttons
  accentStrong: "#7188B8", // links, selected, focus
  accentSoft: "rgba(113, 136, 184, 0.10)",
  primary: "#17151C",
  primaryLight: "#3A3742",
  primaryGlow: "rgba(23, 21, 28, 0.06)",
  secondary: "#7C8465",
  secondaryGlow: "rgba(124, 132, 101, 0.14)",
  accentContrast: "#F6F5F0", // text on ink

  // Voice-state tones
  coralGlow: "rgba(242, 140, 136, 0.18)",
  cyan: "#7188B8",
  cyanGlow: "rgba(113, 136, 184, 0.16)",

  // Status
  success: "#7C8465",
  successSoft: "rgba(124, 132, 101, 0.14)",
  warning: "#A8863C",
  warningSoft: "rgba(228, 198, 106, 0.20)",
  error: "#C0605C",
  errorSoft: "rgba(242, 140, 136, 0.16)",

  overlay: "rgba(23, 21, 28, 0.45)",
  cardOverlay: "rgba(246, 245, 240, 0.92)",

  // Paper texture
  gridDot: "rgba(23, 21, 28, 0.07)",
};

// ── Secondary (warm charcoal dark) ──────────────────────────────────────────
export const darkColors = {
  background: "#161519",
  paper: "#161519",
  white: "#211F26",
  surface: "#1E1D22",
  surfaceElevated: "#26252B",
  surfaceHover: "#2E2D34",

  ink: "#F2F0EA",
  text: "#F2F0EA",
  textMuted: "#A8A5AD",
  textDim: "#7A7780",

  border: "#2E2C33",
  borderLight: "#3A3841",

  coral: "#E29692",
  pink: "#D9A9B1",
  olive: "#96A086",
  sage: "#A8B49A",
  blue: "#9FB2D6",
  yellow: "#E0C879",

  accent: "#F2F0EA",
  accentStrong: "#9FB2D6",
  accentSoft: "rgba(159, 178, 214, 0.12)",
  primary: "#F2F0EA",
  primaryLight: "#C9C6BB",
  primaryGlow: "rgba(242, 240, 234, 0.06)",
  secondary: "#96A086",
  secondaryGlow: "rgba(150, 160, 134, 0.14)",
  accentContrast: "#161519",

  coralGlow: "rgba(226, 150, 146, 0.16)",
  cyan: "#9FB2D6",
  cyanGlow: "rgba(159, 178, 214, 0.14)",

  success: "#96A086",
  successSoft: "rgba(150, 160, 134, 0.16)",
  warning: "#C9A75B",
  warningSoft: "rgba(224, 200, 121, 0.16)",
  error: "#D08581",
  errorSoft: "rgba(208, 133, 129, 0.16)",

  overlay: "rgba(0, 0, 0, 0.6)",
  cardOverlay: "rgba(22, 21, 25, 0.92)",

  gridDot: "rgba(242, 240, 234, 0.05)",
};

// The default experience is the editorial light theme
const palette = lightColors;

export const colors = {
  ...palette,

  // Backward-compatible aliases
  bg: palette.background,
  bgElevated: palette.surfaceElevated,
  surface2: palette.surfaceElevated,
  borderSoft: palette.border,
  borderFocus: palette.accentStrong,
  text1: palette.text,
  text2: palette.textMuted,
  text3: palette.textDim,
  accent2: palette.accentStrong,
  glow: palette.coral,
  glowSoft: palette.coralGlow,
  glowRgba: palette.primaryGlow,
  coralRgba: palette.coralGlow,
  cyanSoft: palette.cyanGlow,
};

export type Colors = typeof colors;
export { palette };
