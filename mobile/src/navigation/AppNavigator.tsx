/**
 * AppNavigator - AURA Mobile
 * Root gate: decides between Splash (session restore ONLY), Auth, and Main flows.
 *
 * The splash is rendered conditionally while `hydrate()` restores the session —
 * it is NOT a stack screen the app can get stuck on. When restore finishes (or
 * a safety timeout fires), the gate switches and the splash unmounts. Logout
 * flips `isAuthenticated` to false, which remounts the AuthNavigator directly.
 */

import React from "react";
import { NavigationContainer, DarkTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SplashScreen } from "../screens/SplashScreen";
import { AuthNavigator } from "./AuthNavigator";
import { MainNavigator } from "./MainNavigator";
import { useAuthStore } from "../stores/authStore";
import { ApiClient } from "../services/api/ApiClient";
import { colors } from "../theme/colors";

const Stack = createNativeStackNavigator();

const auraTheme = {
  ...DarkTheme,
  dark: true,
  colors: {
    ...DarkTheme.colors,
    primary: colors.primary,
    background: colors.background,
    card: colors.surfaceElevated,
    text: colors.text,
    border: colors.border,
    notification: colors.primary,
  },
};

export const AppNavigator: React.FC = () => {
  const { isAuthenticated, hydrated, hydrate } = useAuthStore();
  // Safety net: if restore hangs (broken storage, stuck I/O), leave the splash
  // after 8s regardless — an infinite splash is never an acceptable state.
  const [restoreTimedOut, setRestoreTimedOut] = React.useState(false);

  React.useEffect(() => {
    void hydrate();
  }, [hydrate]);

  // After a session is restored from storage, validate it against the backend.
  // A stale/expired token triggers logout → the gate below flips to Login
  // instead of letting the app run on a dead session.
  React.useEffect(() => {
    if (hydrated && isAuthenticated) {
      void ApiClient.validateSession();
    }
  }, [hydrated, isAuthenticated]);

  React.useEffect(() => {
    if (hydrated) return;
    const timer = setTimeout(() => setRestoreTimedOut(true), 8000);
    return () => clearTimeout(timer);
  }, [hydrated]);

  // Splash ONLY while determining session state
  if (!hydrated && !restoreTimedOut) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer theme={auraTheme}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: "fade",
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        {isAuthenticated ? (
          <Stack.Screen name="MainTabs" component={MainNavigator} />
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
