/**
 * AURA BLE Service Interface & Base Types
 */

import { DeviceInfo, WearableEventListener, IBleService } from "../../types/device";

export type { IBleService, DeviceInfo, WearableEventListener };
export { STANDARD_BLE, OMI_PROTOCOL, ConnectionState } from "../../types/device";

export interface BleService extends IBleService {}

