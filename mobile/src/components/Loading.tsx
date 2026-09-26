/**
 * Loading Component
 * Minimalist futuristic AI loader with orbiting glow.
 */

import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, Easing, ViewStyle } from "react-native";
import { colors } from "../theme/colors";

interface LoadingProps {
  message?: string;
  size?: number;
  style?: ViewStyle;
}

export const Loading: React.FC<LoadingProps> = ({
  message = "AURA is synthesizing...",
  size = 44,
  style,
}) => {
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1200,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={[styles.container, style]}>
      <Animated.View
        style={[
          styles.spinner,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            transform: [{ rotate: spin }],
          },
        ]}
      />
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  spinner: {
    borderWidth: 2.5,
    borderColor: colors.border,
    borderTopColor: colors.primary,
    borderRightColor: colors.cyan,
  },
  message: {
    marginTop: 14,
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: "500",
  },
});

