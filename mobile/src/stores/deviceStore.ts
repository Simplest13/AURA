import { create } from "zustand";
import { ConnectionState, DeviceInfo, WearableEvent } from "../types/device";
import { MockBleService } from "../services/ble/MockBleService";

interface DeviceStoreState {
  connectionState: ConnectionState;
  currentDevice: DeviceInfo | null;
  batteryLevel: number | null;
  signalStrength: number | null;
  firmwareVersion: string | null;
  discoveredDevices: DeviceInfo[];
  isScanning: boolean;
  lastError: string | null;

  // Actions
  scanForDevices: () => Promise<void>;
  connectToDevice: (deviceId: string) => Promise<void>;
  disconnect: () => Promise<void>;
  simulateButtonPress: () => void;
  onWearableButtonPress: (handler: () => void) => () => void;

  // Internal/BleManager sync helpers
  setScanning: (scanning: boolean) => void;
  addDiscoveredDevice: (device: DeviceInfo) => void;
  setConnectedDevice: (device: DeviceInfo) => void;
  updateBattery: (level: number) => void;
  disconnectDevice: () => void;
}

const mockBle = new MockBleService();
const buttonHandlers = new Set<() => void>();

export const useDeviceStore = create<DeviceStoreState>((set) => ({
  // Default connected to virtual wearable in mock mode
  connectionState: ConnectionState.CONNECTED,
  currentDevice: {
    id: "AURA-VIRTUAL-01",
    name: "AURA Wearable",
    rssi: -58,
    batteryLevel: 87,
    firmwareVersion: "3.0.8",
    isConnected: true,
  },
  batteryLevel: 87,
  signalStrength: -58,
  firmwareVersion: "3.0.8",
  discoveredDevices: [],
  isScanning: false,
  lastError: null,

  setScanning: (isScanning: boolean) => {
    set({
      isScanning,
      connectionState: isScanning ? ConnectionState.SCANNING : ConnectionState.CONNECTED,
    });
  },

  addDiscoveredDevice: (device: DeviceInfo) => {
    set((state) => ({
      discoveredDevices: [...state.discoveredDevices.filter((d) => d.id !== device.id), device],
    }));
  },

  setConnectedDevice: (device: DeviceInfo) => {
    set({
      connectionState: ConnectionState.CONNECTED,
      currentDevice: device,
      batteryLevel: device.batteryLevel ?? 87,
      signalStrength: device.rssi ?? -60,
      firmwareVersion: device.firmwareVersion ?? "3.0.8",
      lastError: null,
    });
  },

  updateBattery: (level: number) => {
    set({ batteryLevel: level });
  },

  disconnectDevice: () => {
    set({
      connectionState: ConnectionState.DISCONNECTED,
      currentDevice: null,
      batteryLevel: null,
      signalStrength: null,
    });
  },

  scanForDevices: async () => {
    set({ connectionState: ConnectionState.SCANNING, isScanning: true, discoveredDevices: [], lastError: null });
    try {
      await mockBle.scan((device) => {
        set((state) => ({
          discoveredDevices: [...state.discoveredDevices.filter((d) => d.id !== device.id), device],
        }));
      });
      set({ connectionState: ConnectionState.DISCONNECTED, isScanning: false });
    } catch (err) {
      set({
        connectionState: ConnectionState.ERROR,
        isScanning: false,
        lastError: err instanceof Error ? err.message : "BLE Scan failed",
      });
    }
  },

  connectToDevice: async (deviceId: string) => {
    set({ connectionState: ConnectionState.CONNECTING, lastError: null });
    try {
      const device = await mockBle.connect(deviceId);
      set({
        connectionState: ConnectionState.CONNECTED,
        currentDevice: device,
        batteryLevel: device.batteryLevel,
        signalStrength: device.rssi,
        firmwareVersion: device.firmwareVersion,
      });
    } catch (err) {
      set({
        connectionState: ConnectionState.ERROR,
        lastError: err instanceof Error ? err.message : "BLE Connect failed",
      });
    }
  },

  disconnect: async () => {
    await mockBle.disconnect();
    set({
      connectionState: ConnectionState.DISCONNECTED,
      currentDevice: null,
      batteryLevel: null,
      signalStrength: null,
    });
  },

  simulateButtonPress: () => {
    mockBle.simulateButtonPress();
    buttonHandlers.forEach((handler) => {
      try {
        handler();
      } catch (e) {
        console.error("Error executing wearable button handler:", e);
      }
    });
  },

  onWearableButtonPress: (handler: () => void) => {
    buttonHandlers.add(handler);
    return () => {
      buttonHandlers.delete(handler);
    };
  },
}));
