/**
 * ReminderRow — editorial list row with circle check.
 */

import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from "react-native";
import { colors } from "../theme/colors";
import { radii } from "../theme/spacing";
import { Icon } from "./Icon";
import { Reminder } from "../types/study";

interface ReminderCardProps {
  reminder: Reminder;
  onToggle: () => void;
  onDelete?: () => void;
  style?: ViewStyle;
}

export const ReminderCard: React.FC<ReminderCardProps> = ({
  reminder,
  onToggle,
  onDelete,
  style,
}) => {
  return (
    <View style={[styles.row, style]}>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onToggle}
        style={[styles.circle, reminder.completed && styles.circleChecked]}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        {reminder.completed && <Icon name="check" size={12} color={colors.paper} />}
      </TouchableOpacity>

      <View style={styles.content}>
        <Text
          style={[styles.title, reminder.completed && styles.titleCompleted]}
          numberOfLines={1}
        >
          {reminder.title}
        </Text>
        <Text style={styles.dueTime}>{reminder.dueTime}</Text>
      </View>

      {reminder.tag ? (
        <View style={styles.tag}>
          <Text style={styles.tagText}>{reminder.tag}</Text>
        </View>
      ) : null}

      {onDelete && (
        <TouchableOpacity
          onPress={onDelete}
          style={styles.deleteBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Icon name="x" size={14} color={colors.textDim} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
  },
  circle: {
    width: 19,
    height: 19,
    borderRadius: radii.full,
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
  },
  circleChecked: {
    backgroundColor: colors.olive,
    borderColor: colors.olive,
  },
  content: {
    flex: 1,
  },
  title: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: "500",
  },
  titleCompleted: {
    textDecorationLine: "line-through",
    color: colors.textDim,
  },
  dueTime: {
    color: colors.textDim,
    fontSize: 12.5,
    marginTop: 2,
  },
  tag: {
    backgroundColor: colors.surface,
    borderRadius: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tagText: {
    color: colors.textMuted,
    fontSize: 10.5,
  },
  deleteBtn: {
    padding: 4,
  },
});
