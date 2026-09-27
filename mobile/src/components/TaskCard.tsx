/**
 * TaskRow — editorial list row with checkbox and accent priority marker.
 */

import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from "react-native";
import { colors } from "../theme/colors";
import { radii } from "../theme/spacing";
import { Icon } from "./Icon";
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
  const priorityTint =
    task.priority === "high" ? colors.coral : task.priority === "medium" ? colors.yellow : colors.sage;

  return (
    <View style={[styles.row, style]}>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onToggle}
        style={[styles.checkbox, task.completed && styles.checkboxChecked]}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        {task.completed && <Icon name="check" size={13} color={colors.paper} />}
      </TouchableOpacity>

      <View style={styles.details}>
        <Text
          style={[styles.title, task.completed && styles.titleCompleted]}
          numberOfLines={2}
        >
          {task.title}
        </Text>
        <View style={styles.metaRow}>
          <Text style={styles.subject}>{task.subjectName}</Text>
          <Text style={styles.metaDot}>·</Text>
          <Text style={styles.meta}>{task.deadline}</Text>
        </View>
      </View>

      {task.priority === "high" && !task.completed && (
        <View style={[styles.priorityMarker, { backgroundColor: priorityTint }]} />
      )}

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
    alignItems: "flex-start",
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: radii.xs,
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
    marginTop: 1,
  },
  checkboxChecked: {
    backgroundColor: colors.olive,
    borderColor: colors.olive,
  },
  details: {
    flex: 1,
  },
  title: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: "500",
    lineHeight: 20,
    marginBottom: 3,
  },
  titleCompleted: {
    textDecorationLine: "line-through",
    color: colors.textDim,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  subject: {
    color: colors.textMuted,
    fontSize: 12.5,
  },
  metaDot: {
    color: colors.textDim,
    fontSize: 12.5,
  },
  meta: {
    color: colors.textDim,
    fontSize: 12.5,
  },
  priorityMarker: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 7,
    marginRight: 8,
  },
  deleteBtn: {
    padding: 4,
    marginLeft: 4,
  },
});
