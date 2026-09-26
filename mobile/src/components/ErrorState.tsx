import React from "react";
import { View, Text, StyleSheet, ViewStyle } from "react-native";
import { colors, radii } from "../theme/tokens";
import { AuraButton } from "./AuraButton";

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  style?: ViewStyle;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = "Something went wrong",
  message,
  onRetry,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.icon}>⚠</Text>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
        {onRetry && (
          <AuraButton
            title="Retry"
            size="sm"
            variant="secondary"
            onPress={onRetry}
            style={styles.retryBtn}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderColor: colors.error,
    borderWidth: 1,
    borderRadius: radii.md,
    padding: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  icon: {
    fontSize: 20,
    color: colors.error,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: colors.text1,
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  message: {
    color: colors.text2,
    fontSize: 12.5,
    lineHeight: 18,
    marginBottom: 10,
  },
  retryBtn: {
    alignSelf: "flex-start",
  },
});
