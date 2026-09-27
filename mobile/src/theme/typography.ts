/**
 * AURA Design Tokens — Typography
 *
 * Serif = expression. Sans = usability.
 * - `display` sizes + `serif` family: editorial headlines, hero moments
 * - `mono`: technical micro-labels (device IDs, firmware, timestamps)
 * - everything else: clean humanist sans (system / Inter)
 */

import { TextStyle } from "react-native";

// Editorial serif stack — loads via expo-font when available; falls back to
// Georgia (elegant, universally installed) so the identity holds everywhere.
export const serifFamily =
  Platform.select({
    web: "Georgia, 'Times New Roman', serif",
    default: "Georgia",
  }) as string;

// Technical micro-label face
export const monoFamily =
  Platform.select({
    ios: "Menlo",
    android: "monospace",
    web: "'Courier New', monospace",
    default: "monospace",
  }) as string;

import { Platform } from "react-native";

export const typography = {
  families: {
    serif: serifFamily,
    sans: undefined as TextStyle["fontFamily"], // system default
    mono: monoFamily,
  },

  sizes: {
    micro: 10,
    xs: 11,
    sm: 13,
    base: 15,
    md: 17,
    lg: 20,
    xl: 26,
    xxl: 32,
    display: 40,
    hero: 52,
  },

  lineHeights: {
    micro: 13,
    xs: 15,
    sm: 18,
    base: 22,
    md: 24,
    lg: 26,
    xl: 32,
    xxl: 38,
    display: 46,
    hero: 58,
  },

  weights: {
    regular: "400" as TextStyle["fontWeight"],
    medium: "500" as TextStyle["fontWeight"],
    semibold: "600" as TextStyle["fontWeight"],
    bold: "700" as TextStyle["fontWeight"],
  },

  // Editorial letter-spacing: large type tightens, micro-labels open up
  tracking: {
    tight: -0.5,
    normal: 0,
    label: 1.2, // small uppercase technical labels
  },
};

export type Typography = typeof typography;
