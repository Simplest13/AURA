import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from "react-native";
import { colors, radii } from "../theme/tokens";
import { Header } from "../components/Header";
import { GlassCard } from "../components/GlassCard";
import { AuraButton } from "../components/AuraButton";
import { useAuthStore } from "../stores/authStore";
import { useMemoryStore } from "../stores/memoryStore";

export const ProfileScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user, logout } = useAuthStore();
  const { memories, deleteMemory } = useMemoryStore();

  const [memoryEnabled, setMemoryEnabled] = useState(true);
  const [selectedModel, setSelectedModel] = useState("Claude 3.5 Sonnet");

  const handleLogout = () => {
    logout();
    navigation.replace("Login");
  };

  return (
    <View style={styles.container}>
      <Header
        title="Profile & Settings"
        subtitle="Second Brain Preferences"
        onDeviceBadgePress={() => navigation.navigate("Device")}
      />

      <ScrollView contentContainerStyle={styles.content}>
        {/* User Card */}
        <GlassCard style={styles.userCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarLetter}>
              {user?.name ? user.name[0].toUpperCase() : "S"}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.userName}>{user?.name || "Shivam"}</Text>
            <Text style={styles.userEmail}>{user?.email || "shivam@alignsoul.co"}</Text>
            <View style={styles.planBadge}>
              <Text style={styles.planText}>Student Free Tier</Text>
            </View>
          </View>
        </GlassCard>

        {/* Device Settings Shortcut */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.navigate("Device")}
          style={styles.menuRow}
        >
          <View style={styles.menuIcon}>
            <Text>⊚</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.menuTitle}>Wearable Hardware Manager</Text>
            <Text style={styles.menuSubtitle}>BLE connection, battery, button triggers</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>

        {/* Long-Term Memory Toggle */}
        <View style={styles.menuRow}>
          <View style={styles.menuIcon}>
            <Text>✺</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.menuTitle}>Long-Term Conversational Memory</Text>
            <Text style={styles.menuSubtitle}>
              Let AURA extract and retain study facts
            </Text>
          </View>
          <Switch
            value={memoryEnabled}
            onValueChange={setMemoryEnabled}
            thumbColor={colors.accent}
            trackColor={{ false: colors.surface2, true: colors.accentSoft }}
          />
        </View>

        {/* AI Model Selection */}
        <Text style={styles.sectionTitle}>AI REASONING PROVIDER</Text>
        <GlassCard style={styles.modelCard} variant="surface2">
          {["Claude 3.5 Sonnet", "Whisper + Claude + ElevenLabs", "Mock AI (Deterministic Demo)"].map(
            (model) => {
              const isSelected = selectedModel === model;
              return (
                <TouchableOpacity
                  key={model}
                  style={[styles.modelOption, isSelected && styles.modelOptionSelected]}
                  onPress={() => setSelectedModel(model)}
                >
                  <View style={styles.modelRadio}>
                    {isSelected && <View style={styles.modelRadioInner} />}
                  </View>
                  <Text style={[styles.modelName, isSelected && styles.modelNameSelected]}>
                    {model}
                  </Text>
                </TouchableOpacity>
              );
            }
          )}
        </GlassCard>

        {/* Memories List */}
        <Text style={styles.sectionTitle}>
          STORED MEMORIES ({memories.length})
        </Text>
        {memories.map((m) => (
          <View key={m.id} style={styles.memoryItem}>
            <View style={styles.memDot} />
            <View style={{ flex: 1 }}>
              <Text style={styles.memContent}>{m.content}</Text>
              <View style={styles.memTagsRow}>
                {m.tags.map((t) => (
                  <View key={t} style={styles.memTag}>
                    <Text style={styles.memTagText}>{t}</Text>
                  </View>
                ))}
                <Text style={styles.memImportance}>
                  Priority: {m.importance.toUpperCase()}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => deleteMemory(m.id)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.memDelete}>✕</Text>
            </TouchableOpacity>
          </View>
        ))}

        {/* Logout */}
        <AuraButton
          title="Sign Out"
          variant="danger"
          size="md"
          onPress={handleLogout}
          style={{ marginTop: 20, marginBottom: 20 }}
        />

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
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 16,
    marginBottom: 16,
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.accentSoft,
    borderWidth: 1.5,
    borderColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarLetter: {
    color: colors.accent,
    fontSize: 22,
    fontWeight: "700",
  },
  userName: {
    color: colors.text1,
    fontSize: 17,
    fontWeight: "600",
  },
  userEmail: {
    color: colors.text3,
    fontSize: 12.5,
    marginTop: 2,
  },
  planBadge: {
    alignSelf: "flex-start",
    backgroundColor: colors.surface2,
    borderColor: colors.border,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radii.full,
    marginTop: 6,
  },
  planText: {
    color: colors.accent,
    fontSize: 10,
    fontWeight: "600",
  },
  menuRow: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.md,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  menuIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surface2,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  menuTitle: {
    color: colors.text1,
    fontSize: 13.5,
    fontWeight: "600",
  },
  menuSubtitle: {
    color: colors.text3,
    fontSize: 11,
    marginTop: 2,
  },
  chevron: {
    color: colors.text3,
    fontSize: 20,
    marginLeft: 8,
  },
  sectionTitle: {
    color: colors.text3,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    marginTop: 10,
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  modelCard: {
    padding: 12,
    marginBottom: 16,
  },
  modelOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: radii.sm,
  },
  modelOptionSelected: {
    backgroundColor: colors.surfaceHover,
  },
  modelRadio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  modelRadioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
  },
  modelName: {
    color: colors.text2,
    fontSize: 13,
  },
  modelNameSelected: {
    color: colors.text1,
    fontWeight: "600",
  },
  memoryItem: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.md,
    padding: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  memDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.glow,
    marginTop: 5,
    marginRight: 10,
  },
  memContent: {
    color: colors.text1,
    fontSize: 13,
    lineHeight: 18,
  },
  memTagsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 6,
  },
  memTag: {
    backgroundColor: colors.surface2,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radii.xs,
  },
  memTagText: {
    color: colors.text3,
    fontSize: 10,
  },
  memImportance: {
    color: colors.warning,
    fontSize: 10,
    fontWeight: "600",
  },
  memDelete: {
    color: colors.text3,
    fontSize: 13,
    padding: 4,
    marginLeft: 6,
  },
});
