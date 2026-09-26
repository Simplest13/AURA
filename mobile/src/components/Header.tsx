import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from "react-native";
import { colors, radii } from "../theme/tokens";
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
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
        )}
        <View>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle} · AI study assistant</Text> : null}
        </View>
      </View>

      <View style={styles.rightSection}>
        {showDeviceBadge && (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onDeviceBadgePress}
            style={[
              styles.deviceBadge,
              isConnected ? styles.deviceConnected : styles.deviceDisconnected,
            ]}
          >
            <View
              style={[
                styles.deviceDot,
                { backgroundColor: isConnected ? colors.success : colors.warning },
              ]}
            />
            <Text style={styles.deviceText}>
              {isConnected ? `${batteryLevel}%` : "Offline"}
            </Text>
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
    paddingTop: 16,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
    backgroundColor: colors.bg,
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  backBtn: {
    marginRight: 12,
    paddingHorizontal: 4,
  },
  backIcon: {
    color: colors.text1,
    fontSize: 28,
    fontWeight: "300",
    lineHeight: 30,
  },
  title: {
    color: colors.text1,
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  subtitle: {
    color: colors.text3,
    fontSize: 11.5,
    marginTop: 2,
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  deviceBadge: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: radii.full,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    gap: 5,
  },
  deviceConnected: {
    backgroundColor: colors.surface2,
    borderColor: colors.border,
  },
  deviceDisconnected: {
    backgroundColor: colors.warningSoft,
    borderColor: colors.warning,
  },
  deviceDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  deviceText: {
    color: colors.text2,
    fontSize: 11,
    fontWeight: "600",
  },
});
