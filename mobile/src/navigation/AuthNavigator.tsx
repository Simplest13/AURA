/**
 * AuthNavigator - AURA Mobile
 * Unauthenticated flow: Login ↔ Register (+ Onboarding kept for legacy entry).
 * `detachInactiveScreens` + default stack behavior means Android back from
 * Login after logout cannot re-enter authenticated screens — the whole
 * authenticated tree unmounts when isAuthenticated flips false.
 */

import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { LoginScreen } from "../screens/LoginScreen";
import { RegisterScreen } from "../screens/RegisterScreen";
import { OnboardingScreen } from "../screens/OnboardingScreen";
import { colors } from "../theme/colors";

const Stack = createNativeStackNavigator();

export const AuthNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerShown: false,
        animation: "fade",
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
    </Stack.Navigator>
  );
};
