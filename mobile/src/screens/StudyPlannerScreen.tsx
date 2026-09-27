/**
 * StudyPlannerScreen — task CRUD on the editorial canvas.
 */

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../theme/colors";
import { spacing as s, radii } from "../theme/spacing";
import { useLayout } from "../theme/responsive";
import { Header } from "../components/Header";
import { TaskCard } from "../components/TaskCard";
import { AuraButton } from "../components/AuraButton";
import { Icon } from "../components/Icon";
import { MonoLabel } from "../components/Typography";
import { useStudyStore } from "../stores/studyStore";
import { TaskPriority } from "../types/study";

export const StudyPlannerScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { contentMaxWidth, gutter } = useLayout();
  const { tasks, addTask, toggleTask, deleteTask, isSyncing, backendOffline } = useStudyStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [deadline, setDeadline] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  const [isSaving, setIsSaving] = useState(false);

  const handleCreate = async () => {
    if (!title.trim() || isSaving) return;
    setIsSaving(true);
    try {
      await addTask(
        title.trim(),
        subject.trim() || "General",
        deadline.trim() || "No deadline",
        priority
      );
      setTitle("");
      setSubject("");
      setDeadline("");
      setShowAddForm(false);
    } finally {
      setIsSaving(false);
    }
  };

  const filteredTasks = tasks.filter((t) => {
    if (filter === "active") return !t.completed;
    if (filter === "completed") return t.completed;
    return true;
  });

  return (
    <View style={styles.container}>
      <View style={{ maxWidth: contentMaxWidth, width: "100%", alignSelf: "center" }}>
        <Header
          title="Planner"
          subtitle={backendOffline ? "Offline — changes stay local" : "Synced"}
          showBack={true}
          onBack={() => navigation.goBack()}
          showDeviceBadge={false}
          rightAction={
            <TouchableOpacity
              style={styles.addToggleBtn}
              onPress={() => setShowAddForm(!showAddForm)}
            >
              <Icon name={showAddForm ? "x" : "plus"} size={15} color={colors.ink} />
              <Text style={styles.addToggleText}>{showAddForm ? "Cancel" : "Task"}</Text>
            </TouchableOpacity>
          }
        />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingHorizontal: gutter,
            maxWidth: contentMaxWidth,
            width: "100%",
            alignSelf: "center",
            paddingBottom: 60 + insets.bottom,
          },
        ]}
      >
        {showAddForm && (
          <View style={styles.addForm}>
            <MonoLabel color={colors.ink}>NEW TASK</MonoLabel>

            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Review entropy derivations"
              placeholderTextColor={colors.textDim}
            />

            <View style={styles.formRow}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                value={subject}
                onChangeText={setSubject}
                placeholder="Subject"
                placeholderTextColor={colors.textDim}
              />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                value={deadline}
                onChangeText={setDeadline}
                placeholder="Friday · 16:00"
                placeholderTextColor={colors.textDim}
              />
            </View>

            <View style={styles.priorityRow}>
              {(["low", "medium", "high"] as TaskPriority[]).map((p) => {
                const isSelected = priority === p;
                return (
                  <TouchableOpacity
                    key={p}
                    style={[styles.priorityOption, isSelected && styles.priorityOptionSelected]}
                    onPress={() => setPriority(p)}
                  >
                    <Text
                      style={[
                        styles.priorityOptionText,
                        isSelected && styles.priorityOptionTextSelected,
                      ]}
                    >
                      {p[0].toUpperCase() + p.slice(1)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <AuraButton
              title={isSyncing ? "Saving…" : "Save task"}
              onPress={() => void handleCreate()}
              variant="primary"
              loading={isSaving}
              disabled={!title.trim()}
              style={{ marginTop: s.md }}
            />
          </View>
        )}

        {/* Filters */}
        <View style={styles.filterRow}>
          {(["all", "active", "completed"] as const).map((f) => {
            const isSelected = filter === f;
            const count = tasks.filter((t) =>
              f === "all" ? true : f === "active" ? !t.completed : t.completed
            ).length;
            return (
              <TouchableOpacity
                key={f}
                style={[styles.filterPill, isSelected && styles.filterPillSelected]}
                onPress={() => setFilter(f)}
              >
                <MonoLabel color={isSelected ? colors.ink : colors.textDim}>
                  {f.toUpperCase()} {String(count).padStart(2, "0")}
                </MonoLabel>
              </TouchableOpacity>
            );
          })}
        </View>

        {filteredTasks.length === 0 ? (
          <Text style={styles.emptyText}>Nothing here.</Text>
        ) : (
          filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onToggle={() => void toggleTask(task.id)}
              onDelete={() => void deleteTask(task.id)}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingTop: s.xl,
  },
  addToggleBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: colors.ink,
    borderRadius: radii.sm,
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor: colors.surfaceElevated,
  },
  addToggleText: {
    color: colors.ink,
    fontSize: 12.5,
    fontWeight: "600",
  },
  addForm: {
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.sm,
    padding: s.lg,
    marginBottom: s.xxl,
  },
  formRow: {
    flexDirection: "row",
    gap: s.sm,
  },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.sm,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.ink,
    fontSize: 14.5,
    marginBottom: s.sm,
    marginTop: s.md,
  },
  priorityRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: s.sm,
  },
  priorityOption: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  priorityOptionSelected: {
    borderColor: colors.ink,
    backgroundColor: colors.accentSoft,
  },
  priorityOptionText: {
    color: colors.textMuted,
    fontSize: 12.5,
    fontWeight: "500",
  },
  priorityOptionTextSelected: {
    color: colors.ink,
  },
  filterRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: s.md,
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radii.sm,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterPillSelected: {
    backgroundColor: colors.surface,
    borderColor: colors.borderLight,
  },
  emptyText: {
    color: colors.textDim,
    fontSize: 14,
    paddingVertical: s.xxl,
    textAlign: "center",
    fontStyle: "italic",
  },
});
