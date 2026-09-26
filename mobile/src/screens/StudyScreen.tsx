import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { colors, radii } from "../theme/tokens";
import { Header } from "../components/Header";
import { GlassCard } from "../components/GlassCard";
import { StudyCard } from "../components/StudyCard";
import { TaskCard } from "../components/TaskCard";
import { ReminderCard } from "../components/ReminderCard";
import { useStudyStore } from "../stores/studyStore";

export const StudyScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { tasks, toggleTask, reminders, toggleReminder, documents } = useStudyStore();

  const activeTasks = tasks.filter((t) => !t.completed).slice(0, 3);
  const completedCount = tasks.filter((t) => t.completed).length;
  const progressPercent = Math.round(
    tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0
  );

  return (
    <View style={styles.screenContainer}>
      <Header
        title="Study Cockpit"
        subtitle="AI Academic Suite & Knowledge Base"
        onDeviceBadgePress={() => navigation.navigate("Device")}
      />

      <ScrollView contentContainerStyle={styles.contentContainer}>
        {/* Progress Overview Card */}
        <GlassCard style={styles.progressCard} variant="surface2">
          <View style={styles.progressHeader}>
            <View>
              <Text style={styles.progressLabel}>WEEKLY PROGRESS</Text>
              <Text style={styles.progressTitle}>
                {completedCount} of {tasks.length} tasks completed
              </Text>
            </View>
            <View style={styles.progressCircle}>
              <Text style={styles.progressPercent}>{progressPercent}%</Text>
            </View>
          </View>

          <View style={styles.progressBarBg}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${Math.max(5, progressPercent)}%` },
              ]}
            />
          </View>
        </GlassCard>

        {/* 4 Study Modules Grid */}
        <Text style={styles.sectionHeader}>STUDY TOOLS</Text>
        <View style={styles.toolsGrid}>
          <View style={styles.toolsRow}>
            <StudyCard
              title="Study Planner"
              subtitle="Tasks, subjects, deadlines, and priorities"
              icon="📅"
              badge={`${tasks.length} tasks`}
              onPress={() => navigation.navigate("StudyPlanner")}
            />
            <StudyCard
              title="Reminders"
              subtitle="Timely academic alerts and schedule"
              icon="⏰"
              badge={`${reminders.filter((r) => !r.completed).length} due`}
              onPress={() => navigation.navigate("Reminders")}
            />
          </View>

          <View style={styles.toolsRow}>
            <StudyCard
              title="Lecture Recorder"
              subtitle="Record, transcribe & summarize live audio"
              icon="🎙"
              badge="Ready"
              onPress={() => navigation.navigate("LectureRecorder")}
            />
            <StudyCard
              title="PDF Summarizer"
              subtitle="Analyze documents, notes & generate Q&A"
              icon="📄"
              badge={`${documents.length} docs`}
              onPress={() => navigation.navigate("PdfSummarizer")}
            />
          </View>
        </View>

        {/* Priority Study Tasks */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionHeader}>PRIORITY TASKS</Text>
            <TouchableOpacity onPress={() => navigation.navigate("StudyPlanner")}>
              <Text style={styles.actionLink}>Manage Planner →</Text>
            </TouchableOpacity>
          </View>

          {activeTasks.map((t) => (
            <TaskCard key={t.id} task={t} onToggle={() => toggleTask(t.id)} />
          ))}
        </View>

        {/* Active Reminders */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionHeader}>UPCOMING REMINDERS</Text>
            <TouchableOpacity onPress={() => navigation.navigate("Reminders")}>
              <Text style={styles.actionLink}>View all →</Text>
            </TouchableOpacity>
          </View>

          {reminders.slice(0, 2).map((r) => (
            <ReminderCard key={r.id} reminder={r} onToggle={() => toggleReminder(r.id)} />
          ))}
        </View>

        {/* Pinned Documents */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionHeader}>PINNED KNOWLEDGE</Text>
            <TouchableOpacity onPress={() => navigation.navigate("PdfSummarizer")}>
              <Text style={styles.actionLink}>Upload file →</Text>
            </TouchableOpacity>
          </View>

          {documents.slice(0, 2).map((doc) => (
            <TouchableOpacity
              key={doc.id}
              activeOpacity={0.75}
              style={styles.docItem}
              onPress={() => navigation.navigate("PdfSummarizer")}
            >
              <View style={styles.docIcon}>
                <Text style={styles.docIconText}>PDF</Text>
              </View>
              <View style={styles.docDetails}>
                <Text style={styles.docName}>{doc.fileName}</Text>
                <Text style={styles.docMeta}>
                  {doc.totalPages} pages · {doc.fileSizeMb}MB · indexed
                </Text>
              </View>
              <View style={styles.readyBadge}>
                <Text style={styles.readyText}>● Ready</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  progressCard: {
    padding: 16,
    marginBottom: 20,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  progressLabel: {
    color: colors.text3,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
  },
  progressTitle: {
    color: colors.text1,
    fontSize: 15,
    fontWeight: "600",
    marginTop: 3,
  },
  progressCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  progressPercent: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: "700",
  },
  progressBarBg: {
    height: 6,
    backgroundColor: colors.surface,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: colors.accent,
    borderRadius: 3,
  },
  sectionHeader: {
    color: colors.text3,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  sectionTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  actionLink: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: "600",
  },
  toolsGrid: {
    gap: 10,
    marginBottom: 24,
  },
  toolsRow: {
    flexDirection: "row",
    gap: 10,
  },
  section: {
    marginBottom: 20,
  },
  docItem: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.md,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  docIcon: {
    width: 36,
    height: 36,
    borderRadius: radii.sm,
    backgroundColor: colors.surface2,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  docIconText: {
    color: colors.accent,
    fontSize: 10,
    fontWeight: "700",
  },
  docDetails: {
    flex: 1,
  },
  docName: {
    color: colors.text1,
    fontSize: 13.5,
    fontWeight: "600",
  },
  docMeta: {
    color: colors.text3,
    fontSize: 11,
    marginTop: 2,
  },
  readyBadge: {
    backgroundColor: colors.successSoft,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.full,
  },
  readyText: {
    color: colors.success,
    fontSize: 10.5,
    fontWeight: "600",
  },
});
