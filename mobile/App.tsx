import React, { useEffect } from "react";
import { StatusBar, StyleSheet, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AppNavigator } from "./src/navigation/AppNavigator";
import { colors } from "./src/theme/colors";
import { useAuthStore } from "./src/stores/authStore";
import { useChatStore } from "./src/stores/chatStore";
import { useStudyStore } from "./src/stores/studyStore";

/**
 * Root component. The auth store's restoreSession (hydrate) is driven entirely
 * by AppNavigator — splash shows until it resolves, then the gate switches.
 * Data stores hydrate after authentication, so they cache under the right user.
 */
export default function App() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hydrated = useAuthStore((s) => s.hydrated);

  useEffect(() => {
    if (hydrated && isAuthenticated) {
      // Signed in (restored or fresh login) → load this user's cached data
      void useChatStore.getState().hydrate();
      void useStudyStore.getState().hydrate();
    }
  }, [hydrated, isAuthenticated]);

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <AppNavigator />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
