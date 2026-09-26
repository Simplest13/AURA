import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { colors, radii } from "../theme/tokens";
import { AuraOrb } from "../components/AuraOrb";
import { AuraButton } from "../components/AuraButton";
import { useAuthStore } from "../stores/authStore";

const FOCUS_AREAS = [
  "Studying & Exams",
  "Engineering Projects",
  "Research Papers",
  "Daily Productive Routine",
];

export const OnboardingScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { updateUser } = useAuthStore();
  const [name, setName] = useState("Shivam");
  const [selectedFocus, setSelectedFocus] = useState(0);

  const handleContinue = () => {
    updateUser({ name });
    navigation.replace("MainTabs");
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.stepPills}>
        <View style={[styles.pill, styles.pillActive]} />
        <View style={styles.pill} />
        <View style={styles.pill} />
      </View>

      <AuraOrb state="idle" size={100} style={styles.orb} />

      <Text style={styles.title}>What should AURA call you?</Text>
      <Text style={styles.subtitle}>
        And what are you mainly here for — we'll tune your study and memory around it.
      </Text>

      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Your name"
        placeholderTextColor={colors.text3}
        autoCapitalize="words"
      />

      <Text style={styles.sectionLabel}>YOUR PRIMARY FOCUS</Text>
      <View style={styles.focusGrid}>
        {FOCUS_AREAS.map((item, idx) => {
          const isSelected = selectedFocus === idx;
          return (
            <TouchableOpacity
              key={item}
              activeOpacity={0.8}
              onPress={() => setSelectedFocus(idx)}
              style={[
                styles.focusCard,
                isSelected && styles.focusCardActive,
              ]}
            >
              <Text
                style={[
                  styles.focusText,
                  isSelected && styles.focusTextActive,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.buttonRow}>
        <AuraButton
          title="Skip"
          variant="ghost"
          onPress={handleContinue}
          style={styles.skipBtn}
        />
        <AuraButton
          title="Continue →"
          variant="primary"
          onPress={handleContinue}
          style={styles.continueBtn}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: colors.bg,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  stepPills: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 24,
  },
  pill: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
  },
  pillActive: {
    backgroundColor: colors.accent,
  },
  orb: {
    marginBottom: 20,
  },
  title: {
    color: colors.text1,
    fontSize: 24,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    color: colors.text2,
    fontSize: 13.5,
    textAlign: "center",
    maxWidth: 320,
    lineHeight: 19,
    marginBottom: 24,
  },
  input: {
    width: "100%",
    maxWidth: 280,
    backgroundColor: colors.surface2,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.sm,
    paddingVertical: 12,
    paddingHorizontal: 16,
    color: colors.text1,
    fontSize: 15,
    textAlign: "center",
    marginBottom: 24,
  },
  sectionLabel: {
    color: colors.text3,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 12,
  },
  focusGrid: {
    width: "100%",
    gap: 10,
    marginBottom: 32,
  },
  focusCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.md,
    padding: 14,
    alignItems: "center",
  },
  focusCardActive: {
    borderColor: colors.accent,
    backgroundColor: colors.accentSoft,
  },
  focusText: {
    color: colors.text2,
    fontSize: 14,
    fontWeight: "500",
  },
  focusTextActive: {
    color: colors.text1,
    fontWeight: "600",
  },
  buttonRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    width: "100%",
    maxWidth: 280,
  },
  skipBtn: {
    flex: 1,
  },
  continueBtn: {
    flex: 2,
  },
});
