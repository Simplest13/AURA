/**
 * AURA Mobile Runtime Configuration
 */

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

export const API_BASE_URL: string =
  process.env.EXPO_PUBLIC_API_BASE_URL || "http://10.0.2.2:4000";

export const WEBSOCKET_URL: string =
  process.env.EXPO_PUBLIC_WEBSOCKET_URL || "ws://10.0.2.2:4000/ws/voice";
