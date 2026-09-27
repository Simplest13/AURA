/**
 * AuraButton — editorial control.
 * Primary: solid ink, paper text. Secondary: hairline outline. Mono uppercase
 * label in small sizes gives the technical-product feel.
 */

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
import { monoFamily } from "../theme/typography";

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
  let btnBg = colors.ink;
  let btnBorder = colors.ink;
  let textColor = colors.paper;

  if (variant === "secondary") {
    btnBg = colors.surfaceElevated;
    btnBorder = colors.border;
    textColor = colors.ink;
  } else if (variant === "outline") {
    btnBg = "transparent";
    btnBorder = colors.ink;
    textColor = colors.ink;
  } else if (variant === "ghost") {
    btnBg = "transparent";
    btnBorder = "transparent";
    textColor = colors.textMuted;
  } else if (variant === "danger") {
    btnBg = colors.error;
    btnBorder = colors.error;
    textColor = colors.paper;
  }

  const padVertical = size === "sm" ? 7 : size === "lg" ? 14 : 11;
  const padHorizontal = size === "sm" ? 14 : size === "lg" ? 24 : 18;
  const fontSize = size === "sm" ? 11 : size === "lg" ? 13 : 12;
  const useMono = size !== "lg";

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        {
          backgroundColor: btnBg,
          borderColor: btnBorder,
          paddingVertical: padVertical,
          paddingHorizontal: padHorizontal,
          opacity: disabled ? 0.4 : 1,
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
              {
                color: textColor,
                fontSize,
                fontFamily: useMono ? monoFamily : undefined,
                marginLeft: icon ? 8 : 0,
              },
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
    borderRadius: radii.sm,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontWeight: "600",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
});
