/**
 * StatusBadge Component
 * Crisp, futuristic tag indicating status for BLE, Voice, or tasks.
 */

import React from "react";
import { View, Text, StyleSheet, ViewStyle } from "react-native";
import { colors } from "../theme/colors";
import { radii } from "../theme/spacing";

interface StatusBadgeProps {
  label: string;
  variant?: "success" | "warning" | "error" | "info" | "primary" | "neutral";
  dot?: boolean;
  style?: ViewStyle;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  label,
  variant = "neutral",
  dot = true,
  style,
}) => {
  let badgeBg = "rgba(100, 116, 139, 0.15)";
  let badgeBorder = colors.border;
  let textColor = colors.textMuted;
  let dotColor = colors.textDim;

  if (variant === "success") {
    badgeBg = colors.successSoft;
    badgeBorder = "rgba(34, 197, 94, 0.35)";
    textColor = colors.success;
    dotColor = colors.success;
  } else if (variant === "warning") {
    badgeBg = colors.warningSoft;
    badgeBorder = "rgba(245, 158, 11, 0.35)";
    textColor = colors.warning;
    dotColor = colors.warning;
  } else if (variant === "error") {
    badgeBg = colors.errorSoft;
    badgeBorder = "rgba(239, 68, 68, 0.35)";
    textColor = colors.error;
    dotColor = colors.error;
  } else if (variant === "primary") {
    badgeBg = colors.primaryGlow;
    badgeBorder = colors.primary;
    textColor = colors.primary;
    dotColor = colors.primary;
  } else if (variant === "info") {
    badgeBg = colors.cyanGlow;
    badgeBorder = "rgba(34, 211, 238, 0.35)";
    textColor = colors.cyan;
    dotColor = colors.cyan;
  }

  return (
    <View style={[styles.badge, { backgroundColor: badgeBg, borderColor: badgeBorder }, style]}>
      {dot && <View style={[styles.dot, { backgroundColor: dotColor }]} />}
      <Text style={[styles.text, { color: textColor }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.full,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  text: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
});

