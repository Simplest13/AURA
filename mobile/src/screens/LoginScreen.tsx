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

/**
 * Login — premium editorial entry. Real JWT auth against the AURA backend.
 */
export const LoginScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [tab, setTab] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login, register } = useAuth();

  const handleSubmit = async () => {
    setError(null);
    if (tab === "login") {
      if (!email.trim() || !password) {
        setError("Enter your email and password to continue.");
        return;
      }
      if (!EMAIL_RE.test(email.trim())) {
        setError("Please enter a valid email address.");
        return;
      }
    } else {
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
    }

    setIsLoading(true);
    try {
      if (tab === "login") {
        await login(email.trim(), password);
      } else {
        await register(fullName.trim(), email.trim(), password);
      }
      navigation.replace("MainTabs");
    } catch (err: any) {
      const network =
        err?.code === "NETWORK_ERROR" ||
        err?.code === "TIMEOUT" ||
        err?.message === "Network request failed";
      setError(
        network
          ? "Can't reach the AURA backend. Start it with `cd backend && npm start`, then try again."
          : err?.message ?? "Authentication failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <MonoLabel color={colors.ink}>AURA</MonoLabel>

        <SerifText size={38} style={styles.headline}>
          A wearable{"\n"}
          <SerifText size={38} italic>
            that listens.
          </SerifText>
        </SerifText>

        <View style={styles.formBlock}>
          {/* Tabs */}
          <View style={styles.tabsRow}>
            <TouchableOpacity
              style={[styles.tab, tab === "login" && styles.tabActive]}
              onPress={() => {
                setTab("login");
                setError(null);
              }}
            >
              <MonoLabel color={tab === "login" ? colors.ink : colors.textDim}>
                SIGN IN
              </MonoLabel>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, tab === "signup" && styles.tabActive]}
              onPress={() => {
                setTab("signup");
                setError(null);
              }}
            >
              <MonoLabel color={tab === "signup" ? colors.ink : colors.textDim}>
                REGISTER
              </MonoLabel>
            </TouchableOpacity>
          </View>

          <Text style={styles.helper}>
            {tab === "login" ? "Sign in to continue." : "Create your account."}
          </Text>

          {error && <Text style={styles.errorBanner}>{error}</Text>}

          {tab === "signup" && (
            <>
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
            </>
          )}

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
            placeholder="••••••••"
            placeholderTextColor={colors.textDim}
            secureTextEntry
          />

          <TouchableOpacity
            style={[styles.primaryBtn, isLoading && styles.btnDisabled]}
            onPress={() => void handleSubmit()}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            <MonoLabel color={colors.paper}>
              {isLoading ? "SIGNING IN…" : tab === "login" ? "SIGN IN" : "CREATE ACCOUNT"}
            </MonoLabel>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.navigate("Register")}
          style={styles.switchAuthBtn}
        >
          <Text style={styles.switchAuthText}>
            {tab === "login" ? "Don't have an account? " : "Already have an account? "}
            <Text style={styles.switchAuthHighlight}>
              {tab === "login" ? "Create one" : "Sign in"}
            </Text>
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
    lineHeight: 44,
    letterSpacing: -0.5,
  },
  formBlock: {
    width: "100%",
    maxWidth: 380,
  },
  tabsRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: s.lg,
  },
  tab: {
    paddingBottom: 10,
    marginRight: s.xl,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabActive: {
    borderBottomColor: colors.coral,
  },
  helper: {
    color: colors.textMuted,
    fontSize: 13.5,
    marginBottom: s.xl,
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
