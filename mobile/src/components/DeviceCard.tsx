/**
 * DeviceCard — restrained device status block for Home.
 * Small watch icon, factual metrics row, quiet actions.
 */

import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, StyleProp } from "react-native";
import { colors } from "../theme/colors";
import { radii } from "../theme/spacing";
import { Card } from "./Card";
import { Icon } from "./Icon";
import { useDeviceStore } from "../stores/deviceStore";
import { ConnectionState } from "../types/device";

interface DeviceCardProps {
  onSimulatePress?: () => void;
  onManagePress?: () => void;
  style?: StyleProp<any>;
}

export const DeviceCard: React.FC<DeviceCardProps> = ({
  onSimulatePress,
  onManagePress,
  style,
}) => {
  const { connectionState, batteryLevel, signalStrength, simulateButtonPress } = useDeviceStore();

  const isConnected = connectionState === ConnectionState.CONNECTED;

  const getSignalLabel = (rssi: number | null) => {
    if (!rssi) return "Good";
    if (rssi > -60) return "Strong";
    if (rssi > -75) return "Good";
    return "Weak";
  };

  return (
    <Card style={[styles.card, style as any]}>
      <View style={styles.header}>
        <View style={styles.deviceInfo}>
          <Icon name="watch" size={18} color={colors.textMuted} />
          <Text style={styles.deviceName}>AURA One</Text>
        </View>

        <View style={styles.statusRow}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: isConnected ? colors.success : colors.warning },
            ]}
          />
          <Text style={styles.statusText}>{isConnected ? "Connected" : "Offline"}</Text>
        </View>
      </View>

      <View style={styles.metricsRow}>
        <Text style={styles.metric}>
          Battery <Text style={styles.metricValue}>{batteryLevel !== null ? `${batteryLevel}%` : "—"}</Text>
        </Text>
        <Text style={styles.metric}>
          Signal <Text style={styles.metricValue}>{getSignalLabel(signalStrength)}</Text>
        </Text>
        <Text style={styles.metric}>
          Mode <Text style={styles.metricValue}>Virtual</Text>
        </Text>
      </View>

      <View style={styles.actionsRow}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            simulateButtonPress();
            onSimulatePress?.();
          }}
          style={styles.simulateBtn}
        >
          <Text style={styles.simulateBtnText}>Simulate button press</Text>
        </TouchableOpacity>

        {onManagePress && (
          <TouchableOpacity activeOpacity={0.7} onPress={onManagePress} style={styles.manageBtn}>
            <Text style={styles.manageBtnText}>Manage</Text>
          </TouchableOpacity>
        )}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  deviceInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  deviceName: {
    color: colors.text,
    fontSize: 14.5,
    fontWeight: "600",
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    color: colors.textMuted,
    fontSize: 12,
  },
  metricsRow: {
    flexDirection: "row",
    gap: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: 12,
  },
  metric: {
    color: colors.textDim,
    fontSize: 12,
  },
  metricValue: {
    color: colors.text,
    fontWeight: "500",
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  simulateBtn: {
    flex: 1,
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.md,
    paddingVertical: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  simulateBtnText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "500",
  },
  manageBtn: {
    paddingVertical: 9,
    paddingHorizontal: 12,
  },
  manageBtnText: {
    color: colors.textMuted,
    fontSize: 13,
  },
});
