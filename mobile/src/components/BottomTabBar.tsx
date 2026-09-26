import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { colors, radii, shadows } from "../theme/tokens";

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const getTabIcon = (routeName: string, isFocused: boolean) => {
    switch (routeName) {
      case "Home":
        return "⌂";
      case "Voice":
        return "◉";
      case "Chat":
        return "◔";
      case "Study":
        return "◫";
      case "Profile":
        return "⚙";
      default:
        return "•";
    }
  };

  return (
    <View style={styles.outerContainer}>
      <View style={styles.bar}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
              ? options.title
              : route.name;

          const isFocused = state.index === index;
          const isVoice = route.name === "Voice";

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

          if (isVoice) {
            return (
              <TouchableOpacity
                key={route.key}
                activeOpacity={0.85}
                onPress={onPress}
                style={styles.voiceTabBtn}
              >
                <View style={[styles.voiceOrbButton, shadows.glow]}>
                  <Text style={styles.voiceIcon}>◉</Text>
                </View>
                <Text
                  style={[
                    styles.voiceLabel,
                    { color: isFocused ? colors.accent : colors.text2 },
                  ]}
                >
                  VOICE
                </Text>
              </TouchableOpacity>
            );
          }

          return (
            <TouchableOpacity
              key={route.key}
              activeOpacity={0.7}
              onPress={onPress}
              style={styles.tabItem}
            >
              <Text
                style={[
                  styles.tabIcon,
                  { color: isFocused ? colors.accent : colors.text3 },
                ]}
              >
                {getTabIcon(route.name, isFocused)}
              </Text>
              <Text
                style={[
                  styles.tabLabel,
                  { color: isFocused ? colors.text1 : colors.text3 },
                  isFocused && styles.tabLabelActive,
                ]}
              >
                {String(label).toUpperCase()}
              </Text>
              {isFocused && <View style={styles.activeDot} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "transparent",
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  bar: {
    backgroundColor: colors.bgElevated,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingVertical: 8,
    paddingHorizontal: 8,
    ...shadows.md,
  },
  tabItem: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    paddingVertical: 4,
  },
  tabIcon: {
    fontSize: 18,
    marginBottom: 3,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 0.4,
  },
  tabLabelActive: {
    color: colors.text1,
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.accent,
    marginTop: 3,
  },
  voiceTabBtn: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    marginTop: -16,
  },
  voiceOrbButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.surface2,
    borderWidth: 2,
    borderColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  voiceIcon: {
    color: colors.accent,
    fontSize: 22,
  },
  voiceLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.4,
  },
});
