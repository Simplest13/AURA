/**
 * AURA Icon System
 * Single icon family: @expo/vector-icons Feather (outline, monochrome).
 * 18px default — consistent visual weight across the app.
 */

import React from "react";
import { Feather } from "@expo/vector-icons";
import { StyleProp, TextStyle } from "react-native";
import { colors } from "../theme/colors";

export type IconName =
  | "home"
  | "mic"
  | "message-circle"
  | "book-open"
  | "user"
  | "settings"
  | "watch"
  | "clock"
  | "file-text"
  | "calendar"
  | "play"
  | "pause"
  | "square"
  | "check"
  | "check-circle"
  | "circle"
  | "chevron-right"
  | "chevron-left"
  | "plus"
  | "x"
  | "search"
  | "send"
  | "list"
  | "edit-3"
  | "log-out"
  | "volume-2"
  | "alert-circle"
  | "battery"
  | "wifi"
  | "activity"
  | "bluetooth"
  | "refresh-cw"
  | "upload"
  | "trash-2"
  | "arrow-up"
  | "zap";

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  style?: StyleProp<TextStyle>;
}

export const Icon: React.FC<IconProps> = ({ name, size = 18, color, style }) => (
  <Feather name={name} size={size} color={color ?? colors.textMuted} style={style} />
);
