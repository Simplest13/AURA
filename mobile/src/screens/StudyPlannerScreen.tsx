import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { colors, radii } from "../theme/tokens";
import { Header } from "../components/Header";
import { TaskCard } from "../components/TaskCard";
import { AuraButton } from "../components/AuraButton";
import { useStudyStore } from "../stores/studyStore";
import { TaskPriority } from "../types/study";

export const StudyPlannerScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { tasks, addTask, toggleTask, deleteTask } = useStudyStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("Thermodynamics");
  const [deadline, setDeadline] = useState("Tomorrow, 5:00 PM");
  const [priority, setPriority] = useState<TaskPriority>("high");
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");

  const handleCreate = () => {
    if (!title.trim()) return;
    addTask(title.trim(), subject, deadline, priority);
    setTitle("");
    setShowAddForm(false);
  };

  const filteredTasks = tasks.filter((t) => {
    if (filter === "active") return !t.completed;
    if (filter === "completed") return t.completed;
    return true;
  });

  return (
    <View style={styles.container}>
      <Header
        title="Study Planner"
        subtitle="Manage Tasks, Deadlines & Priorities"
        showBack={true}
        onBack={() => navigation.goBack()}
        rightAction={
          <TouchableOpacity
            style={styles.addToggleBtn}
            onPress={() => setShowAddForm(!showAddForm)}
          >
            <Text style={styles.addToggleText}>{showAddForm ? "✕ Cancel" : "+ Add Task"}</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Add Task Form */}
        {showAddForm && (
          <View style={styles.addForm}>
            <Text style={styles.formTitle}>New Study Task</Text>

            <Text style={styles.inputLabel}>Task Title</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="e.g. Derive Carnot engine efficiency formula"
              placeholderTextColor={colors.text3}
            />

            <View style={styles.formRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Subject</Text>
                <TextInput
                  style={styles.input}
                  value={subject}
                  onChangeText={setSubject}
                  placeholder="e.g. Thermodynamics"
                  placeholderTextColor={colors.text3}
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Deadline</Text>
                <TextInput
                  style={styles.input}
                  value={deadline}
                  onChangeText={setDeadline}
                  placeholder="e.g. Friday, 4:00 PM"
                  placeholderTextColor={colors.text3}
                />
              </View>
            </View>

            <Text style={styles.inputLabel}>Priority</Text>
            <View style={styles.priorityRow}>
              {(["high", "medium", "low"] as TaskPriority[]).map((p) => {
                const isSelected = priority === p;
                return (
                  <TouchableOpacity
                    key={p}
                    style={[
                      styles.priorityOption,
                      isSelected && styles.priorityOptionSelected,
                    ]}
                    onPress={() => setPriority(p)}
                  >
                    <Text
                      style={[
                        styles.priorityOptionText,
                        isSelected && styles.priorityOptionTextSelected,
                      ]}
                    >
                      {p.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <AuraButton
              title="Save Study Task"
              onPress={handleCreate}
              variant="primary"
              style={{ marginTop: 8 }}
            />
          </View>
        )}

        {/* Filter Pills */}
        <View style={styles.filterRow}>
          {(["all", "active", "completed"] as const).map((f) => {
            const isSelected = filter === f;
            return (
              <TouchableOpacity
                key={f}
                style={[styles.filterPill, isSelected && styles.filterPillSelected]}
                onPress={() => setFilter(f)}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    isSelected && styles.filterPillTextSelected,
                  ]}
                >
                  {f.toUpperCase()} ({tasks.filter((t) => (f === "all" ? true : f === "active" ? !t.completed : t.completed)).length})
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Task List */}
        {filteredTasks.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No tasks found for this filter.</Text>
          </View>
        ) : (
          filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onToggle={() => toggleTask(task.id)}
              onDelete={() => deleteTask(task.id)}
            />
          ))
        )}

        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  addToggleBtn: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.accent,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.sm,
  },
  addToggleText: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: "600",
  },
  addForm: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.md,
    padding: 16,
    marginBottom: 20,
  },
  formTitle: {
    color: colors.text1,
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 12,
  },
  formRow: {
    flexDirection: "row",
    gap: 12,
  },
  inputLabel: {
    color: colors.text2,
    fontSize: 11,
    fontWeight: "600",
    marginBottom: 4,
  },
  input: {
    backgroundColor: colors.surface2,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.sm,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: colors.text1,
    fontSize: 13,
    marginBottom: 12,
  },
  priorityRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  priorityOption: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    backgroundColor: colors.surface2,
    borderRadius: radii.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  priorityOptionSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accentSoft,
  },
  priorityOptionText: {
    color: colors.text3,
    fontSize: 11,
    fontWeight: "700",
  },
  priorityOptionTextSelected: {
    color: colors.accent,
  },
  filterRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterPillSelected: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.accent,
  },
  filterPillText: {
    color: colors.text2,
    fontSize: 11,
    fontWeight: "600",
  },
  filterPillTextSelected: {
    color: colors.accent,
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: "center",
  },
  emptyText: {
    color: colors.text3,
    fontSize: 13,
  },
});
