import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors } from "../theme/colors";
import { AuraOrb } from "../components/AuraOrb";
import { MonoLabel } from "../components/Typography";

/**
 * Pure display splash. Shown by AppNavigator ONLY while the persisted session
 * is being restored. It holds no navigation logic and cannot become a stuck
 * state — restoreSession always resolves (or the safety timeout fires).
 */
export const SplashScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <AuraOrb state="idle" size={64} />
      <MonoLabel color={colors.ink} style={{ marginTop: 32, fontSize: 13, letterSpacing: 6 }}>
        AURA
      </MonoLabel>
      <Text style={styles.footnote}>Restoring your session…</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  footnote: {
    color: colors.textDim,
    fontSize: 12.5,
    marginTop: 12,
  },
});
