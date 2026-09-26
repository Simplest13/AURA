/**
 * AURA BLE Manager
 * Singleton manager coordinating BLE communication between the physical/mock wearable,
 * the device store, and the voice interaction pipeline.
 */

import { USE_MOCK_BLE } from "../../config/env";
import { IBleService, DeviceInfo, WearableEvent } from "../../types/device";
import { MockBleService } from "./MockBleService";
import { RealBleService } from "./RealBleService";
import { useDeviceStore } from "../../stores/deviceStore";
import { useVoiceStore } from "../../stores/voiceStore";

class BleManagerClass {
  private service: IBleService;
  private isInitialized = false;
  private unsubscribeListener?: () => void;

  constructor() {
    this.service = USE_MOCK_BLE ? new MockBleService() : new RealBleService();
    this.init();
  }

  public init(): void {
    if (this.isInitialized) return;
    this.isInitialized = true;

    // Attach event listener
    this.unsubscribeListener = this.service.addEventListener((event: WearableEvent) => {
      this.handleWearableEvent(event);
    });

    console.log(`[BleManager] Initialized in ${USE_MOCK_BLE ? "MOCK" : "HARDWARE"} mode`);
  }

  private handleWearableEvent(event: WearableEvent): void {
    const deviceStore = useDeviceStore.getState();
    const voiceStore = useVoiceStore.getState();

    switch (event.type) {
      case "BUTTON_PRESSED":
        console.log("[BleManager] Wearable button pressed -> triggering voice session");
        // Trigger voice interaction from wearable hardware button
        if (voiceStore.state === "idle") {
          voiceStore.startSession();
        } else if (voiceStore.state === "listening") {
          voiceStore.commitListening();
        }
        break;

      case "BUTTON_RELEASED":
        console.log("[BleManager] Wearable button released");
        break;

      case "BATTERY_CHANGED":
        deviceStore.updateBattery(event.level);
        break;

      case "DEVICE_CONNECTED":
        deviceStore.setConnectedDevice(event.device);
        break;

      case "DEVICE_DISCONNECTED":
        deviceStore.disconnectDevice();
        break;
    }
  }

  public async scan(onDeviceFound?: (device: DeviceInfo) => void, timeoutMs?: number): Promise<void> {
    const deviceStore = useDeviceStore.getState();
    deviceStore.setScanning(true);

    return this.service.scan((device) => {
      deviceStore.addDiscoveredDevice(device);
      onDeviceFound?.(device);
    }, timeoutMs).finally(() => {
      deviceStore.setScanning(false);
    });
  }

  public stopScan(): void {
    this.service.stopScan();
    useDeviceStore.getState().setScanning(false);
  }

  public async connect(deviceId: string): Promise<DeviceInfo> {
    const deviceStore = useDeviceStore.getState();
    try {
      const device = await this.service.connect(deviceId);
      deviceStore.setConnectedDevice(device);
      return device;
    } catch (err: any) {
      console.error("[BleManager] Connection failed:", err);
      throw err;
    }
  }

  public async disconnect(): Promise<void> {
    await this.service.disconnect();
    useDeviceStore.getState().disconnectDevice();
  }

  public async getBatteryLevel(): Promise<number> {
    return this.service.getBatteryLevel();
  }

  public simulateButtonPress(): void {
    if (this.service instanceof MockBleService) {
      this.service.simulateButtonPress();
    }
  }

  public simulateBatteryChange(level: number): void {
    if (this.service instanceof MockBleService) {
      this.service.simulateBatteryChange(level);
    }
  }

  public destroy(): void {
    this.unsubscribeListener?.();
    this.isInitialized = false;
  }
}

export const BleManager = new BleManagerClass();

