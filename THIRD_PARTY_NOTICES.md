# Third-Party Software Notices and Licenses

This project, AURA ("A wearable system integrating artificial intelligence to enable intuitive and real-time voice-based interaction"), incorporates technical references and adapted protocol constants from third-party open-source software under license.

---

## 1. Omi (Based Hardware)

Portions of this software (specifically the BLE GATT service/characteristic UUIDs, button notification stream pattern, and BLE device metadata constants in `mobile/src/types/device.ts` and `docs/ble-protocol.md`) are adapted from the Omi open-source project:

- **Project URL**: https://github.com/BasedHardware/omi
- **Original Authors**: Copyright (c) 2024 Based Hardware Contributors
- **License**: MIT License

### MIT License Text:
```text
MIT License

Copyright (c) 2024 Based Hardware

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 2. Bluetooth SIG Standard Profiles

Standard Bluetooth SIG UUIDs used in AURA:
- **Battery Service**: UUID `0x180F` (`0000180f-0000-1000-8000-00805f9b34fb`)
- **Battery Level Characteristic**: UUID `0x2A19` (`00002a19-0000-1000-8000-00805f9b34fb`)
- **Device Information Service**: UUID `0x180A` (`0000180a-0000-1000-8000-00805f9b34fb`)
- **Firmware Revision Characteristic**: UUID `0x2A26` (`00002a26-0000-1000-8000-00805f9b34fb`)
