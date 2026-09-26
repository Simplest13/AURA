import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from "react-native";
import { colors, radii } from "../theme/tokens";
import { StudyTask } from "../types/study";

interface TaskCardProps {
  task: StudyTask;
  onToggle: () => void;
  onDelete?: () => void;
  style?: ViewStyle;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onToggle,
  onDelete,
  style,
}) => {
  const getPriorityColor = () => {
    if (task.priority === "high") return colors.error;
    if (task.priority === "medium") return colors.warning;
    return colors.success;
  };

  return (
    <View style={[styles.card, style]}>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onToggle}
        style={[
          styles.checkbox,
          task.completed && styles.checkboxChecked,
        ]}
      >
        {task.completed && <Text style={styles.checkmark}>✓</Text>}
      </TouchableOpacity>

      <View style={styles.details}>
        <Text style={styles.subject}>{task.subjectName}</Text>
        <Text
          style={[
            styles.title,
            task.completed && styles.titleCompleted,
          ]}
          numberOfLines={2}
        >
          {task.title}
        </Text>
        <View style={styles.metaRow}>
          <Text style={styles.deadline}>🕒 {task.deadline}</Text>
          <View
            style={[
              styles.priorityBadge,
              { borderColor: getPriorityColor() },
            ]}
          >
            <Text style={[styles.priorityText, { color: getPriorityColor() }]}>
              {task.priority.toUpperCase()}
            </Text>
          </View>
        </View>
      </View>

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
    padding: 14,
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    marginTop: 2,
    backgroundColor: colors.surface2,
  },
  checkboxChecked: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  checkmark: {
    color: colors.accentContrast,
    fontSize: 13,
    fontWeight: "700",
  },
  details: {
    flex: 1,
  },
  subject: {
    color: colors.accent2,
    fontSize: 11,
    fontWeight: "600",
    marginBottom: 2,
  },
  title: {
    color: colors.text1,
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 18,
    marginBottom: 6,
  },
  titleCompleted: {
    textDecorationLine: "line-through",
    color: colors.text3,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  deadline: {
    color: colors.text3,
    fontSize: 11,
  },
  priorityBadge: {
    borderWidth: 1,
    borderRadius: radii.xs,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  priorityText: {
    fontSize: 9.5,
    fontWeight: "700",
  },
  deleteBtn: {
    padding: 4,
    marginLeft: 8,
  },
  deleteText: {
    color: colors.text3,
    fontSize: 13,
  },
});
