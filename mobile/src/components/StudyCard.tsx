/**
 * StudyCard — quiet navigation row with Feather icon and count.
 */

import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from "react-native";
import { colors } from "../theme/colors";
import { Icon, IconName } from "./Icon";

interface StudyCardProps {
  title: string;
  subtitle: string;
  icon: IconName;
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
    <TouchableOpacity activeOpacity={0.8} onPress={onPress} style={[styles.row, style]}>
      <Icon name={icon} size={18} color={colors.textMuted} />

      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {subtitle}
        </Text>
      </View>

      {badge ? <Text style={styles.badge}>{badge}</Text> : null}
      <Icon name="chevron-right" size={16} color={colors.textDim} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  content: {
    flex: 1,
  },
  title: {
    color: colors.text,
    fontSize: 14.5,
    fontWeight: "500",
  },
  subtitle: {
    color: colors.textDim,
    fontSize: 12.5,
    marginTop: 1,
  },
  badge: {
    color: colors.textDim,
    fontSize: 12,
  },
});
