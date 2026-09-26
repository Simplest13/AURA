/**
 * AURA Mobile Core Domain & Pipeline Verification Test
 */

const assert = require("assert");

console.log("=========================================");
console.log("   RUNNING AURA MOBILE CORE TESTS        ");
console.log("=========================================");

// 1. Test Mock BLE Service
const { MockBleService } = require("../src/services/ble/MockBleService");
const ble = new MockBleService();

let buttonEventFired = false;
let batteryChanged = false;

const unsubscribe = ble.addEventListener((event) => {
  if (event.type === "BUTTON_PRESSED") {
    buttonEventFired = true;
  }
  if (event.type === "BATTERY_CHANGED") {
    batteryChanged = true;
  }
});

// Test button simulation
ble.simulateButtonPress();
assert.strictEqual(buttonEventFired, true, "Wearable button event should fire");
console.log("✓ MockBleService: simulateButtonPress emits BUTTON_PRESSED");

// Test battery simulation
ble.simulateBatteryChange(92);
assert.strictEqual(batteryChanged, true, "Battery change event should fire");
console.log("✓ MockBleService: simulateBatteryChange emits BATTERY_CHANGED");

// 2. Test Omi GATT protocol UUID constants
const { OMI_PROTOCOL, STANDARD_BLE } = require("../src/types/device");
assert.strictEqual(
  OMI_PROTOCOL.MAIN_SERVICE_UUID,
  "19b10000-e8f2-537e-4f6c-d104768a1214",
  "Omi Main Service UUID matches technical reference"
);
assert.strictEqual(
  OMI_PROTOCOL.BUTTON_TRIGGER_CHARACTERISTIC_UUID,
  "23ba7925-0000-1000-7450-346eac492e92",
  "Omi Button Trigger Characteristic UUID matches technical reference"
);
assert.strictEqual(
  STANDARD_BLE.BATTERY_SERVICE_UUID,
  "0000180f-0000-1000-8000-00805f9b34fb",
  "Standard Battery Service UUID matches Bluetooth SIG"
);
console.log("✓ Protocol Constants: Omi GATT UUIDs and standard Bluetooth SIG UUIDs verified");

// 3. Test Mock Data & Deterministic Answers
const { MOCK_AI_RESPONSES, MOCK_MEMORIES } = require("../src/utils/mockData");
assert.ok(MOCK_AI_RESPONSES.tcp_udp.includes("TCP is a connection-oriented"), "TCP/UDP mock answer verified");
assert.ok(MOCK_AI_RESPONSES.binary_search.includes("Binary search is an efficient"), "Binary search mock answer verified");
assert.ok(MOCK_AI_RESPONSES.entropy.includes("Entropy measures the degree of disorder"), "Entropy mock answer verified");
console.log("✓ Mock Data: Academic deterministic responses verified");

unsubscribe();
console.log("=========================================");
console.log("   ALL MOBILE CORE TESTS PASSED!         ");
console.log("=========================================");
