/**
 * Editorial typography primitives.
 * SerifText — expressive headlines (Georgia serif stack).
 * MonoLabel — technical micro-labels (tracking, uppercase).
 */

import React from "react";
import { Text, TextProps, StyleSheet, StyleProp, TextStyle } from "react-native";
import { colors } from "../theme/colors";
import { serifFamily, monoFamily } from "../theme/typography";

interface SerifTextProps extends TextProps {
  size?: number;
  color?: string;
  italic?: boolean;
  style?: StyleProp<TextStyle>;
}

export const SerifText: React.FC<SerifTextProps> = ({
  size = 34,
  color = colors.ink,
  italic = false,
  style,
  children,
  ...rest
}) => (
  <Text
    style={[
      {
        fontFamily: serifFamily,
        fontSize: size,
        lineHeight: size * 1.18,
        color,
        fontStyle: italic ? "italic" : "normal",
      },
      style,
    ]}
    {...rest}
  >
    {children}
  </Text>
);

interface MonoLabelProps extends TextProps {
  color?: string;
  size?: number;
  style?: StyleProp<TextStyle>;
}

export const MonoLabel: React.FC<MonoLabelProps> = ({
  color = colors.textDim,
  size = 10,
  style,
  children,
  ...rest
}) => (
  <Text
    style={[
      {
        fontFamily: monoFamily,
        fontSize: size,
        letterSpacing: 1.1,
        textTransform: "uppercase",
        color,
      },
      style,
    ]}
    {...rest}
  >
    {children}
  </Text>
);
