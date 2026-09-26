/**
 * MainNavigator - AURA Mobile
 * Hosts the central TabNavigator (Home, Voice, Chat, Study, Profile)
 * alongside modal and detail screens (Device, Reminders, Lectures, PDF, StudyPlanner).
 */

import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { TabNavigator } from "./TabNavigator";
import { DeviceScreen } from "../screens/DeviceScreen";
import { RemindersScreen } from "../screens/RemindersScreen";
import { LectureRecorderScreen } from "../screens/LectureRecorderScreen";
import { PdfSummarizerScreen } from "../screens/PdfSummarizerScreen";
import { StudyPlannerScreen } from "../screens/StudyPlannerScreen";
import { colors } from "../theme/colors";

const Stack = createNativeStackNavigator();

export const MainNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Tabs"
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="Tabs" component={TabNavigator} />
      <Stack.Screen
        name="Device"
        component={DeviceScreen}
        options={{ animation: "slide_from_bottom" }}
      />
      <Stack.Screen name="Reminders" component={RemindersScreen} />
      <Stack.Screen name="Lectures" component={LectureRecorderScreen} />
      <Stack.Screen name="Pdf" component={PdfSummarizerScreen} />
      <Stack.Screen name="StudyPlanner" component={StudyPlannerScreen} />
    </Stack.Navigator>
  );
};

