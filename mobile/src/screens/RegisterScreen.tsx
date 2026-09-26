/**
 * RegisterScreen
 * Student onboarding registration flow into AURA.
 */

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { colors } from "../theme/colors";
import { radii } from "../theme/spacing";
import { AuraOrb } from "../components/AuraOrb";
import { AuraButton } from "../components/AuraButton";
import { useAuth } from "../hooks/useAuth";

export const RegisterScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register } = useAuth();

  const handleRegister = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Please provide an email and password.");
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      await register(fullName || "Shivam", email, password);
      navigation.replace("MainTabs");
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <AuraOrb state="idle" size={80} style={styles.orb} />
        <Text style={styles.brandTitle}>AURA</Text>
        <Text style={styles.tagline}>The AI Wearable for Engineering Students</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Create your account</Text>
          <Text style={styles.cardSubtitle}>
            Personalized memory, lecture summaries, and real-time AI voice.
          </Text>

          {error && <Text style={styles.errorBanner}>{error}</Text>}

          <Text style={styles.inputLabel}>Full name</Text>
          <TextInput
            style={styles.input}
            value={fullName}
            onChangeText={setFullName}
            placeholder="Shivam Patel"
            placeholderTextColor={colors.textDim}
          />

          <Text style={styles.inputLabel}>University Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="shivam@university.edu"
            placeholderTextColor={colors.textDim}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.inputLabel}>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Create password"
            placeholderTextColor={colors.textDim}
            secureTextEntry
          />

          <AuraButton
            title="Join AURA"
            onPress={handleRegister}
            loading={isLoading}
            variant="primary"
            style={styles.submitBtn}
          />

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate("Login")}
            style={styles.switchAuthBtn}
          >
            <Text style={styles.switchAuthText}>
              Already have an account? <Text style={styles.switchAuthHighlight}>Log in</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  orb: {
    marginBottom: 8,
  },
  brandTitle: {
    color: colors.text,
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: 4,
    marginBottom: 4,
  },
  tagline: {
    color: colors.textMuted,
    fontSize: 12.5,
    marginBottom: 24,
    textAlign: "center",
  },
  card: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.lg,
    padding: 24,
  },
  cardTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
  },
  cardSubtitle: {
    color: colors.textMuted,
    fontSize: 12.5,
    lineHeight: 18,
    marginBottom: 20,
  },
  errorBanner: {
    color: colors.error,
    backgroundColor: colors.errorSoft,
    borderColor: colors.error,
    borderWidth: 1,
    borderRadius: radii.sm,
    padding: 10,
    fontSize: 12,
    marginBottom: 14,
  },
  inputLabel: {
    color: colors.textMuted,
    fontSize: 11.5,
    fontWeight: "600",
    marginBottom: 6,
  },
  input: {
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.sm,
    paddingVertical: 10,
    paddingHorizontal: 14,
    color: colors.text,
    fontSize: 14,
    marginBottom: 14,
  },
  submitBtn: {
    marginTop: 8,
    marginBottom: 16,
  },
  switchAuthBtn: {
    alignItems: "center",
    paddingVertical: 4,
  },
  switchAuthText: {
    color: colors.textMuted,
    fontSize: 13,
  },
  switchAuthHighlight: {
    color: colors.primary,
    fontWeight: "600",
  },
});

