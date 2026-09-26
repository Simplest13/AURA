import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { colors, radii } from "../theme/tokens";
import { AuraOrb } from "../components/AuraOrb";
import { DeviceCard } from "../components/DeviceCard";
import { GlassCard } from "../components/GlassCard";
import { ConversationCard } from "../components/ConversationCard";
import { TaskCard } from "../components/TaskCard";
import { ReminderCard } from "../components/ReminderCard";
import { Header } from "../components/Header";
import { useAuthStore } from "../stores/authStore";
import { useChatStore } from "../stores/chatStore";
import { useStudyStore } from "../stores/studyStore";
import { useVoiceStore } from "../stores/voiceStore";

export const HomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user } = useAuthStore();
  const { conversations, setActiveConversation } = useChatStore();
  const { tasks, toggleTask, reminders, toggleReminder } = useStudyStore();
  const { state: voiceState } = useVoiceStore();

  const activeTasks = tasks.filter((t) => !t.completed).slice(0, 2);
  const recentConvs = conversations.slice(0, 2);
  const activeReminders = reminders.filter((r) => !r.completed).slice(0, 2);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const handleOpenConversation = (id: string) => {
    setActiveConversation(id);
    navigation.navigate("Chat");
  };

  return (
    <View style={styles.screenContainer}>
      <Header
        title="AURA"
        subtitle="Wearable AI Assistant"
        onDeviceBadgePress={() => navigation.navigate("Device")}
      />

      <ScrollView contentContainerStyle={styles.contentContainer}>
        {/* Greeting */}
        <View style={styles.greetingSection}>
          <Text style={styles.greetingTitle}>
            {getGreeting()}, {user?.name || "Shivam"}.
          </Text>
          <Text style={styles.greetingSubtitle}>
            Here's what's active across your second brain.
          </Text>
        </View>

        {/* Central AURA Orb & Quick Voice Trigger */}
        <GlassCard style={styles.orbCard}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => navigation.navigate("Voice")}
            style={styles.orbTouchArea}
          >
            <AuraOrb state={voiceState} size={130} />
            <View style={styles.orbTextContainer}>
              <Text style={styles.orbPrompt}>Tap to talk with AURA</Text>
              <Text style={styles.orbSubPrompt}>
                Or press the button on your wearable
              </Text>
            </View>
          </TouchableOpacity>
        </GlassCard>

        {/* Wearable Connection & Battery Card */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>WEARABLE STATUS</Text>
            <TouchableOpacity onPress={() => navigation.navigate("Device")}>
              <Text style={styles.seeAllText}>Manage</Text>
            </TouchableOpacity>
          </View>
          <DeviceCard
            onSimulatePress={() => navigation.navigate("Voice")}
            onManagePress={() => navigation.navigate("Device")}
          />
        </View>

        {/* Quick Tools Grid */}
        <View style={styles.toolsRow}>
          <TouchableOpacity
            style={styles.toolBtn}
            onPress={() => navigation.navigate("Voice")}
          >
            <Text style={styles.toolIcon}>◉</Text>
            <Text style={styles.toolLabel}>Voice Cockpit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.toolBtn}
            onPress={() => navigation.navigate("Chat")}
          >
            <Text style={styles.toolIcon}>💬</Text>
            <Text style={styles.toolLabel}>New Chat</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.toolBtn}
            onPress={() => navigation.navigate("Study", { screen: "StudyPlanner" })}
          >
            <Text style={styles.toolIcon}>📚</Text>
            <Text style={styles.toolLabel}>Planner</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.toolBtn}
            onPress={() => navigation.navigate("Study", { screen: "LectureRecorder" })}
          >
            <Text style={styles.toolIcon}>🎙</Text>
            <Text style={styles.toolLabel}>Lecture</Text>
          </TouchableOpacity>
        </View>

        {/* Today's Study Tasks */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>TODAY'S TASKS</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("Study", { screen: "StudyPlanner" })}
            >
              <Text style={styles.seeAllText}>View all ({tasks.length})</Text>
            </TouchableOpacity>
          </View>
          {activeTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onToggle={() => toggleTask(task.id)}
            />
          ))}
        </View>

        {/* Reminders */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>REMINDERS</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("Study", { screen: "Reminders" })}
            >
              <Text style={styles.seeAllText}>View all</Text>
            </TouchableOpacity>
          </View>
          {activeReminders.map((rem) => (
            <ReminderCard
              key={rem.id}
              reminder={rem}
              onToggle={() => toggleReminder(rem.id)}
            />
          ))}
        </View>

        {/* Recent Conversations */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>RECENT CHATS</Text>
            <TouchableOpacity onPress={() => navigation.navigate("Chat")}>
              <Text style={styles.seeAllText}>All chats</Text>
            </TouchableOpacity>
          </View>
          {recentConvs.map((conv) => (
            <ConversationCard
              key={conv.id}
              conversation={conv}
              onPress={() => handleOpenConversation(conv.id)}
              style={styles.convCard}
            />
          ))}
        </View>

        {/* Spacer for bottom tab bar */}
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
  greetingSection: {
    marginBottom: 16,
  },
  greetingTitle: {
    color: colors.text1,
    fontSize: 24,
    fontWeight: "600",
    letterSpacing: -0.3,
  },
  greetingSubtitle: {
    color: colors.text3,
    fontSize: 13,
    marginTop: 4,
  },
  orbCard: {
    alignItems: "center",
    paddingVertical: 22,
    marginBottom: 20,
    backgroundColor: colors.surface2,
  },
  orbTouchArea: {
    alignItems: "center",
  },
  orbTextContainer: {
    alignItems: "center",
    marginTop: 14,
  },
  orbPrompt: {
    color: colors.text1,
    fontSize: 15,
    fontWeight: "600",
  },
  orbSubPrompt: {
    color: colors.accent2,
    fontSize: 12,
    marginTop: 2,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    color: colors.text3,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
  },
  seeAllText: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: "600",
  },
  toolsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 20,
  },
  toolBtn: {
    flex: 1,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.sm,
    paddingVertical: 12,
    alignItems: "center",
  },
  toolIcon: {
    fontSize: 18,
    marginBottom: 4,
    color: colors.accent,
  },
  toolLabel: {
    color: colors.text2,
    fontSize: 11,
    fontWeight: "600",
  },
  convCard: {
    marginBottom: 8,
  },
});
