import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Storage abstraction with resilient in-memory fallback
 */
export class StorageService {
  private static memoryFallback = new Map<string, string>();

  static async setItem(key: string, value: any): Promise<void> {
    const serialized = JSON.stringify(value);
    this.memoryFallback.set(key, serialized);
    try {
      await AsyncStorage.setItem(key, serialized);
    } catch {
      // Memory fallback remains intact
    }
  }

  static async getItem<T>(key: string): Promise<T | null> {
    try {
      const value = await AsyncStorage.getItem(key);
      if (value !== null) return JSON.parse(value);
    } catch {
      // Fallback
    }

    const fallback = this.memoryFallback.get(key);
    return fallback ? JSON.parse(fallback) : null;
  }

  static async removeItem(key: string): Promise<void> {
    this.memoryFallback.delete(key);
    try {
      await AsyncStorage.removeItem(key);
    } catch {
      // Ignored
    }
  }
}
