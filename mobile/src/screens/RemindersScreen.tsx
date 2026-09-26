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
import { ReminderCard } from "../components/ReminderCard";
import { AuraButton } from "../components/AuraButton";
import { useStudyStore } from "../stores/studyStore";

export const RemindersScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { reminders, addReminder, toggleReminder, deleteReminder } = useStudyStore();
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState("");
  const [dueTime, setDueTime] = useState("Today, 8:00 PM");
  const [tag, setTag] = useState("Exam");

  const handleCreate = () => {
    if (!title.trim()) return;
    addReminder(title.trim(), dueTime, tag);
    setTitle("");
    setShowAdd(false);
  };

  return (
    <View style={styles.container}>
      <Header
        title="Reminders"
        subtitle="Notification-Ready Academic Alerts"
        showBack={true}
        onBack={() => navigation.goBack()}
        rightAction={
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => setShowAdd(!showAdd)}
          >
            <Text style={styles.addBtnText}>{showAdd ? "✕" : "+ New"}</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={styles.content}>
        {showAdd && (
          <View style={styles.formCard}>
            <Text style={styles.formHeading}>Create Reminder</Text>
            <Text style={styles.inputLabel}>What do you need to be reminded of?</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="e.g. Review cryptography notes before dinner"
              placeholderTextColor={colors.text3}
            />

            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Due Time</Text>
                <TextInput
                  style={styles.input}
                  value={dueTime}
                  onChangeText={setDueTime}
                  placeholder="e.g. Today, 9:00 PM"
                  placeholderTextColor={colors.text3}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Category / Tag</Text>
                <TextInput
                  style={styles.input}
                  value={tag}
                  onChangeText={setTag}
                  placeholder="e.g. Thesis / Exam"
                  placeholderTextColor={colors.text3}
                />
              </View>
            </View>

            <AuraButton
              title="Schedule Reminder"
              onPress={handleCreate}
              variant="primary"
            />
          </View>
        )}

        <Text style={styles.sectionTitle}>SCHEDULED REMINDERS</Text>
        {reminders.map((r) => (
          <ReminderCard
            key={r.id}
            reminder={r}
            onToggle={() => toggleReminder(r.id)}
            onDelete={() => deleteReminder(r.id)}
          />
        ))}

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
  addBtn: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.accent,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.sm,
  },
  addBtnText: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: "600",
  },
  formCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.md,
    padding: 16,
    marginBottom: 20,
  },
  formHeading: {
    color: colors.text1,
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 12,
  },
  row: {
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
  sectionTitle: {
    color: colors.text3,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 12,
  },
});
