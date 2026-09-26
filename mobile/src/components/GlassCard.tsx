import React from "react";
import { View, StyleSheet, ViewProps, ViewStyle, StyleProp } from "react-native";
import { colors } from "../theme/colors";
import { radii } from "../theme/spacing";
import { shadows } from "../theme/shadows";

interface GlassCardProps extends ViewProps {
  children: React.ReactNode;
  variant?: "surface" | "surface2" | "surfaceElevated" | "accent" | "bordered";
  glow?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  variant = "surface",
  glow = false,
  style,
  ...props
}) => {
  let backgroundColor = colors.surface;
  let borderColor = colors.border;

  if (variant === "surface2" || variant === "surfaceElevated") {
    backgroundColor = colors.surfaceElevated;
    borderColor = colors.borderLight;
  } else if (variant === "accent") {
    backgroundColor = colors.primaryGlow;
    borderColor = colors.primary;
  } else if (variant === "bordered") {
    backgroundColor = "transparent";
    borderColor = colors.border;
  }

  return (
    <View
      style={[
        styles.card,
        { backgroundColor, borderColor },
        glow ? styles.glowEffect : shadows.sm,
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.md,
    borderWidth: 1,
    padding: 16,
  },
  glowEffect: {
    ...shadows.glowPrimary,
    borderColor: colors.primary,
  },
});
