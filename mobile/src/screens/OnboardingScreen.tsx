import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { colors } from "../theme/colors";
import { spacing as s, radii } from "../theme/spacing";
import { SerifText, MonoLabel } from "../components/Typography";
import { useAuthStore } from "../stores/authStore";

const FOCUS_AREAS = [
  "Studying & exams",
  "Engineering projects",
  "Research papers",
  "Daily routine",
];

export const OnboardingScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { updateUser } = useAuthStore();
  const [name, setName] = useState("");
  const [selectedFocus, setSelectedFocus] = useState(0);

  const handleContinue = () => {
    updateUser({ name: name.trim() || "Student" });
    navigation.replace("MainTabs");
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <MonoLabel color={colors.textDim}>WELCOME</MonoLabel>

      <SerifText size={30} style={styles.title}>
        What should AURA{"\n"}
        <SerifText size={30} italic>
          call you?
        </SerifText>
      </SerifText>

      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Your name"
        placeholderTextColor={colors.textDim}
        autoCapitalize="words"
      />

      <MonoLabel color={colors.textDim} style={{ marginBottom: s.md }}>
        WHAT ARE YOU HERE FOR?
      </MonoLabel>
      <View style={styles.focusGrid}>
        {FOCUS_AREAS.map((item, idx) => {
          const isSelected = selectedFocus === idx;
          return (
            <TouchableOpacity
              key={item}
              activeOpacity={0.8}
              onPress={() => setSelectedFocus(idx)}
              style={[styles.focusCard, isSelected && styles.focusCardActive]}
            >
              <View style={[styles.focusMarker, { backgroundColor: isSelected ? colors.coral : colors.border }]} />
              <Text style={[styles.focusText, isSelected && styles.focusTextActive]}>
                {item}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity
        style={styles.continueBtn}
        onPress={handleContinue}
        activeOpacity={0.85}
      >
        <MonoLabel color={colors.paper}>CONTINUE</MonoLabel>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: colors.background,
    justifyContent: "center",
    paddingHorizontal: s.xxl,
    paddingVertical: s.huge,
  },
  title: {
    marginTop: s.md,
    marginBottom: s.xxl,
    lineHeight: 38,
    letterSpacing: -0.5,
  },
  input: {
    backgroundColor: "transparent",
    borderColor: colors.borderLight,
    borderBottomWidth: 1,
    borderRadius: 0,
    paddingVertical: 10,
    paddingHorizontal: 0,
    color: colors.ink,
    fontSize: 17,
    marginBottom: s.xxl,
  },
  focusGrid: {
    width: "100%",
    gap: 8,
    marginBottom: s.xxl,
  },
  focusCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.sm,
    padding: 14,
  },
  focusCardActive: {
    borderColor: colors.borderLight,
    backgroundColor: colors.surface,
  },
  focusMarker: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  focusText: {
    color: colors.textMuted,
    fontSize: 14.5,
    fontWeight: "500",
  },
  focusTextActive: {
    color: colors.ink,
  },
  continueBtn: {
    width: "100%",
    backgroundColor: colors.ink,
    borderRadius: radii.sm,
    paddingVertical: 15,
    alignItems: "center",
  },
});
