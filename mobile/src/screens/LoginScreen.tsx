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

export const LoginScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [tab, setTab] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("shivam@alignsoul.co");
  const [password, setPassword] = useState("••••••••");
  const [fullName, setFullName] = useState("Shivam");
  const { login } = useAuthStore();

  const handleSubmit = () => {
    login(email);
    navigation.replace("MainTabs");
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <AuraOrb state="idle" size={80} style={styles.orb} />
      <Text style={styles.brandTitle}>AURA</Text>

      <View style={styles.card}>
        <View style={styles.tabsRow}>
          <TouchableOpacity
            style={[styles.tab, tab === "login" && styles.tabActive]}
            onPress={() => setTab("login")}
          >
            <Text style={[styles.tabText, tab === "login" && styles.tabTextActive]}>
              Log in
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, tab === "signup" && styles.tabActive]}
            onPress={() => setTab("signup")}
          >
            <Text style={[styles.tabText, tab === "signup" && styles.tabTextActive]}>
              Sign up
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.cardTitle}>
          {tab === "login" ? "Welcome back" : "Create your account"}
        </Text>
        <Text style={styles.cardSubtitle}>
          {tab === "login"
            ? "Pick up right where you left off."
            : "Free for students. No card needed."}
        </Text>

        {tab === "signup" && (
          <>
            <Text style={styles.inputLabel}>Full name</Text>
            <TextInput
              style={styles.input}
              value={fullName}
              onChangeText={setFullName}
              placeholder="Ada Lovelace"
              placeholderTextColor={colors.text3}
            />
          </>
        )}

        <Text style={styles.inputLabel}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="you@university.edu"
          placeholderTextColor={colors.text3}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.inputLabel}>Password</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          placeholderTextColor={colors.text3}
          secureTextEntry
        />

        <AuraButton
          title={tab === "login" ? "Log in" : "Create account"}
          onPress={handleSubmit}
          variant="primary"
          style={styles.submitBtn}
        />

        <AuraButton
          title="⚡ Quick Demo Mode Login"
          onPress={handleSubmit}
          variant="secondary"
          size="sm"
          style={styles.demoBtn}
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
    padding: 24,
  },
  orb: {
    marginBottom: 12,
  },
  brandTitle: {
    color: colors.text1,
    fontSize: 26,
    fontWeight: "700",
    letterSpacing: 3,
    marginBottom: 24,
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
  tabsRow: {
    flexDirection: "row",
    backgroundColor: colors.surface2,
    borderRadius: radii.sm,
    padding: 3,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: radii.xs,
  },
  tabActive: {
    backgroundColor: colors.surface,
  },
  tabText: {
    color: colors.text2,
    fontSize: 13,
    fontWeight: "600",
  },
  tabTextActive: {
    color: colors.text1,
  },
  cardTitle: {
    color: colors.text1,
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 4,
  },
  cardSubtitle: {
    color: colors.text3,
    fontSize: 13,
    marginBottom: 20,
  },
  inputLabel: {
    color: colors.text2,
    fontSize: 11.5,
    fontWeight: "600",
    marginBottom: 6,
  },
  input: {
    backgroundColor: colors.surface2,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.sm,
    paddingVertical: 10,
    paddingHorizontal: 14,
    color: colors.text1,
    fontSize: 14,
    marginBottom: 14,
  },
  submitBtn: {
    marginTop: 8,
    marginBottom: 12,
  },
  demoBtn: {
    borderColor: colors.accent,
  },
});
