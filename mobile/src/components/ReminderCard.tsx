import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from "react-native";
import { colors, radii } from "../theme/tokens";
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
    <View style={[styles.card, style]}>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onToggle}
        style={[
          styles.circleToggle,
          reminder.completed && styles.circleChecked,
        ]}
      >
        {reminder.completed && <Text style={styles.checkIcon}>✓</Text>}
      </TouchableOpacity>

      <View style={styles.content}>
        <Text
          style={[
            styles.title,
            reminder.completed && styles.titleCompleted,
          ]}
          numberOfLines={1}
        >
          {reminder.title}
        </Text>
        <Text style={styles.dueTime}>{reminder.dueTime}</Text>
      </View>

      {reminder.tag && (
        <View style={styles.tag}>
          <Text style={styles.tagText}>{reminder.tag}</Text>
        </View>
      )}

      {onDelete && (
        <TouchableOpacity
          onPress={onDelete}
          style={styles.deleteBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.deleteText}>✕</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.md,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  circleToggle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    backgroundColor: colors.surface2,
  },
  circleChecked: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  checkIcon: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },
  content: {
    flex: 1,
  },
  title: {
    color: colors.text1,
    fontSize: 13.5,
    fontWeight: "500",
  },
  titleCompleted: {
    textDecorationLine: "line-through",
    color: colors.text3,
  },
  dueTime: {
    color: colors.text3,
    fontSize: 11,
    marginTop: 2,
  },
  tag: {
    backgroundColor: colors.surface2,
    borderRadius: radii.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    marginRight: 8,
  },
  tagText: {
    color: colors.text2,
    fontSize: 10.5,
    fontWeight: "500",
  },
  deleteBtn: {
    padding: 4,
  },
  deleteText: {
    color: colors.text3,
    fontSize: 13,
  },
});
