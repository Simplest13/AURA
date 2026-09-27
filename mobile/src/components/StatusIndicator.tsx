/**
 * StatusIndicator — small factual dot + label. No pill background.
 */

import React from "react";
import { View, Text, StyleSheet, ViewStyle } from "react-native";
import { colors } from "../theme/colors";

interface StatusIndicatorProps {
  label: string;
  status?: "success" | "warning" | "error" | "accent";
  style?: ViewStyle;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  label,
  status = "success",
  style,
}) => {
  let dotColor = colors.success;
  if (status === "warning") dotColor = colors.warning;
  else if (status === "error") dotColor = colors.error;
  else if (status === "accent") dotColor = colors.accent;

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.dot, { backgroundColor: dotColor }]} />
      <Text style={styles.label}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  label: {
    color: colors.textMuted,
    fontSize: 11.5,
  },
});
