/**
 * AURA Design Tokens — Shadows
 * Editorial design uses almost no elevation. Shadows exist only for genuinely
 * floating layers (modals). Everything else relies on borders and rules.
 */

import { ViewStyle } from "react-native";

export const shadows: Record<string, ViewStyle> = {
  sm: {}, // flat — borders carry hierarchy
  md: {},
  lg: {
    boxShadow: "0px 12px 32px 0px rgba(23, 21, 28, 0.14)",
  },
  // Kept for legacy call sites — intentionally flat now
  glowPrimary: {},
  glowCyan: {},
  glowCoral: {},
  glow: {},
};

export type Shadows = typeof shadows;
