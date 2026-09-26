import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from "react-native";
import { colors } from "../theme/colors";
import { radii } from "../theme/spacing";
import { shadows } from "../theme/shadows";

interface AuraButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const AuraButton: React.FC<AuraButtonProps> = ({
  title,
  onPress,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  icon,
  style,
  textStyle,
}) => {
  let btnBg = colors.primary;
  let btnBorder = "transparent";
  let textColor = "#FFFFFF";
  let glowStyle = shadows.glowPrimary;

  if (variant === "secondary") {
    btnBg = colors.surfaceElevated;
    btnBorder = colors.border;
    textColor = colors.text;
    glowStyle = {};
  } else if (variant === "outline") {
    btnBg = "transparent";
    btnBorder = colors.primary;
    textColor = colors.primary;
    glowStyle = {};
  } else if (variant === "ghost") {
    btnBg = "transparent";
    btnBorder = "transparent";
    textColor = colors.textMuted;
    glowStyle = {};
  } else if (variant === "danger") {
    btnBg = colors.error;
    btnBorder = "transparent";
    textColor = "#FFFFFF";
    glowStyle = {};
  }

  const padVertical = size === "sm" ? 8 : size === "lg" ? 15 : 11;
  const padHorizontal = size === "sm" ? 14 : size === "lg" ? 24 : 18;
  const fontSize = size === "sm" ? 12 : size === "lg" ? 16 : 14;

  return (
    <TouchableOpacity
      activeOpacity={0.82}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        variant === "primary" ? glowStyle : undefined,
        {
          backgroundColor: btnBg,
          borderColor: btnBorder,
          paddingVertical: padVertical,
          paddingHorizontal: padHorizontal,
          opacity: disabled ? 0.45 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={textColor} />
      ) : (
        <>
          {icon}
          <Text
            style={[
              styles.text,
              { color: textColor, fontSize, marginLeft: icon ? 8 : 0 },
              textStyle,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontWeight: "600",
    letterSpacing: 0.3,
  },
});
