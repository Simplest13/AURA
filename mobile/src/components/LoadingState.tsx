import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, ViewStyle } from "react-native";
import { colors, radii } from "../theme/tokens";

interface LoadingStateProps {
  style?: ViewStyle;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ style }) => {
  const opacityAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacityAnim, {
          toValue: 0.8,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <View style={[styles.container, style]}>
      <Animated.View style={[styles.skeleton, styles.w40, { opacity: opacityAnim }]} />
      <Animated.View style={[styles.skeleton, styles.wFull, { opacity: opacityAnim }]} />
      <Animated.View style={[styles.skeleton, styles.w80, { opacity: opacityAnim }]} />
      <Animated.View style={[styles.skeleton, styles.w60, { opacity: opacityAnim }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  skeleton: {
    height: 14,
    backgroundColor: colors.surface2,
    borderRadius: radii.xs,
  },
  w40: {
    width: "40%",
    height: 18,
  },
  wFull: {
    width: "100%",
  },
  w80: {
    width: "80%",
  },
  w60: {
    width: "60%",
  },
});
