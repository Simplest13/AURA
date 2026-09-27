/**
 * AURA Design Tokens — Spacing & Radii
 * Editorial rhythm: generous whitespace, 4-pt scale, restrained radii.
 * Some editorial containers intentionally use zero radius.
 */

export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 44,
  vast: 64,
};

export const radii = {
  none: 0, // editorial rules / flat containers
  xs: 4,
  sm: 8, // buttons, inputs
  md: 10,
  card: 12, // cards
  sheet: 16, // sheets / modals
  full: 9999, // the orb + true circles only
};

export type Spacing = typeof spacing;
export type Radii = typeof radii;
