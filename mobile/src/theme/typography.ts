/**
 * AURA Design Tokens - Typography
 */

import { TextStyle } from "react-native";

export const typography = {
  // Sizes
  sizes: {
    xs: 11,
    sm: 13,
    base: 15,
    md: 17,
    lg: 20,
    xl: 24,
    xxl: 30,
    display: 38,
  },

  // Line Heights
  lineHeights: {
    xs: 14,
    sm: 18,
    base: 22,
    md: 24,
    lg: 28,
    xl: 32,
    xxl: 38,
    display: 46,
  },

  // Font Weights
  weights: {
    regular: "400" as TextStyle["fontWeight"],
    medium: "500" as TextStyle["fontWeight"],
    semibold: "600" as TextStyle["fontWeight"],
    bold: "700" as TextStyle["fontWeight"],
    heavy: "800" as TextStyle["fontWeight"],
  },
};

export type Typography = typeof typography;

