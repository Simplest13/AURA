import React from "react";
import { View, Text, StyleSheet, ViewStyle } from "react-native";
import { colors, radii } from "../theme/tokens";
import { AuraButton } from "./AuraButton";

interface EmptyStateProps {
  title: string;
  description: string;
  actionTitle?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionTitle,
  onAction,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.ringAvatar}>
        <View style={styles.ringCore} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {actionTitle && onAction && (
        <AuraButton
          title={actionTitle}
          onPress={onAction}
          variant="primary"
          size="sm"
          style={styles.actionBtn}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.md,
    padding: 28,
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
  },
  ringAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface2,
    borderColor: colors.accent,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  ringCore: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.accent,
  },
  title: {
    color: colors.text1,
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 6,
    textAlign: "center",
  },
  description: {
    color: colors.text2,
    fontSize: 13,
    lineHeight: 18,
    textAlign: "center",
    maxWidth: 280,
    marginBottom: 16,
  },
  actionBtn: {
    paddingHorizontal: 20,
  },
});
