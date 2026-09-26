import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors } from "../theme/tokens";
import { AuraOrb } from "../components/AuraOrb";
import { useAuthStore } from "../stores/authStore";

export const SplashScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isAuthenticated) {
        navigation.replace("MainTabs");
      } else {
        navigation.replace("Onboarding");
      }
    }, 1800);

    return () => clearTimeout(timer);
  }, [isAuthenticated, navigation]);

  return (
    <View style={styles.container}>
      <AuraOrb state="thinking" size={140} />
      <Text style={styles.brandTitle}>AURA</Text>
      <Text style={styles.tagline}>Intelligent Wearable Assistant</Text>
      <Text style={styles.footnote}>Connecting second brain...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  brandTitle: {
    color: colors.text1,
    fontSize: 32,
    fontWeight: "700",
    letterSpacing: 4,
    marginTop: 32,
  },
  tagline: {
    color: colors.accent2,
    fontSize: 14,
    fontWeight: "500",
    marginTop: 8,
  },
  footnote: {
    color: colors.text3,
    fontSize: 12,
    marginTop: 48,
  },
});
