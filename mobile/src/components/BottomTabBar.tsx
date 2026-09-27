/**
 * BottomTabBar — integrated editorial navigation.
 * Paper bar with a hairline top rule. Selected state: darker type + tiny
 * coral marker. No glow, no floating pill.
 */

import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { colors } from "../theme/colors";
import { Icon, IconName } from "./Icon";

const TAB_ICONS: Record<string, IconName> = {
  Home: "home",
  Voice: "mic",
  Chat: "message-circle",
  Study: "book-open",
  Profile: "user",
};

const TAB_LABELS: Record<string, string> = {
  Home: "Home",
  Voice: "Voice",
  Chat: "Chat",
  Study: "Study",
  Profile: "Me",
};

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? String(options.tabBarLabel)
            : options.title !== undefined
            ? options.title
            : TAB_LABELS[route.name] ?? route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            activeOpacity={0.7}
            onPress={onPress}
            style={styles.tab}
          >
            <Icon
              name={TAB_ICONS[route.name] ?? "circle"}
              size={20}
              color={isFocused ? colors.ink : colors.textDim}
            />
            <Text style={[styles.label, { color: isFocused ? colors.ink : colors.textDim }]}>
              {label}
            </Text>
            {/* Tiny accent marker on the selected tab */}
            <View
              style={[styles.marker, { backgroundColor: isFocused ? colors.coral : "transparent" }]}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 8,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  label: {
    fontSize: 10.5,
    fontWeight: "500",
    letterSpacing: 0.3,
  },
  marker: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 1,
  },
});
