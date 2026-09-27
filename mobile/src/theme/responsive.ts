/**
 * AURA Responsive Layout Helpers
 * Single source of truth for adaptive layout across phones, tablets and desktop web.
 */

import { useWindowDimensions } from "react-native";

export interface Layout {
  /** Window width in dp */
  width: number;
  /** Window height in dp */
  height: number;
  /** Compact phones (< 360dp) */
  isSmallPhone: boolean;
  /** Phones (< 768dp) */
  isPhone: boolean;
  /** Tablets / foldables (768 – 1024dp) */
  isTablet: boolean;
  /** Desktop / wide web (>= 1024dp) */
  isDesktop: boolean;
  /** Horizontal page gutter that scales with the viewport */
  gutter: number;
  /** Max width for readable content columns (chat, forms, lists) */
  contentMaxWidth: number;
  /** Max width for the centered bottom tab bar */
  tabBarMaxWidth: number;
  /** Number of columns a card grid should use at this width */
  gridColumns: number;
}

export function useLayout(): Layout {
  const { width, height } = useWindowDimensions();

  const isSmallPhone = width < 360;
  const isPhone = width < 768;
  const isTablet = width >= 768 && width < 1024;
  const isDesktop = width >= 1024;

  const gutter = isDesktop ? 32 : isSmallPhone ? 12 : 16;
  const contentMaxWidth = isDesktop ? 780 : isTablet ? 680 : width;
  const tabBarMaxWidth = isDesktop ? 520 : 480;
  const gridColumns = isDesktop ? 4 : isTablet ? 3 : 2;

  return {
    width,
    height,
    isSmallPhone,
    isPhone,
    isTablet,
    isDesktop,
    gutter,
    contentMaxWidth,
    tabBarMaxWidth,
    gridColumns,
  };
}
