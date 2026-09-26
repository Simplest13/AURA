/**
 * DeviceStatus Component
 * Compact and detailed wearable hardware connection indicator.
 * Displays connection state, battery percentage, signal strength (RSSI),
 * and quick connect/disconnect action.
 */

import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from "react-native";
import { colors } from "../theme/colors";
import { radii } from "../theme/spacing";
import { ConnectionState } from "../types/device";
import { useBle } from "../hooks/useBle";

interface DeviceStatusProps {
  onPress?: () => void;
  compact?: boolean;
  style?: ViewStyle;
}

export const DeviceStatus: React.FC<DeviceStatusProps> = ({
  onPress,
  compact = false,
  style,
}) => {
  const { isConnected, currentDevice, batteryLevel, signalStrength, connectionState } = useBle();

  const getStatusColor = () => {
    if (connectionState === ConnectionState.CONNECTED) return colors.success;
    if (connectionState === ConnectionState.CONNECTING || connectionState === ConnectionState.SCANNING) {
      return colors.warning;
    }
    if (connectionState === ConnectionState.ERROR) return colors.error;
    return colors.textDim;
  };

  const getStatusText = () => {
    if (connectionState === ConnectionState.CONNECTED) return "Connected";
    if (connectionState === ConnectionState.CONNECTING) return "Connecting...";
    if (connectionState === ConnectionState.SCANNING) return "Scanning...";
    if (connectionState === ConnectionState.ERROR) return "Error";
    return "Disconnected";
  };

  if (compact) {
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onPress}
        style={[styles.compactContainer, style]}
      >
        <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
        <Text style={styles.compactText}>
          AURA • {isConnected ? `${batteryLevel ?? 85}%` : "Offline"}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[styles.container, style]}
    >
      <View style={styles.leftCol}>
        <View style={styles.titleRow}>
          <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
          <Text style={styles.deviceName}>
            {currentDevice?.name || "AURA Wearable"}
          </Text>
        </View>
        <Text style={styles.statusSubtext}>
          {getStatusText()} {signalStrength ? `• ${signalStrength} dBm` : ""}
        </Text>
      </View>

      <View style={styles.rightCol}>
        {isConnected && (
          <View style={styles.batteryBadge}>
            <View
              style={[
                styles.batteryLevelBar,
                { width: `${Math.min(100, Math.max(10, batteryLevel ?? 80))}%` },
              ]}
            />
            <Text style={styles.batteryText}>{batteryLevel ?? 85}%</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  compactContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.full,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: "flex-start",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  compactText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "500",
  },
  leftCol: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  deviceName: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "600",
  },
  statusSubtext: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  rightCol: {
    alignItems: "flex-end",
  },
  batteryBadge: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.sm,
    paddingHorizontal: 10,
    paddingVertical: 4,
    overflow: "hidden",
    position: "relative",
  },
  batteryLevelBar: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    backgroundColor: "rgba(34, 197, 94, 0.2)",
  },
  batteryText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "600",
  },
});

