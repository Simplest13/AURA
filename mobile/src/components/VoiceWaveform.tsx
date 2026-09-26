import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, ViewStyle } from "react-native";
import { colors } from "../theme/tokens";

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
    useRef(new Animated.Value(8)).current,
    useRef(new Animated.Value(18)).current,
    useRef(new Animated.Value(28)).current,
    useRef(new Animated.Value(14)).current,
    useRef(new Animated.Value(24)).current,
    useRef(new Animated.Value(10)).current,
  ];

  useEffect(() => {
    if (!isActive) {
      bars.forEach((b) => b.setValue(6));
      return;
    }

    const animations = bars.map((bar, i) => {
      const minH = 6 + (i % 3) * 4;
      const maxH = 22 + (i % 4) * 8;
      const dur = 350 + (i % 3) * 120;

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
    height: 48,
  },
  bar: {
    width: 3.5,
    borderRadius: 2,
  },
});
