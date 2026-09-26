/**
 * VoiceVisualizer Component
 * Lightweight, dynamic audio frequency & amplitude visualizer.
 * Responds to audio levels (0.0 to 1.0) with animated glowing bars
 * adapting across silence, low audio, normal audio, and high audio.
 */

import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, ViewStyle } from "react-native";
import { colors } from "../theme/colors";

interface VoiceVisualizerProps {
  amplitude: number; // 0.0 to 1.0
  active?: boolean;
  barCount?: number;
  height?: number;
  color?: string;
  style?: ViewStyle;
}

export const VoiceVisualizer: React.FC<VoiceVisualizerProps> = ({
  amplitude = 0,
  active = true,
  barCount = 9,
  height = 48,
  color,
  style,
}) => {
  const animatedValues = useRef(
    Array.from({ length: barCount }, () => new Animated.Value(0.15))
  ).current;

  // Determine active color mode based on amplitude level
  let barColor = color || colors.primary;
  if (amplitude > 0.65) {
    barColor = colors.coral; // High amplitude
  } else if (amplitude > 0.3) {
    barColor = colors.cyan; // Normal speech
  } else if (amplitude > 0.05) {
    barColor = colors.secondary; // Low amplitude
  }

  useEffect(() => {
    if (!active) {
      animatedValues.forEach((val) => {
        Animated.timing(val, {
          toValue: 0.1,
          duration: 200,
          useNativeDriver: false,
        }).start();
      });
      return;
    }

    animatedValues.forEach((val, idx) => {
      // Create natural frequency curve: higher in middle, tapered on sides
      const centerDist = Math.abs(idx - (barCount - 1) / 2);
      const factor = Math.max(0.2, 1 - centerDist * 0.18);
      const randomJitter = (Math.random() - 0.5) * 0.25;
      const target = Math.min(1.0, Math.max(0.12, (amplitude * factor) + randomJitter));

      Animated.timing(val, {
        toValue: target,
        duration: 90 + idx * 10,
        useNativeDriver: false,
      }).start();
    });
  }, [amplitude, active, barCount]);

  return (
    <View style={[styles.container, { height }, style]}>
      {animatedValues.map((anim, index) => {
        const barHeight = anim.interpolate({
          inputRange: [0, 1],
          outputRange: [6, height],
        });

        return (
          <Animated.View
            key={index}
            style={[
              styles.bar,
              {
                height: barHeight,
                backgroundColor: barColor,
                shadowColor: barColor,
              },
            ]}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingHorizontal: 16,
  },
  bar: {
    width: 4,
    borderRadius: 99,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 4,
  },
});

