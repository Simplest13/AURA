import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from "react-native";
import { colors, radii } from "../theme/tokens";
import { Header } from "../components/Header";
import { GlassCard } from "../components/GlassCard";
import { StatusIndicator } from "../components/StatusIndicator";
import { AuraButton } from "../components/AuraButton";
import { useDeviceStore } from "../stores/deviceStore";
import { ConnectionState, OMI_PROTOCOL, STANDARD_BLE } from "../types/device";

export const DeviceScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const {
    connectionState,
    currentDevice,
    batteryLevel,
    signalStrength,
    firmwareVersion,
    discoveredDevices,
    scanForDevices,
    connectToDevice,
    disconnect,
    simulateButtonPress,
  } = useDeviceStore();

  const isConnected = connectionState === ConnectionState.CONNECTED;
  const isScanning = connectionState === ConnectionState.SCANNING;

  const handleSimulate = () => {
    simulateButtonPress();
    navigation.navigate("Voice");
  };

  return (
    <View style={styles.container}>
      <Header
        title="Wearable Device"
        subtitle="Hardware Connection & BLE Protocol"
        showBack={true}
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Device Status Card */}
        <GlassCard style={styles.mainCard} glow={isConnected}>
          <View style={styles.cardTop}>
            <View style={styles.iconCircle}>
              <Text style={styles.deviceIcon}>⊚</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.deviceName}>
                {currentDevice?.name || "AURA Wearable Pendant"}
              </Text>
              <Text style={styles.deviceId}>
                ID: {currentDevice?.id || "AURA-VIRTUAL-01"}
              </Text>
            </View>
            <StatusIndicator
              label={isConnected ? "Connected" : connectionState}
              status={isConnected ? "success" : "warning"}
            />
          </View>

          {/* Metrics Row */}
          <View style={styles.metricsRow}>
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>BATTERY</Text>
              <Text style={styles.metricValue}>
                {batteryLevel !== null ? `${batteryLevel}%` : "--"}
              </Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>SIGNAL (RSSI)</Text>
              <Text style={styles.metricValue}>
                {signalStrength ? `${signalStrength} dBm` : "Excellent"}
              </Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>FIRMWARE</Text>
              <Text style={styles.metricValue}>
                v{firmwareVersion || "3.0.8"}
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonStack}>
            <AuraButton
              title="◉ Simulate Wearable Button Press"
              variant="primary"
              size="md"
              onPress={handleSimulate}
              style={{ marginBottom: 10 }}
            />

            {isConnected ? (
              <AuraButton
                title="Disconnect Wearable"
                variant="secondary"
                size="md"
                onPress={disconnect}
              />
            ) : (
              <AuraButton
                title={isScanning ? "Scanning..." : "Scan for Wearable Devices"}
                variant="primary"
                size="md"
                loading={isScanning}
                onPress={scanForDevices}
              />
            )}
          </View>
        </GlassCard>

        {/* Discovered BLE Peripherals Section */}
        <Text style={styles.sectionTitle}>DISCOVERED BLE DEVICES</Text>
        {discoveredDevices.length === 0 ? (
          <GlassCard style={styles.emptyCard} variant="surface2">
            {isScanning ? (
              <View style={{ alignItems: "center", paddingVertical: 12 }}>
                <ActivityIndicator color={colors.accent} size="small" />
                <Text style={styles.scanningText}>
                  Scanning 2.4GHz BLE advertisement packets...
                </Text>
              </View>
            ) : (
              <Text style={styles.emptyText}>
                No other devices in range. Tap "Scan for Wearable Devices" to search.
              </Text>
            )}
          </GlassCard>
        ) : (
          discoveredDevices.map((d) => (
            <TouchableOpacity
              key={d.id}
              style={styles.deviceItem}
              onPress={() => connectToDevice(d.id)}
            >
              <View style={styles.deviceItemIcon}>
                <Text>⊚</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.deviceItemName}>{d.name}</Text>
                <Text style={styles.deviceItemSub}>
                  {d.id} · RSSI: {d.rssi} dBm
                </Text>
              </View>
              <AuraButton
                title="Connect"
                size="sm"
                variant="secondary"
                onPress={() => connectToDevice(d.id)}
              />
            </TouchableOpacity>
          ))
        )}

        {/* Hardware & GATT Protocol Details */}
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>
          GATT SERVICE PROTOCOL SPECIFICATION
        </Text>
        <GlassCard style={styles.protocolCard} variant="surface2">
          <Text style={styles.protocolText}>
            Adapted from Omi firmware reference architecture (MIT Licensed):
          </Text>

          <View style={styles.gattRow}>
            <Text style={styles.gattName}>Main Service UUID:</Text>
            <Text style={styles.gattUuid}>{OMI_PROTOCOL.MAIN_SERVICE_UUID}</Text>
          </View>

          <View style={styles.gattRow}>
            <Text style={styles.gattName}>Button Trigger Characteristic:</Text>
            <Text style={styles.gattUuid}>{OMI_PROTOCOL.BUTTON_TRIGGER_CHARACTERISTIC_UUID}</Text>
          </View>

          <View style={styles.gattRow}>
            <Text style={styles.gattName}>Standard Battery Service:</Text>
            <Text style={styles.gattUuid}>{STANDARD_BLE.BATTERY_SERVICE_UUID}</Text>
          </View>

          <View style={styles.gattRow}>
            <Text style={styles.gattName}>Battery Level Characteristic:</Text>
            <Text style={styles.gattUuid}>{STANDARD_BLE.BATTERY_LEVEL_CHARACTERISTIC_UUID}</Text>
          </View>

          <View style={styles.gattRow}>
            <Text style={styles.gattName}>Audio Stream Characteristic:</Text>
            <Text style={styles.gattUuid}>{OMI_PROTOCOL.AUDIO_DATA_STREAM_CHARACTERISTIC_UUID}</Text>
          </View>
        </GlassCard>

        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  mainCard: {
    padding: 18,
    marginBottom: 20,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  deviceIcon: {
    color: colors.accent,
    fontSize: 22,
  },
  deviceName: {
    color: colors.text1,
    fontSize: 16,
    fontWeight: "600",
  },
  deviceId: {
    color: colors.text3,
    fontSize: 11,
    marginTop: 2,
  },
  metricsRow: {
    flexDirection: "row",
    backgroundColor: colors.surface2,
    borderRadius: radii.sm,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 18,
  },
  metric: {
    flex: 1,
    alignItems: "center",
  },
  metricDivider: {
    width: 1,
    height: 24,
    backgroundColor: colors.border,
  },
  metricLabel: {
    color: colors.text3,
    fontSize: 9.5,
    fontWeight: "700",
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  metricValue: {
    color: colors.text1,
    fontSize: 13,
    fontWeight: "600",
  },
  buttonStack: {
    width: "100%",
  },
  sectionTitle: {
    color: colors.text3,
    fontSize: 10.5,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  emptyCard: {
    padding: 16,
    alignItems: "center",
  },
  emptyText: {
    color: colors.text3,
    fontSize: 12,
    textAlign: "center",
  },
  scanningText: {
    color: colors.accent,
    fontSize: 12,
    marginTop: 8,
  },
  deviceItem: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.md,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  deviceItemIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surface2,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  deviceItemName: {
    color: colors.text1,
    fontSize: 13.5,
    fontWeight: "600",
  },
  deviceItemSub: {
    color: colors.text3,
    fontSize: 11,
    marginTop: 2,
  },
  protocolCard: {
    padding: 14,
  },
  protocolText: {
    color: colors.text2,
    fontSize: 11.5,
    lineHeight: 16,
    marginBottom: 12,
  },
  gattRow: {
    marginBottom: 8,
  },
  gattName: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: "600",
  },
  gattUuid: {
    color: colors.text3,
    fontSize: 10,
    fontFamily: Platform.OS === "android" ? "monospace" : "Menlo",
    marginTop: 2,
  },
});
