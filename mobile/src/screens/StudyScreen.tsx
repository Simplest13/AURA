/**
 * StudyScreen — notebook / productivity editorial.
 * Serif intro line, mono subject rows with oversized numerals, small color
 * markers, flat quick-access list.
 */

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../theme/colors";
import { spacing as s } from "../theme/spacing";
import { useLayout } from "../theme/responsive";
import { Icon, IconName } from "../components/Icon";
import { SerifText, MonoLabel } from "../components/Typography";
import { TaskCard } from "../components/TaskCard";
import { useStudyStore } from "../stores/studyStore";

export const StudyScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { contentMaxWidth, gutter } = useLayout();
  const { tasks, toggleTask, reminders, lectures, documents } = useStudyStore();

  const activeTasks = tasks.filter((t) => !t.completed).slice(0, 3);
  const completedCount = tasks.filter((t) => t.completed).length;

  const subjectMap = new Map<string, number>();
  tasks
    .filter((t) => !t.completed)
    .forEach((t) => {
      subjectMap.set(t.subjectName, (subjectMap.get(t.subjectName) ?? 0) + 1);
    });
  const subjects = Array.from(subjectMap.entries()).slice(0, 4);

  const subjectTints = [colors.coral, colors.blue, colors.olive, colors.yellow];

  const quickAccess: { title: string; sub: string; icon: IconName; target: string; count: string }[] = [
    { title: "Reminders", sub: "scheduled alerts", icon: "clock", target: "Reminders", count: String(reminders.filter((r) => !r.completed).length).padStart(2, "0") },
    { title: "Lectures", sub: "recordings & notes", icon: "mic", target: "Lectures", count: String(lectures.length).padStart(2, "0") },
    { title: "PDF notes", sub: "documents & Q&A", icon: "file-text", target: "Pdf", count: String(documents.length).padStart(2, "0") },
  ];

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingHorizontal: gutter,
            maxWidth: contentMaxWidth,
            width: "100%",
            alignSelf: "center",
            paddingBottom: 110 + insets.bottom,
          },
        ]}
      >
        <MonoLabel color={colors.ink}>STUDY</MonoLabel>

        <SerifText size={28} style={styles.intro}>
          {completedCount} of {tasks.length} done this week.
        </SerifText>

        {/* Subjects */}
        {subjects.length > 0 && (
          <View style={styles.section}>
            {subjects.map(([subject, count], idx) => (
              <TouchableOpacity
                key={subject}
                style={styles.subjectRow}
                onPress={() => navigation.navigate("StudyPlanner")}
              >
                <View style={[styles.subjectMarker, { backgroundColor: subjectTints[idx % subjectTints.length] }]} />
                <View style={{ flex: 1 }}>
                  <MonoLabel color={colors.ink}>{subject.toUpperCase()}</MonoLabel>
                  <Text style={styles.subjectCount}>
                    {String(count).padStart(2, "0")} open {count === 1 ? "task" : "tasks"}
                  </Text>
                </View>
                <Icon name="chevron-right" size={15} color={colors.textDim} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.rule} />

        {/* Quick access */}
        <View style={styles.section}>
          <MonoLabel color={colors.textDim}>QUICK ACCESS</MonoLabel>
          {quickAccess.map((item) => (
            <TouchableOpacity
              key={item.title}
              style={styles.quickRow}
              onPress={() => navigation.navigate(item.target)}
            >
              <Icon name={item.icon} size={17} color={colors.textMuted} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.quickTitle}>{item.title}</Text>
                <Text style={styles.quickSub}>{item.sub}</Text>
              </View>
              <Text style={styles.quickCount}>{item.count}</Text>
              <Icon name="chevron-right" size={14} color={colors.textDim} />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.rule} />

        {/* Open tasks */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <MonoLabel color={colors.textDim}>OPEN TASKS</MonoLabel>
            <TouchableOpacity onPress={() => navigation.navigate("StudyPlanner")}>
              <MonoLabel color={colors.blue}>ALL →</MonoLabel>
            </TouchableOpacity>
          </View>

          {activeTasks.length === 0 ? (
            <Text style={styles.emptyText}>Nothing open.</Text>
          ) : (
            activeTasks.map((t) => (
              <TaskCard key={t.id} task={t} onToggle={() => void toggleTask(t.id)} />
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingTop: s.xl,
  },
  intro: {
    marginTop: s.md,
    marginBottom: s.xxl,
    lineHeight: 36,
  },
  section: {
    marginBottom: s.sm,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: s.xs,
  },
  subjectRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  subjectMarker: {
    width: 8,
    height: 8,
    borderRadius: 1,
  },
  subjectCount: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 3,
  },
  rule: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: s.xxl,
  },
  quickRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  quickTitle: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: "500",
  },
  quickSub: {
    color: colors.textDim,
    fontSize: 12.5,
    marginTop: 1,
  },
  quickCount: {
    color: colors.textDim,
    fontSize: 22,
    fontWeight: "300",
    marginRight: 10,
    fontVariant: ["tabular-nums"],
  },
  emptyText: {
    color: colors.textDim,
    fontSize: 13.5,
    paddingVertical: 12,
  },
});
