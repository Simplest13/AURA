/**
 * AURA Mobile Runtime Configuration
 */

import { Platform } from "react-native";

const parseBooleanEnv = (value: string | undefined, fallback: boolean): boolean => {
  if (value === undefined) return fallback;

  const normalized = value.trim().toLowerCase();
  if (["false", "0", "off", "no"].includes(normalized)) return false;
  if (["true", "1", "on", "yes"].includes(normalized)) return true;
  return fallback;
};

export const USE_MOCK_AI: boolean = parseBooleanEnv(
  process.env.EXPO_PUBLIC_USE_MOCK_AI,
  true
);

export const USE_MOCK_BLE: boolean = parseBooleanEnv(
  process.env.EXPO_PUBLIC_USE_MOCK_BLE,
  true
);

//
// Backend host defaults per platform:
// - Web (browser on the same machine as the backend): localhost
// - Android emulator: 10.0.2.2 (special alias for the host machine)
// - Physical device: set EXPO_PUBLIC_API_BASE_URL to your machine's LAN IP
//
const DEFAULT_API_BASE_URL =
  Platform.OS === "web" ? "http://localhost:4000" : "http://10.0.2.2:4000";
const DEFAULT_WEBSOCKET_URL =
  Platform.OS === "web"
    ? "ws://localhost:4000/ws/voice"
    : "ws://10.0.2.2:4000/ws/voice";

export const API_BASE_URL: string =
  process.env.EXPO_PUBLIC_API_BASE_URL || DEFAULT_API_BASE_URL;

export const WEBSOCKET_URL: string =
  process.env.EXPO_PUBLIC_WEBSOCKET_URL || DEFAULT_WEBSOCKET_URL;
