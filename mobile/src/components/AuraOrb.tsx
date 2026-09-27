/**
 * AuraOrb — AURA's physical signature.
 * A small ink disc with a fine accent ring. It breathes when idle, leans into
 * the mic when listening, turns slowly while thinking, pulses softly while
 * speaking. An object, not a portal.
 */

import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, Easing, ViewStyle, Platform } from "react-native";
import { colors } from "../theme/colors";
import { VoiceState } from "../types/voice";

export type OrbState = VoiceState | "IDLE" | "LISTENING" | "THINKING" | "SPEAKING" | "ERROR";

interface AuraOrbProps {
  state: OrbState;
  size?: number;
  amplitude?: number;
  style?: ViewStyle;
}

export const AuraOrb: React.FC<AuraOrbProps> = ({ state, size = 88, amplitude = 0, style }) => {
  const normalizedState = (state || "idle").toString().toLowerCase() as VoiceState;

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const ringAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if ((normalizedState === "listening" || normalizedState === "speaking") && amplitude > 0) {
      Animated.timing(scaleAnim, {
        toValue: 1 + Math.min(amplitude, 1) * 0.05,
        duration: 120,
        useNativeDriver: Platform.OS !== "web",
      }).start();
    }
  }, [amplitude, normalizedState]);

  useEffect(() => {
    scaleAnim.stopAnimation();
    rotateAnim.stopAnimation();
    scaleAnim.setValue(1);
    rotateAnim.setValue(0);
    ringAnim.setValue(0);

    const loop = (toValue: number, duration: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue,
            duration,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: Platform.OS !== "web",
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: Platform.OS !== "web",
          }),
        ])
      );

    let anim: Animated.CompositeAnimation | undefined;

    if (normalizedState === "idle") {
      anim = loop(1.025, 3000);
    } else if (normalizedState === "listening") {
      anim = loop(1.06, 1000);
      // accent ring fades in
      Animated.timing(ringAnim, { toValue: 1, duration: 300, useNativeDriver: false }).start();
    } else if (normalizedState === "thinking") {
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 5000,
          easing: Easing.linear,
          useNativeDriver: Platform.OS !== "web",
        })
      ).start();
    } else if (normalizedState === "speaking") {
      anim = loop(1.045, 750);
      Animated.timing(ringAnim, { toValue: 1, duration: 300, useNativeDriver: false }).start();
    }

    anim?.start();
    return () => anim?.stop();
  }, [normalizedState, scaleAnim, rotateAnim, ringAnim]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const isError = normalizedState === "error";
  const ringColor = isError ? colors.error : colors.coral;

  return (
    <View
      style={[
        {
          width: size,
          height: size,
          alignItems: "center",
          justifyContent: "center",
        },
        style,
      ]}
    >
      {/* Fine outer ring — hairline, editorial */}
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            borderRadius: size / 2,
            borderWidth: 1,
            borderColor: colors.border,
          },
        ]}
      />

      {/* Accent arc — appears while listening / speaking */}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            borderRadius: size / 2,
            borderWidth: 1.5,
            borderColor: ringColor,
            opacity: ringAnim,
            transform: [{ rotate: spin }],
          },
        ]}
      />

      {/* Ink disc */}
      <Animated.View
        style={[
          styles.disc,
          {
            width: size * 0.62,
            height: size * 0.62,
            borderRadius: (size * 0.62) / 2,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Inner point of focus */}
        <View
          style={[
            styles.core,
            {
              width: size * 0.09,
              height: size * 0.09,
              borderRadius: size * 0.045,
              backgroundColor: isError ? colors.error : colors.paper,
              opacity: 0.85,
            },
          ]}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  disc: {
    backgroundColor: colors.ink,
    alignItems: "center",
    justifyContent: "center",
  },
  core: {},
});
