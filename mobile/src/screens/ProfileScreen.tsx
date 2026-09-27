/**
 * ProfileScreen — editorial settings list.
 */

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../theme/colors";
import { spacing as s, radii } from "../theme/spacing";
import { useLayout } from "../theme/responsive";
import { Icon, IconName } from "../components/Icon";
import { SerifText, MonoLabel } from "../components/Typography";
import { useAuth } from "../hooks/useAuth";
import { useDeviceStore } from "../stores/deviceStore";

interface SettingsRowProps {
  icon: IconName;
  label: string;
  value?: string;
  onPress?: () => void;
  last?: boolean;
}

const SettingsRow: React.FC<SettingsRowProps> = ({ icon, label, value, onPress, last }) => (
  <TouchableOpacity
    activeOpacity={onPress ? 0.7 : 1}
    onPress={onPress}
    disabled={!onPress}
    style={[styles.settingsRow, !last && styles.settingsRowBordered]}
  >
    <Icon name={icon} size={16} color={colors.textMuted} />
    <Text style={styles.settingsLabel}>{label}</Text>
    {value ? <Text style={styles.settingsValue}>{value}</Text> : null}
    {onPress ? <Icon name="chevron-right" size={14} color={colors.textDim} /> : null}
  </TouchableOpacity>
);

export const ProfileScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { contentMaxWidth, gutter } = useLayout();
  const { user, logout } = useAuth();
  const { currentDevice } = useDeviceStore();

  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } finally {
      setIsLoggingOut(false);
    }
  };

  const memberSince = React.useMemo(() => {
    if (!user?.createdAt) return null;
    try {
      return new Date(user.createdAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
      });
    } catch {
      return null;
    }
  }, [user?.createdAt]);

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingHorizontal: gutter,
            maxWidth: contentMaxWidth,
            width: "100%",
            alignSelf: "center",
            paddingBottom: 110 + insets.bottom,
          },
        ]}
      >
        <MonoLabel color={colors.ink}>PROFILE</MonoLabel>

        {/* Identity */}
        <View style={styles.identityBlock}>
          <SerifText size={28} style={styles.userName}>
            {user?.name || "Student"}
          </SerifText>
          <Text style={styles.userEmail}>{user?.email || "—"}</Text>
          {memberSince ? (
            <MonoLabel color={colors.textDim} style={{ marginTop: 8 }}>
              MEMBER SINCE {memberSince.toUpperCase()}
            </MonoLabel>
          ) : null}
        </View>

        <View style={styles.rule} />

        {/* Account */}
        <MonoLabel color={colors.textDim}>ACCOUNT</MonoLabel>
        <View style={styles.group}>
          <SettingsRow icon="user" label="Personal information" onPress={() => {}} />
          <SettingsRow
            icon="watch"
            label="Device"
            value={currentDevice?.name || "AURA One"}
            onPress={() => navigation.navigate("Device")}
          />
          <SettingsRow icon="settings" label="Preferences" onPress={() => {}} last />
        </View>

        {/* Data */}
        <MonoLabel color={colors.textDim} style={{ marginTop: s.xl }}>
          YOUR DATA
        </MonoLabel>
        <View style={styles.group}>
          <SettingsRow
            icon="file-text"
            label="Documents"
            onPress={() => navigation.navigate("Pdf")}
          />
          <SettingsRow
            icon="book-open"
            label="Study data"
            onPress={() => navigation.navigate("StudyPlanner")}
            last
          />
        </View>

        {/* Logout */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() => void handleLogout()}
          disabled={isLoggingOut}
        >
          <Icon name="log-out" size={16} color={colors.error} />
          <Text style={styles.logoutText}>
            {isLoggingOut ? "Signing out…" : "Log out"}
          </Text>
        </TouchableOpacity>

        <MonoLabel color={colors.textDim} style={styles.versionText}>
          AURA · VERSION 1.0.0
        </MonoLabel>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingTop: s.xl,
  },
  identityBlock: {
    marginTop: s.md,
    marginBottom: s.xxl,
  },
  userName: {
    lineHeight: 34,
  },
  userEmail: {
    color: colors.textMuted,
    fontSize: 14,
    marginTop: 4,
  },
  rule: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: s.xl,
  },
  group: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    backgroundColor: colors.surfaceElevated,
    marginTop: s.sm,
  },
  settingsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: s.lg,
    paddingVertical: 13,
  },
  settingsRowBordered: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingsLabel: {
    color: colors.ink,
    fontSize: 14.5,
    flex: 1,
  },
  settingsValue: {
    color: colors.textDim,
    fontSize: 13,
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 13,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    backgroundColor: colors.surfaceElevated,
    marginTop: s.xxl,
  },
  logoutText: {
    color: colors.error,
    fontSize: 14,
    fontWeight: "500",
  },
  versionText: {
    textAlign: "center",
    marginTop: s.xl,
  },
});
