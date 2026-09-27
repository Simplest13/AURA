/**
 * EmptyState — quiet, centered, no decoration.
 */

import React from "react";
import { View, Text, StyleSheet, ViewStyle } from "react-native";
import { colors } from "../theme/colors";
import { Icon, IconName } from "./Icon";
import { AuraButton } from "./AuraButton";

interface EmptyStateProps {
  title: string;
  description: string;
  actionTitle?: string;
  onAction?: () => void;
  icon?: IconName;
  style?: ViewStyle;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionTitle,
  onAction,
  icon = "circle",
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <Icon name={icon} size={22} color={colors.textDim} style={{ marginBottom: 12 }} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {actionTitle && onAction && (
        <AuraButton
          title={actionTitle}
          onPress={onAction}
          variant="secondary"
          size="sm"
          style={styles.actionBtn}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 40,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 6,
    textAlign: "center",
  },
  description: {
    color: colors.textDim,
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
