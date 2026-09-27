/**
 * HomeScreen — editorial canvas.
 * Serif greeting, technical micro-labels, oversized numerals for Today,
 * thin rules instead of cards, paper texture underneath.
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
import { AuraOrb } from "../components/AuraOrb";
import { PaperTexture } from "../components/PaperTexture";
import { SerifText, MonoLabel } from "../components/Typography";
import { Icon } from "../components/Icon";
import { useAuthStore } from "../stores/authStore";
import { useChatStore } from "../stores/chatStore";
import { useStudyStore } from "../stores/studyStore";
import { useVoiceStore } from "../stores/voiceStore";
import { useDeviceStore } from "../stores/deviceStore";
import { ConnectionState } from "../types/device";

export const HomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { gutter, contentMaxWidth } = useLayout();
  const { user } = useAuthStore();
  const { conversations, setActiveConversation } = useChatStore();
  const { tasks, reminders, lectures } = useStudyStore();
  const { state: voiceState } = useVoiceStore();
  const { connectionState, batteryLevel } = useDeviceStore();

  const pendingReminders = reminders.filter((r) => !r.completed).length;
  const openTasks = tasks.filter((t) => !t.completed).length;
  const isConnected = connectionState === ConnectionState.CONNECTED;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning,";
    if (hour < 17) return "Good afternoon,";
    return "Good evening,";
  };

  const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const handleOpenConversation = (id: string) => {
    setActiveConversation(id);
    navigation.navigate("Chat");
  };

  const recentConvs = conversations.slice(0, 3);

  const todayItems = [
    { count: pendingReminders, label: pendingReminders === 1 ? "reminder" : "reminders", target: "Reminders", tint: colors.coral },
    { count: lectures.length, label: lectures.length === 1 ? "lecture" : "lectures", target: "Lectures", tint: colors.blue },
    { count: openTasks, label: openTasks === 1 ? "task" : "tasks", target: "StudyPlanner", tint: colors.olive },
  ];

  return (
    <View style={styles.screen}>
      <PaperTexture mode="overlay" />

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
        {/* Masthead */}
        <View style={styles.mastheadRow}>
          <MonoLabel color={colors.ink}>AURA</MonoLabel>
          <MonoLabel>{now}</MonoLabel>
        </View>

        {/* Greeting — serif, oversized */}
        <View style={styles.greetingBlock}>
          <SerifText size={34} style={styles.greeting}>
            {getGreeting()}
          </SerifText>
          <SerifText size={34} italic style={styles.greetingName}>
            {user?.name || "Student"}
          </SerifText>
          <Text style={styles.subGreeting}>Your day, at a glance.</Text>
        </View>

        {/* Device line */}
        <View style={styles.deviceRow}>
          <View
            style={[
              styles.deviceDot,
              { backgroundColor: isConnected ? colors.olive : colors.yellow },
            ]}
          />
          <MonoLabel>
            {isConnected ? `AURA ONE · CONNECTED · ${batteryLevel}%` : "AURA ONE · OFFLINE"}
          </MonoLabel>
          <TouchableOpacity
            onPress={() => navigation.navigate("Device")}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={{ marginLeft: "auto" }}
          >
            <Icon name="chevron-right" size={15} color={colors.textDim} />
          </TouchableOpacity>
        </View>

        {/* Rule */}
        <View style={styles.rule} />

        {/* Voice section */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => navigation.navigate("Voice")}
          style={styles.voiceSection}
        >
          <AuraOrb state={voiceState === "idle" ? "idle" : voiceState} size={84} />
          <Text style={styles.readyText}>Ready when you are</Text>
          <MonoLabel color={colors.ink}>TAP TO TALK</MonoLabel>
        </TouchableOpacity>

        <View style={styles.rule} />

        {/* Today — oversized numerals */}
        <View style={styles.section}>
          <MonoLabel color={colors.textDim}>TODAY</MonoLabel>
          {todayItems.map((item) => (
            <TouchableOpacity
              key={item.label}
              style={styles.todayRow}
              onPress={() => navigation.navigate(item.target)}
            >
              <Text style={[styles.todayNumeral, { color: colors.ink }]}>
                {String(item.count).padStart(2, "0")}
              </Text>
              <Text style={styles.todayLabel}>{item.label}</Text>
              <View style={[styles.todayMarker, { backgroundColor: item.tint }]} />
              <Icon name="chevron-right" size={14} color={colors.textDim} />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.rule} />

        {/* Recent */}
        <View style={styles.section}>
          <MonoLabel color={colors.textDim}>RECENT</MonoLabel>
          {recentConvs.length === 0 ? (
            <Text style={styles.emptyText}>Nothing yet. Start a conversation.</Text>
          ) : (
            recentConvs.map((conv) => (
              <TouchableOpacity
                key={conv.id}
                style={styles.convRow}
                onPress={() => handleOpenConversation(conv.id)}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.convTitle} numberOfLines={1}>
                    {conv.title}
                  </Text>
                  <Text style={styles.convMeta}>
                    {new Date(conv.updatedAt).toLocaleDateString([], {
                      month: "short",
                      day: "numeric",
                    })}{" "}
                    ·{" "}
                    {new Date(conv.updatedAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                </View>
                <Icon name="chevron-right" size={14} color={colors.textDim} />
              </TouchableOpacity>
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
  mastheadRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: s.huge,
  },
  greetingBlock: {
    marginBottom: s.lg,
  },
  greeting: {
    letterSpacing: -0.5,
  },
  greetingName: {
    letterSpacing: -0.5,
  },
  subGreeting: {
    color: colors.textMuted,
    fontSize: 14,
    marginTop: 8,
  },
  deviceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginTop: s.xl,
  },
  deviceDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  rule: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: s.xxl,
  },
  voiceSection: {
    alignItems: "center",
    gap: 12,
    paddingVertical: s.md,
  },
  readyText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "500",
  },
  section: {
    marginBottom: s.sm,
  },
  todayRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  todayNumeral: {
    fontSize: 26,
    fontWeight: "300",
    letterSpacing: -0.5,
    minWidth: 44,
    fontVariant: ["tabular-nums"],
  },
  todayLabel: {
    color: colors.text,
    fontSize: 15,
    flex: 1,
  },
  todayMarker: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 8,
  },
  convRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  convTitle: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: "500",
  },
  convMeta: {
    color: colors.textDim,
    fontSize: 12,
    marginTop: 2,
  },
  emptyText: {
    color: colors.textDim,
    fontSize: 13.5,
    paddingVertical: 12,
  },
});
