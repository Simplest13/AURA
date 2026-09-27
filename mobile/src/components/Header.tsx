/**
 * PageHeader — editorial page head.
 * Back control (mono arrow), restrained title, optional subtitle, technical
 * device chip on the right.
 */

import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from "react-native";
import { colors } from "../theme/colors";
import { radii } from "../theme/spacing";
import { Icon } from "./Icon";
import { MonoLabel } from "./Typography";
import { useDeviceStore } from "../stores/deviceStore";
import { ConnectionState } from "../types/device";

interface HeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  showDeviceBadge?: boolean;
  onDeviceBadgePress?: () => void;
  style?: ViewStyle;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  showBack = false,
  onBack,
  rightAction,
  showDeviceBadge = true,
  onDeviceBadgePress,
  style,
}) => {
  const { connectionState, batteryLevel } = useDeviceStore();
  const isConnected = connectionState === ConnectionState.CONNECTED;

  return (
    <View style={[styles.container, style]}>
      <View style={styles.leftSection}>
        {showBack && (
          <TouchableOpacity
            onPress={onBack}
            style={styles.backBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Icon name="chevron-left" size={20} color={colors.ink} />
          </TouchableOpacity>
        )}
        <View style={styles.titleBlock}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
      </View>

      <View style={styles.rightSection}>
        {showDeviceBadge && (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onDeviceBadgePress}
            style={styles.deviceBadge}
          >
            <View
              style={[
                styles.deviceDot,
                { backgroundColor: isConnected ? colors.olive : colors.yellow },
              ]}
            />
            <MonoLabel color={colors.textMuted}>
              {isConnected ? `${batteryLevel}%` : "OFFLINE"}
            </MonoLabel>
          </TouchableOpacity>
        )}

        {rightAction}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  backBtn: {
    marginRight: 10,
    padding: 2,
  },
  titleBlock: {
    flexShrink: 1,
  },
  title: {
    color: colors.ink,
    fontSize: 16.5,
    fontWeight: "600",
    letterSpacing: -0.2,
  },
  subtitle: {
    color: colors.textDim,
    fontSize: 12,
    marginTop: 1,
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  deviceBadge: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: radii.sm,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 6,
  },
  deviceDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
