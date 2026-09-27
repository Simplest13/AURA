/**
 * Surface — the editorial container.
 * Flat paper or white, hairline border, restrained radius. `flat` variant
 * removes radius entirely for rule-aligned editorial blocks.
 */

import React from "react";
import { View, StyleSheet, ViewProps, ViewStyle, StyleProp } from "react-native";
import { colors } from "../theme/colors";
import { radii } from "../theme/spacing";

interface SurfaceProps extends ViewProps {
  children: React.ReactNode;
  variant?:
    | "surface"
    | "raised"
    | "tinted"
    | "bordered"
    | "accent"
    | "flat"
    | "glass"
    | "surfaceElevated";
  glow?: boolean; // ignored — kept for call-site compatibility
  style?: StyleProp<ViewStyle>;
}

export const Surface: React.FC<SurfaceProps> = ({
  children,
  variant = "surface",
  glow,
  style,
  ...props
}) => {
  let backgroundColor = colors.surface;
  let borderColor = colors.border;
  let borderRadius: number = radii.card;

  if (variant === "raised" || variant === "surfaceElevated" || variant === "glass") {
    backgroundColor = colors.surfaceElevated;
  } else if (variant === "tinted") {
    backgroundColor = colors.surface;
  } else if (variant === "bordered") {
    backgroundColor = "transparent";
  } else if (variant === "accent") {
    backgroundColor = colors.accentSoft;
  } else if (variant === "flat") {
    backgroundColor = "transparent";
    borderColor = colors.border;
    borderRadius = radii.none;
  }

  return (
    <View
      style={[
        styles.base,
        { backgroundColor, borderColor, borderRadius },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
};

// Compile-compatibility alias for the legacy name
export const Card = Surface;

const styles = StyleSheet.create({
  base: {
    borderWidth: 1,
    padding: 16,
  },
});
