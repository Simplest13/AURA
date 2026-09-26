/**
 * AuraOrb Component
 * Flagship visual identity representing the AURA AI core.
 * Features multi-layered animated glowing rings, pulse breathing, rotation,
 * and amplitude responsiveness.
 */

import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, Easing, ViewStyle } from "react-native";
import { colors } from "../theme/colors";
import { VoiceState } from "../types/voice";

export type OrbState = VoiceState | "IDLE" | "LISTENING" | "THINKING" | "SPEAKING" | "ERROR";

interface AuraOrbProps {
  state: OrbState;
  size?: number;
  amplitude?: number; // 0.0 to 1.0
  style?: ViewStyle;
}

export const AuraOrb: React.FC<AuraOrbProps> = ({ state, size = 180, amplitude = 0, style }) => {
  const normalizedState = (state || "idle").toString().toLowerCase() as VoiceState;

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0.6)).current;
  const ampAnim = useRef(new Animated.Value(1)).current;

  // React to amplitude changes when listening or speaking
  useEffect(() => {
    if (amplitude > 0) {
      Animated.timing(ampAnim, {
        toValue: 1 + amplitude * 0.35,
        duration: 90,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(ampAnim, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }).start();
    }
  }, [amplitude]);

  useEffect(() => {
    pulseAnim.stopAnimation();
    rotateAnim.stopAnimation();
    glowAnim.stopAnimation();

    if (normalizedState === "idle") {
      // Slow breathing animation with subtle glow
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 2400,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0.97,
            duration: 2400,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 0.7,
            duration: 2400,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0.4,
            duration: 2400,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else if (normalizedState === "listening") {
      // Alert pulse with reactive coral glow
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.14,
            duration: 650,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0.95,
            duration: 650,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ])
      ).start();

      Animated.timing(glowAnim, {
        toValue: 0.95,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else if (normalizedState === "thinking") {
      // Continuous rotational energy and deep violet glow
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 2500,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.08,
            duration: 850,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0.93,
            duration: 850,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else if (normalizedState === "speaking") {
      // Expanding speech waves in cyan
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.22,
            duration: 400,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0.98,
            duration: 400,
            easing: Easing.in(Easing.cubic),
            useNativeDriver: true,
          }),
        ])
      ).start();

      Animated.timing(glowAnim, {
        toValue: 0.9,
        duration: 250,
        useNativeDriver: true,
      }).start();
    } else if (normalizedState === "error") {
      pulseAnim.setValue(1);
      glowAnim.setValue(0.9);
    }
  }, [normalizedState]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  // State colors
  let ringColor = colors.primary;
  let centerColor = colors.secondary;
  let shadowColor = colors.primary;

  if (normalizedState === "listening") {
    ringColor = colors.coral;
    centerColor = colors.primary;
    shadowColor = colors.coral;
  } else if (normalizedState === "thinking") {
    ringColor = colors.primaryLight;
    centerColor = colors.secondary;
    shadowColor = colors.primary;
  } else if (normalizedState === "speaking") {
    ringColor = colors.cyan;
    centerColor = colors.primary;
    shadowColor = colors.cyan;
  } else if (normalizedState === "error") {
    ringColor = colors.error;
    centerColor = colors.error;
    shadowColor = colors.error;
  }

  const innerSize = size * 0.62;
  const coreSize = size * 0.32;

  return (
    <View style={[{ width: size, height: size, alignItems: "center", justifyContent: "center" }, style]}>
      {/* Outer Halo Glow */}
      <Animated.View
        style={[
          styles.outerHalo,
          {
            width: size * 1.2,
            height: size * 1.2,
            borderRadius: (size * 1.2) / 2,
            backgroundColor: ringColor,
            opacity: glowAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.08, 0.35],
            }),
            transform: [{ scale: pulseAnim }, { scale: ampAnim }],
          },
        ]}
      />

      {/* Main Orbiting / Pulsing Ring */}
      <Animated.View
        style={[
          styles.ring,
          {
            width: size * 0.9,
            height: size * 0.9,
            borderRadius: (size * 0.9) / 2,
            borderColor: ringColor,
            shadowColor: shadowColor,
            transform: [{ scale: pulseAnim }, { rotate: spin }],
          },
        ]}
      >
        {/* Inner Glass Sphere */}
        <View
          style={[
            styles.innerCircle,
            {
              width: innerSize,
              height: innerSize,
              borderRadius: innerSize / 2,
              backgroundColor: colors.surfaceElevated,
              borderColor: colors.borderLight,
            },
          ]}
        >
          {/* Pulsing Core */}
          <Animated.View
            style={[
              styles.core,
              {
                width: coreSize,
                height: coreSize,
                borderRadius: coreSize / 2,
                backgroundColor: centerColor,
                shadowColor: ringColor,
                transform: [{ scale: ampAnim }],
              },
            ]}
          />
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerHalo: {
    position: "absolute",
  },
  ring: {
    borderWidth: 2.5,
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 20,
    elevation: 10,
  },
  innerCircle: {
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  core: {
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.85,
    shadowRadius: 14,
    elevation: 8,
  },
});
