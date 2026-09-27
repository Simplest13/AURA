/**
 * RegisterScreen — editorial account creation with full client-side validation.
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
import { spacing as s, radii } from "../theme/spacing";
import { SerifText, MonoLabel } from "../components/Typography";
import { useAuth } from "../hooks/useAuth";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const RegisterScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register } = useAuth();

  const handleRegister = async () => {
    setError(null);

    if (!fullName.trim() || fullName.trim().length < 2) {
      setError("Please enter your name.");
      return;
    }
    if (!email.trim() || !EMAIL_RE.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      await register(fullName.trim(), email.trim(), password);
      navigation.replace("MainTabs");
    } catch (err: any) {
      const network =
        err?.code === "NETWORK_ERROR" ||
        err?.code === "TIMEOUT" ||
        err?.message === "Network request failed";
      setError(
        network
          ? "Can't reach the AURA backend. Start it with `cd backend && npm start`, then try again."
          : err?.message ?? "Registration failed. Please try again."
      );
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
        <MonoLabel color={colors.ink}>AURA</MonoLabel>

        <SerifText size={34} style={styles.headline}>
          Create your{"\n"}
          <SerifText size={34} italic>
            account.
          </SerifText>
        </SerifText>

        {error && <Text style={styles.errorBanner}>{error}</Text>}

        <MonoLabel color={colors.textDim} style={styles.fieldLabel}>
          NAME
        </MonoLabel>
        <TextInput
          style={styles.input}
          value={fullName}
          onChangeText={setFullName}
          placeholder="Your name"
          placeholderTextColor={colors.textDim}
          autoCapitalize="words"
        />

        <MonoLabel color={colors.textDim} style={styles.fieldLabel}>
          EMAIL
        </MonoLabel>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="you@university.edu"
          placeholderTextColor={colors.textDim}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <MonoLabel color={colors.textDim} style={styles.fieldLabel}>
          PASSWORD
        </MonoLabel>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="At least 8 characters"
          placeholderTextColor={colors.textDim}
          secureTextEntry
        />

        <MonoLabel color={colors.textDim} style={styles.fieldLabel}>
          CONFIRM PASSWORD
        </MonoLabel>
        <TextInput
          style={styles.input}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Repeat your password"
          placeholderTextColor={colors.textDim}
          secureTextEntry
        />

        <TouchableOpacity
          style={[styles.primaryBtn, isLoading && styles.btnDisabled]}
          onPress={() => void handleRegister()}
          disabled={isLoading}
          activeOpacity={0.85}
        >
          <MonoLabel color={colors.paper}>
            {isLoading ? "CREATING ACCOUNT…" : "CREATE ACCOUNT"}
          </MonoLabel>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.navigate("Login")}
          style={styles.switchAuthBtn}
        >
          <Text style={styles.switchAuthText}>
            Already have an account? <Text style={styles.switchAuthHighlight}>Sign in</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: colors.background,
    justifyContent: "center",
    padding: s.xxl,
  },
  headline: {
    marginTop: s.lg,
    marginBottom: s.huge,
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  errorBanner: {
    color: colors.error,
    backgroundColor: colors.errorSoft,
    borderColor: colors.error,
    borderWidth: 1,
    borderRadius: radii.sm,
    padding: 10,
    fontSize: 12.5,
    marginBottom: s.md,
  },
  fieldLabel: {
    marginBottom: 6,
  },
  input: {
    backgroundColor: "transparent",
    borderColor: colors.borderLight,
    borderBottomWidth: 1,
    borderWidth: 0,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderRadius: 0,
    paddingVertical: 10,
    paddingHorizontal: 0,
    color: colors.ink,
    fontSize: 16,
    marginBottom: s.lg,
  },
  primaryBtn: {
    backgroundColor: colors.ink,
    borderRadius: radii.sm,
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
    marginTop: s.md,
  },
  btnDisabled: {
    opacity: 0.45,
  },
  switchAuthBtn: {
    alignItems: "center",
    paddingVertical: s.xl,
  },
  switchAuthText: {
    color: colors.textDim,
    fontSize: 13.5,
  },
  switchAuthHighlight: {
    color: colors.ink,
    fontWeight: "600",
  },
});
