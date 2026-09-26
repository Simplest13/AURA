import React from "react";
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from "react-native";
import { colors, radii, shadows } from "../theme/tokens";

interface GlowButtonProps {
  title: string;
  onPress: () => void;
  icon?: React.ReactNode;
  glowColor?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
}

export const GlowButton: React.FC<GlowButtonProps> = ({
  title,
  onPress,
  icon,
  glowColor = colors.accent,
  style,
  textStyle,
  disabled = false,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.glowButton,
        shadows.glow,
        {
          borderColor: glowColor,
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}
    >
      {icon}
      <Text style={[styles.text, { marginLeft: icon ? 8 : 0 }, textStyle]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  glowButton: {
    backgroundColor: colors.accent,
    borderRadius: radii.md,
    borderWidth: 1.5,
    paddingVertical: 14,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    color: colors.accentContrast,
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
});
