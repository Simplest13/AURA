import {
  IBleService,
  DeviceInfo,
  WearableEvent,
  WearableEventListener,
  STANDARD_BLE,
  OMI_PROTOCOL,
} from "../../types/device";

/**
 * Mock BLE Service for development and offline testing.
 * Simulates discovery, connection, battery updates, and button presses.
 */
export class MockBleService implements IBleService {
  private listeners: Set<WearableEventListener> = new Set();
  private isScanning = false;
  private connectedDeviceId: string | null = "AURA-VIRTUAL-01";
  private batteryLevel = 87;
  private scanTimer?: ReturnType<typeof setTimeout>;

  private mockDevices: DeviceInfo[] = [
    {
      id: "AURA-VIRTUAL-01",
      name: "AURA Wearable",
      rssi: -58,
      batteryLevel: 87,
      firmwareVersion: "3.0.8",
      isConnected: true,
    },
    {
      id: "OMI-DEVICE-A8",
      name: "Omi Dev Board",
      rssi: -72,
      batteryLevel: 64,
      firmwareVersion: "3.0.4",
      isConnected: false,
    },
  ];

  async scan(onDeviceFound: (device: DeviceInfo) => void, timeoutMs = 4000): Promise<void> {
    this.isScanning = true;
    let index = 0;

    const interval = setInterval(() => {
      if (!this.isScanning || index >= this.mockDevices.length) {
        clearInterval(interval);
        return;
      }
      onDeviceFound(this.mockDevices[index]);
      index++;
    }, 600);

    return new Promise((resolve) => {
      this.scanTimer = setTimeout(() => {
        this.isScanning = false;
        clearInterval(interval);
        resolve();
      }, timeoutMs);
    });
  }

  stopScan(): void {
    this.isScanning = false;
    if (this.scanTimer) {
      clearTimeout(this.scanTimer);
    }
  }

  async connect(deviceId: string): Promise<DeviceInfo> {
    await new Promise((res) => setTimeout(res, 800));
    const device = this.mockDevices.find((d) => d.id === deviceId) || {
      id: deviceId,
      name: "AURA Wearable",
      rssi: -62,
      batteryLevel: this.batteryLevel,
      firmwareVersion: "3.0.8",
      isConnected: true,
    };

    this.connectedDeviceId = deviceId;
    this.emitEvent({ type: "DEVICE_CONNECTED", device: { ...device, isConnected: true } });
    return { ...device, isConnected: true };
  }

  async disconnect(): Promise<void> {
    await new Promise((res) => setTimeout(res, 300));
    this.connectedDeviceId = null;
    this.emitEvent({ type: "DEVICE_DISCONNECTED", reason: "User requested disconnect" });
  }

  async discoverServices(): Promise<string[]> {
    return [
      STANDARD_BLE.BATTERY_SERVICE_UUID,
      STANDARD_BLE.DEVICE_INFO_SERVICE_UUID,
      OMI_PROTOCOL.MAIN_SERVICE_UUID,
      OMI_PROTOCOL.BUTTON_SERVICE_UUID,
    ];
  }

  async readCharacteristic(serviceUuid: string, characteristicUuid: string): Promise<Uint8Array> {
    if (characteristicUuid === STANDARD_BLE.BATTERY_LEVEL_CHARACTERISTIC_UUID) {
      return new Uint8Array([this.batteryLevel]);
    }
    if (characteristicUuid === STANDARD_BLE.FIRMWARE_REVISION_CHARACTERISTIC_UUID) {
      return new TextEncoder().encode("3.0.8");
    }
    return new Uint8Array([0]);
  }

  async writeCharacteristic(
    _serviceUuid: string,
    _characteristicUuid: string,
    _data: Uint8Array
  ): Promise<void> {
    // Mock write acknowledges instantly
  }

  subscribeToCharacteristic(
    _serviceUuid: string,
    _characteristicUuid: string,
    _onData: (data: Uint8Array) => void
  ): () => void {
    // Returns dummy unsubscribe
    return () => {};
  }

  async getBatteryLevel(): Promise<number> {
    return this.batteryLevel;
  }

  addEventListener(listener: WearableEventListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Triggers virtual wearable button click.
   * Emits BUTTON_PRESSED and automatically follows with BUTTON_RELEASED.
   */
  simulateButtonPress(): void {
    const now = Date.now();
    this.emitEvent({ type: "BUTTON_PRESSED", timestamp: now });

    setTimeout(() => {
      this.emitEvent({ type: "BUTTON_RELEASED", timestamp: Date.now() });
    }, 250);
  }

  simulateBatteryChange(newLevel: number): void {
    this.batteryLevel = Math.max(0, Math.min(100, newLevel));
    this.emitEvent({ type: "BATTERY_CHANGED", level: this.batteryLevel });
  }

  private emitEvent(event: WearableEvent): void {
    this.listeners.forEach((listener) => {
      try {
        listener(event);
      } catch (err) {
        console.error("Error in MockBleService listener:", err);
      }
    });
  }
}
