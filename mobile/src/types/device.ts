/**
 * Wearable Device Types & BLE Protocol Specification
 *
 * Adapted from inspection of the Omi wearable project
 * (https://github.com/BasedHardware/omi, MIT License, Copyright (c) 2024 Based Hardware Contributors).
 * Full license text is preserved in THIRD_PARTY_NOTICES.md at the project root.
 */

export enum ConnectionState {
  DISCONNECTED = "DISCONNECTED",
  SCANNING = "SCANNING",
  CONNECTING = "CONNECTING",
  CONNECTED = "CONNECTED",
  ERROR = "ERROR",
}

export type WearableEventType =
  | "BUTTON_PRESSED"
  | "BUTTON_RELEASED"
  | "BATTERY_CHANGED"
  | "DEVICE_CONNECTED"
  | "DEVICE_DISCONNECTED"
  | "AUDIO_DATA";

export type WearableEvent =
  | { type: "BUTTON_PRESSED"; timestamp: number }
  | { type: "BUTTON_RELEASED"; timestamp: number }
  | { type: "BATTERY_CHANGED"; level: number }
  | { type: "DEVICE_CONNECTED"; device: DeviceInfo }
  | { type: "DEVICE_DISCONNECTED"; reason?: string }
  | { type: "AUDIO_DATA"; chunk: Uint8Array };

export interface DeviceInfo {
  id: string;
  name: string;
  rssi: number | null; // Signal strength in dBm (-50 to -90)
  batteryLevel: number | null; // 0 - 100 percentage
  firmwareVersion: string | null;
  isConnected: boolean;
}

export type WearableEventListener = (event: WearableEvent) => void;

/**
 * Standard Bluetooth SIG Specifications (Public standard, 16-bit short UUIDs expanded to 128-bit)
 */
export const STANDARD_BLE = {
  BATTERY_SERVICE_UUID: "0000180f-0000-1000-8000-00805f9b34fb",
  BATTERY_LEVEL_CHARACTERISTIC_UUID: "00002a19-0000-1000-8000-00805f9b34fb",
  DEVICE_INFO_SERVICE_UUID: "0000180a-0000-1000-8000-00805f9b34fb",
  FIRMWARE_REVISION_CHARACTERISTIC_UUID: "00002a26-0000-1000-8000-00805f9b34fb",
} as const;

/**
 * OMI Wearable GATT Protocol Constants
 * Adapted from Omi firmware & models.dart (MIT License)
 */
export const OMI_PROTOCOL = {
  // Main Wearable Service
  MAIN_SERVICE_UUID: "19b10000-e8f2-537e-4f6c-d104768a1214",
  AUDIO_DATA_STREAM_CHARACTERISTIC_UUID: "19b10001-e8f2-537e-4f6c-d104768a1214",
  AUDIO_CODEC_CHARACTERISTIC_UUID: "19b10002-e8f2-537e-4f6c-d104768a1214",

  // Physical Button Service
  BUTTON_SERVICE_UUID: "23ba7924-0000-1000-7450-346eac492e92",
  BUTTON_TRIGGER_CHARACTERISTIC_UUID: "23ba7925-0000-1000-7450-346eac492e92",
} as const;

/**
 * BLE Service Interface Contract
 * Both MockBleService and RealBleService implement this strictly.
 */
export interface IBleService {
  scan(onDeviceFound: (device: DeviceInfo) => void, timeoutMs?: number): Promise<void>;
  stopScan(): void;
  connect(deviceId: string): Promise<DeviceInfo>;
  disconnect(): Promise<void>;
  discoverServices(): Promise<string[]>;
  readCharacteristic(serviceUuid: string, characteristicUuid: string): Promise<Uint8Array>;
  writeCharacteristic(serviceUuid: string, characteristicUuid: string, data: Uint8Array): Promise<void>;
  subscribeToCharacteristic(
    serviceUuid: string,
    characteristicUuid: string,
    onData: (data: Uint8Array) => void
  ): () => void;
  getBatteryLevel(): Promise<number>;
  addEventListener(listener: WearableEventListener): () => void;
}
