/**
 * useBle Hook
 * Convenient hook for screens to interact with wearable BLE hardware and state.
 */

import { useDeviceStore } from "../stores/deviceStore";
import { BleManager } from "../services/ble/BleManager";
import { ConnectionState } from "../types/device";

export const useBle = () => {
  const {
    connectionState,
    currentDevice,
    batteryLevel,
    signalStrength,
    firmwareVersion,
    discoveredDevices,
    isScanning,
    lastError,
    scanForDevices,
    connectToDevice,
    disconnect,
    simulateButtonPress,
  } = useDeviceStore();

  const isConnected = connectionState === ConnectionState.CONNECTED;

  return {
    connectionState,
    isConnected,
    currentDevice,
    batteryLevel,
    signalStrength,
    firmwareVersion,
    discoveredDevices,
    isScanning,
    lastError,
    scan: scanForDevices,
    stopScan: () => BleManager.stopScan(),
    connect: connectToDevice,
    disconnect,
    simulateButtonPress,
  };
};

