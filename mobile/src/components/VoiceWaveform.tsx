/**
 * VoiceWaveform — subtle level indication while listening/speaking.
 * Small, low-amplitude bars; motion communicates activity, not decoration.
 */

import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, ViewStyle, Platform } from "react-native";
import { colors } from "../theme/colors";

interface VoiceWaveformProps {
  isActive?: boolean;
  barColor?: string;
  style?: ViewStyle;
}

export const VoiceWaveform: React.FC<VoiceWaveformProps> = ({
  isActive = true,
  barColor = colors.accent,
  style,
}) => {
  const bars = [
    useRef(new Animated.Value(6)).current,
    useRef(new Animated.Value(12)).current,
    useRef(new Animated.Value(18)).current,
    useRef(new Animated.Value(10)).current,
    useRef(new Animated.Value(15)).current,
    useRef(new Animated.Value(7)).current,
  ];

  useEffect(() => {
    if (!isActive) {
      bars.forEach((b) => b.setValue(4));
      return;
    }

    const animations = bars.map((bar, i) => {
      const minH = 4 + (i % 3) * 3;
      const maxH = 14 + (i % 4) * 5;
      const dur = 480 + (i % 3) * 140;

      return Animated.loop(
        Animated.sequence([
          Animated.timing(bar, {
            toValue: maxH,
            duration: dur,
            useNativeDriver: false,
          }),
          Animated.timing(bar, {
            toValue: minH,
            duration: dur,
            useNativeDriver: false,
          }),
        ])
      );
    });

    animations.forEach((anim) => anim.start());

    return () => {
      animations.forEach((anim) => anim.stop());
    };
  }, [isActive]);

  return (
    <View style={[styles.container, style]}>
      {bars.map((barAnim, index) => (
        <Animated.View
          key={index}
          style={[
            styles.bar,
            {
              height: barAnim,
              backgroundColor: barColor,
            },
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    height: 28,
  },
  bar: {
    width: 3,
    borderRadius: 1.5,
  },
});
