import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from "react-native";
import { colors, radii } from "../theme/tokens";

interface StudyCardProps {
  title: string;
  subtitle: string;
  icon: string;
  badge?: string;
  onPress: () => void;
  style?: ViewStyle;
}

export const StudyCard: React.FC<StudyCardProps> = ({
  title,
  subtitle,
  icon,
  badge,
  onPress,
  style,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[styles.card, style]}
    >
      <View style={styles.topRow}>
        <View style={styles.iconCircle}>
          <Text style={styles.iconText}>{icon}</Text>
        </View>
        {badge && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        )}
      </View>

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle} numberOfLines={2}>
        {subtitle}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: 16,
    flex: 1,
    minHeight: 120,
    justifyContent: "space-between",
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  iconText: {
    fontSize: 16,
  },
  badge: {
    backgroundColor: colors.accentSoft,
    borderRadius: radii.full,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  badgeText: {
    color: colors.accent,
    fontSize: 10,
    fontWeight: "600",
  },
  title: {
    color: colors.text1,
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  subtitle: {
    color: colors.text3,
    fontSize: 11.5,
    lineHeight: 16,
  },
});
