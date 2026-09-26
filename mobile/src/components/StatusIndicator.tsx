import React from "react";
import { View, Text, StyleSheet, ViewStyle } from "react-native";
import { colors, radii } from "../theme/tokens";

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
  let bgColor = colors.successSoft;

  if (status === "warning") {
    dotColor = colors.warning;
    bgColor = colors.warningSoft;
  } else if (status === "error") {
    dotColor = colors.error;
    bgColor = colors.errorSoft;
  } else if (status === "accent") {
    dotColor = colors.accent;
    bgColor = colors.accentSoft;
  }

  return (
    <View style={[styles.container, { backgroundColor: bgColor }, style]}>
      <View style={[styles.dot, { backgroundColor: dotColor }]} />
      <Text style={[styles.label, { color: dotColor }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.full,
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  label: {
    fontSize: 11,
    fontWeight: "600",
  },
});
