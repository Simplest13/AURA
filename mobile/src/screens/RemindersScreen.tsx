/**
 * RemindersScreen — editorial task list.
 * Serif header line, mono section labels, circle checks, thin separators,
 * small accent markers for priority.
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
import { ReminderCard } from "../components/ReminderCard";
import { AuraButton } from "../components/AuraButton";
import { Icon } from "../components/Icon";
import { MonoLabel } from "../components/Typography";
import { useStudyStore } from "../stores/studyStore";

export const RemindersScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { contentMaxWidth, gutter } = useLayout();
  const { reminders, addReminder, toggleReminder, deleteReminder, backendOffline } = useStudyStore();
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState("");
  const [dueTime, setDueTime] = useState("");
  const [tag, setTag] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleCreate = async () => {
    if (!title.trim() || isSaving) return;
    setIsSaving(true);
    try {
      await addReminder(title.trim(), dueTime.trim() || "Soon", tag.trim() || "General");
      setTitle("");
      setDueTime("");
      setShowAdd(false);
    } finally {
      setIsSaving(false);
    }
  };

  const pending = reminders.filter((r) => !r.completed);
  const completed = reminders.filter((r) => r.completed);

  return (
    <View style={styles.container}>
      <View style={{ maxWidth: contentMaxWidth, width: "100%", alignSelf: "center" }}>
        <Header
          title="Reminders"
          subtitle={backendOffline ? "Saved on this device" : "Synced"}
          showBack={true}
          onBack={() => navigation.goBack()}
          showDeviceBadge={false}
          rightAction={
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => setShowAdd(!showAdd)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Icon name={showAdd ? "x" : "plus"} size={18} color={colors.ink} />
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
        {showAdd && (
          <View style={styles.form}>
            <MonoLabel color={colors.ink}>NEW REMINDER</MonoLabel>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Submit DBMS assignment"
              placeholderTextColor={colors.textDim}
            />
            <View style={styles.formRow}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                value={dueTime}
                onChangeText={setDueTime}
                placeholder="Tomorrow · 10:00"
                placeholderTextColor={colors.textDim}
              />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                value={tag}
                onChangeText={setTag}
                placeholder="Tag"
                placeholderTextColor={colors.textDim}
              />
            </View>
            <AuraButton
              title="Add reminder"
              onPress={() => void handleCreate()}
              variant="primary"
              loading={isSaving}
              disabled={!title.trim()}
            />
          </View>
        )}

        <MonoLabel color={colors.textDim}>SCHEDULED</MonoLabel>
        {pending.length === 0 && completed.length === 0 && (
          <Text style={styles.emptyNote}>Nothing scheduled yet.</Text>
        )}
        {pending.map((r) => (
          <ReminderCard
            key={r.id}
            reminder={r}
            onToggle={() => void toggleReminder(r.id)}
            onDelete={() => void deleteReminder(r.id)}
          />
        ))}

        {completed.length > 0 && (
          <>
            <MonoLabel color={colors.textDim} style={{ marginTop: s.xxl }}>
              COMPLETED
            </MonoLabel>
            {completed.map((r) => (
              <ReminderCard
                key={r.id}
                reminder={r}
                onToggle={() => void toggleReminder(r.id)}
                onDelete={() => void deleteReminder(r.id)}
              />
            ))}
          </>
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
  addBtn: {
    padding: 8,
    borderRadius: radii.sm,
  },
  form: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    padding: s.lg,
    marginBottom: s.xxl,
    backgroundColor: colors.surfaceElevated,
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
  emptyNote: {
    color: colors.textDim,
    fontSize: 14,
    paddingVertical: s.lg,
    fontStyle: "italic",
  },
});
