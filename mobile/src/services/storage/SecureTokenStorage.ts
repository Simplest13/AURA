/**
 * Secure token storage with platform-aware fallbacks.
 * Native: expo-secure-store (Keychain / Keystore) when the package is installed.
 * Web:    localStorage (the browser's only option; tokens are session-scoped JWTs).
 * Falls back to plain AsyncStorage (via StorageService) if SecureStore is unavailable.
 */

import { Platform } from "react-native";
import { StorageService } from "./StorageService";

interface SecureStoreLike {
  getItemAsync(key: string): Promise<string | null>;
  setItemAsync(key: string, value: string): Promise<void>;
  deleteItemAsync(key: string): Promise<void>;
}

const TOKEN_KEY = "aura_auth_token";

function getSecureStore(): SecureStoreLike | null {
  if (Platform.OS === "web") return null;
  try {
    // Optional dependency — resolved only on native builds that have it installed
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const SecureStore = require("expo-secure-store");
    return SecureStore?.default ?? SecureStore;
  } catch {
    return null;
  }
}

export const SecureTokenStorage = {
  /** Save the JWT. Passwords must NEVER be passed to this (or any) storage. */
  async setToken(token: string): Promise<void> {
    const secure = getSecureStore();
    if (secure) {
      try {
        await secure.setItemAsync(TOKEN_KEY, token);
        return;
      } catch {
        // fall through to storage fallback
      }
    }
    await StorageService.setItem(TOKEN_KEY, token);
  },

  async getToken(): Promise<string | null> {
    const secure = getSecureStore();
    if (secure) {
      try {
        const value = await secure.getItemAsync(TOKEN_KEY);
        if (value) return value;
      } catch {
        // fall through to storage fallback
      }
    }
    const value = await StorageService.getItem<string>(TOKEN_KEY);
    return typeof value === "string" ? value : null;
  },

  async clearToken(): Promise<void> {
    const secure = getSecureStore();
    if (secure) {
      try {
        await secure.deleteItemAsync(TOKEN_KEY);
      } catch {
        // ignore
      }
    }
    await StorageService.removeItem(TOKEN_KEY);
  },
};
