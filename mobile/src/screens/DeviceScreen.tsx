/**
 * DeviceScreen — the wearable as a physical product sheet.
 * Mono technical labels, hairline metric rows, quiet actions.
 */

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../theme/colors";
import { spacing as s, radii } from "../theme/spacing";
import { useLayout } from "../theme/responsive";
import { Header } from "../components/Header";
import { Icon } from "../components/Icon";
import { AuraButton } from "../components/AuraButton";
import { SerifText, MonoLabel } from "../components/Typography";
import { useDeviceStore } from "../stores/deviceStore";
import { ConnectionState, OMI_PROTOCOL, STANDARD_BLE } from "../types/device";

export const DeviceScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { contentMaxWidth, gutter } = useLayout();
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

  return (
    <View style={styles.container}>
      <View style={{ maxWidth: contentMaxWidth, width: "100%", alignSelf: "center" }}>
        <Header
          title="Device"
          showBack={true}
          onBack={() => navigation.goBack()}
          showDeviceBadge={false}
        />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingHorizontal: gutter,
            maxWidth: contentMaxWidth,
            width: "100%",
            alignSelf: "center",
            paddingBottom: 60 + insets.bottom,
          },
        ]}
      >
        <MonoLabel color={colors.textDim}>WEARABLE</MonoLabel>

        {/* Identity */}
        <View style={styles.identityRow}>
          <SerifText size={30}>AURA One</SerifText>
          <View style={styles.statusChip}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: isConnected ? colors.olive : colors.yellow },
              ]}
            />
            <MonoLabel color={colors.textMuted}>
              {isConnected ? "CONNECTED" : String(connectionState).toUpperCase()}
            </MonoLabel>
          </View>
        </View>

        <MonoLabel color={colors.textDim}>ID · {currentDevice?.id || "AURA-VIRTUAL-01"}</MonoLabel>

        {/* Metrics */}
        <View style={styles.metricsBlock}>
          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Battery</Text>
            <Text style={styles.metricValue}>
              {batteryLevel !== null ? `${batteryLevel}%` : "—"}
            </Text>
          </View>
          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Connection</Text>
            <Text style={styles.metricValue}>
              {signalStrength
                ? signalStrength > -60
                  ? "Strong"
                  : signalStrength > -75
                  ? "Good"
                  : "Weak"
                : "Good"}
            </Text>
          </View>
          <View style={styles.metricRowLast}>
            <Text style={styles.metricLabel}>Firmware</Text>
            <Text style={styles.metricValue}>{firmwareVersion || "3.0.8"}</Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionsStack}>
          <AuraButton
            title="Simulate button press"
            variant="primary"
            size="md"
            onPress={() => {
              simulateButtonPress();
              navigation.navigate("Voice");
            }}
          />
          {isConnected ? (
            <AuraButton
              title="Disconnect"
              variant="secondary"
              size="md"
              onPress={disconnect}
              style={{ marginTop: s.sm }}
            />
          ) : (
            <AuraButton
              title={isScanning ? "Scanning…" : "Scan for devices"}
              variant="secondary"
              size="md"
              loading={isScanning}
              onPress={scanForDevices}
              style={{ marginTop: s.sm }}
            />
          )}
        </View>

        {/* Nearby */}
        {discoveredDevices.length > 0 && (
          <>
            <MonoLabel color={colors.textDim} style={{ marginTop: s.xxl }}>
              NEARBY DEVICES
            </MonoLabel>
            {discoveredDevices.map((d) => (
              <TouchableOpacity
                key={d.id}
                style={styles.nearbyRow}
                onPress={() => connectToDevice(d.id)}
              >
                <Icon name="bluetooth" size={15} color={colors.textMuted} />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.nearbyName}>{d.name}</Text>
                  <Text style={styles.nearbyMeta}>RSSI {d.rssi} dBm</Text>
                </View>
                <MonoLabel color={colors.blue}>CONNECT →</MonoLabel>
              </TouchableOpacity>
            ))}
          </>
        )}

        {/* Protocol */}
        <MonoLabel color={colors.textDim} style={{ marginTop: s.xxl }}>
          BLUETOOTH PROTOCOL
        </MonoLabel>
        <Text style={styles.protocolNote}>
          Compatible with the Omi firmware reference (MIT licensed).
        </Text>
        {[
          ["Main service", OMI_PROTOCOL.MAIN_SERVICE_UUID],
          ["Button trigger", OMI_PROTOCOL.BUTTON_TRIGGER_CHARACTERISTIC_UUID],
          ["Battery service", STANDARD_BLE.BATTERY_SERVICE_UUID],
          ["Audio stream", OMI_PROTOCOL.AUDIO_DATA_STREAM_CHARACTERISTIC_UUID],
        ].map(([label, uuid]) => (
          <View key={label} style={styles.gattRow}>
            <Text style={styles.gattName}>{label}</Text>
            <Text style={styles.gattUuid} numberOfLines={1}>
              {uuid}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingTop: s.xl,
  },
  identityRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: s.sm,
    marginBottom: 8,
  },
  statusChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    paddingHorizontal: 9,
    paddingVertical: 5,
    backgroundColor: colors.surfaceElevated,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  metricsBlock: {
    marginTop: s.xxl,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  metricRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  metricRowLast: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 13,
  },
  metricLabel: {
    color: colors.textDim,
    fontSize: 14,
  },
  metricValue: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: "500",
    fontVariant: ["tabular-nums"],
  },
  actionsStack: {
    marginTop: s.xxl,
  },
  nearbyRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  nearbyName: {
    color: colors.ink,
    fontSize: 14.5,
    fontWeight: "500",
  },
  nearbyMeta: {
    color: colors.textDim,
    fontSize: 12,
    marginTop: 1,
  },
  protocolNote: {
    color: colors.textDim,
    fontSize: 12.5,
    marginTop: 6,
    marginBottom: s.sm,
  },
  gattRow: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  gattName: {
    color: colors.textMuted,
    fontSize: 12.5,
  },
  gattUuid: {
    color: colors.textDim,
    fontSize: 11,
    fontFamily: Platform.select({ ios: "Menlo", android: "monospace", default: "monospace" }),
    marginTop: 3,
  },
});
