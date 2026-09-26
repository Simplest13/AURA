/**
 * AURA Design Tokens - Color Palette
 * Dark, futuristic, minimal, AI-focused.
 */

export const colors = {
  // Dark Backgrounds
  background: "#07070D",
  surface: "#0F101A",
  surfaceElevated: "#151625",
  surfaceHover: "#1D1E32",

  // Primary Brand & AI Identity
  primary: "#7C3AED",       // Radiant Violet
  primaryLight: "#9333EA",
  primaryGlow: "rgba(124, 58, 237, 0.35)",

  // Secondary Accents
  secondary: "#4F46E5",     // Deep Indigo
  secondaryGlow: "rgba(79, 70, 229, 0.35)",

  // Cyan touches
  cyan: "#22D3EE",          // Neon Cyan
  cyanGlow: "rgba(34, 211, 238, 0.35)",

  // Warm Glow (Listening / Wearable Alert)
  coral: "#FFAE85",
  coralGlow: "rgba(255, 174, 133, 0.45)",

  // Text Hierarchy
  text: "#F8FAFC",          // High-contrast primary text
  textMuted: "#94A3B8",     // Secondary text / hints
  textDim: "#64748B",       // Disabled / tertiary text

  // Borders & Dividers
  border: "#25263A",
  borderLight: "#333550",
  borderFocus: "#7C3AED",

  // Status & Feedback
  success: "#22C55E",
  successSoft: "rgba(34, 197, 94, 0.15)",
  warning: "#F59E0B",
  warningSoft: "rgba(245, 158, 11, 0.15)",
  error: "#EF4444",
  errorSoft: "rgba(239, 68, 68, 0.15)",

  // Overlays
  overlay: "rgba(7, 7, 13, 0.85)",
  cardOverlay: "rgba(15, 16, 26, 0.88)",
};

export type Colors = typeof colors;

