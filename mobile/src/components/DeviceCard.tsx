import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle, StyleProp } from "react-native";
import { colors, radii, shadows } from "../theme/tokens";
import { GlassCard } from "./GlassCard";
import { StatusIndicator } from "./StatusIndicator";
import { useDeviceStore } from "../stores/deviceStore";
import { ConnectionState } from "../types/device";

interface DeviceCardProps {
  onSimulatePress?: () => void;
  onManagePress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const DeviceCard: React.FC<DeviceCardProps> = ({
  onSimulatePress,
  onManagePress,
  style,
}) => {
  const { connectionState, batteryLevel, signalStrength, simulateButtonPress } = useDeviceStore();

  const isConnected = connectionState === ConnectionState.CONNECTED;

  const handleSimulate = () => {
    simulateButtonPress();
    onSimulatePress?.();
  };

  const getSignalLabel = (rssi: number | null) => {
    if (!rssi) return "Excellent (-58 dBm)";
    if (rssi > -60) return "Excellent";
    if (rssi > -75) return "Good";
    return "Weak";
  };

  return (
    <GlassCard style={[styles.card, style]}>
      <View style={styles.header}>
        <View style={styles.deviceInfo}>
          <View style={styles.iconCircle}>
            <Text style={styles.iconText}>⊚</Text>
          </View>
          <View>
            <Text style={styles.deviceName}>AURA Wearable</Text>
            <Text style={styles.firmware}>Firmware v3.0.8 (Omi GATT Compatible)</Text>
          </View>
        </View>

        <StatusIndicator
          label={isConnected ? "Connected" : connectionState}
          status={isConnected ? "success" : connectionState === ConnectionState.ERROR ? "error" : "warning"}
        />
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Battery</Text>
          <Text style={styles.statValue}>
            {batteryLevel !== null ? `${batteryLevel}%` : "--"}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Signal</Text>
          <Text style={styles.statValue}>{getSignalLabel(signalStrength)}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Mode</Text>
          <Text style={styles.statValue}>Virtual BLE</Text>
        </View>
      </View>

      {/* Button Simulation & Manage Controls */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleSimulate}
          style={styles.simulateBtn}
        >
          <Text style={styles.simulateBtnText}>◉ Simulate Button Press</Text>
        </TouchableOpacity>

        {onManagePress && (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onManagePress}
            style={styles.manageBtn}
          >
            <Text style={styles.manageBtnText}>Manage →</Text>
          </TouchableOpacity>
        )}
      </View>
    </GlassCard>
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
    marginBottom: 16,
  },
  deviceInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.accentSoft,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.accent,
  },
  iconText: {
    fontSize: 18,
    color: colors.accent,
  },
  deviceName: {
    color: colors.text1,
    fontSize: 15,
    fontWeight: "600",
  },
  firmware: {
    color: colors.text3,
    fontSize: 11,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: "row",
    backgroundColor: colors.surface2,
    borderRadius: radii.sm,
    padding: 12,
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  statBox: {
    flex: 1,
    alignItems: "center",
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: colors.border,
  },
  statLabel: {
    color: colors.text3,
    fontSize: 11,
    marginBottom: 4,
  },
  statValue: {
    color: colors.text1,
    fontSize: 13,
    fontWeight: "600",
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  simulateBtn: {
    flex: 1,
    backgroundColor: colors.accentSoft,
    borderColor: colors.accent,
    borderWidth: 1,
    borderRadius: radii.sm,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  simulateBtnText: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: "600",
  },
  manageBtn: {
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  manageBtnText: {
    color: colors.text2,
    fontSize: 13,
    fontWeight: "500",
  },
});
