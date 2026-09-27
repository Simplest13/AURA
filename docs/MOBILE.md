# AURA — Mobile App Reference

Expo ~57 / React Native 0.81 / TypeScript. The flagship client. Port **8081** (web).

## Folder Map

```
mobile/src/
├── config/env.ts           Platform-aware URLs + mock flags
├── theme/                  colors, spacing, shadows, responsive (useLayout), tokens
├── types/                  chat, study, voice, device, auth, api
├── utils/
│   ├── markdown.tsx        Zero-dep markdown renderer
│   ├── normalize.ts        snake_case → camelCase response mapping
│   └── mockData.ts         Seed data for mock mode
├── services/
│   ├── api/ApiClient.ts    Central HTTP: JWT injection, timeouts, FormData
│   ├── ai/AIService.ts     Chat pipeline + local persistence
│   ├── ai/TranscriptionService.ts  Multipart audio upload + notes generation
│   ├── ai/VoiceService.ts  Listen → transcribe → AI → speak state machine
│   ├── ai/MockAIService.ts Deterministic offline answers
│   ├── speech/WebSpeechService.ts  Browser STT + TTS wrappers
│   ├── ble/                Wearable layer (interface + Mock + Real stub)
│   ├── storage/            AsyncStorage wrapper with memory fallback
│   └── websocket/          /ws/voice client
├── stores/                 6 Zustand stores
├── navigation/             App → Auth / Main → Tabs + detail stack
├── components/             20 reusable UI components
└── screens/                11 feature screens
```

## Navigation Flow

```
App boot (App.tsx hydrates auth/chat/study stores)
└── AppNavigator
    ├── not authenticated → AuthNavigator: Onboarding → Login / Register
    └── authenticated → MainNavigator
        ├── Tabs (custom BottomTabBar): Home · Voice · Chat · Study · Profile
        └── Detail stack: Device · Reminders · Lectures · Pdf · StudyPlanner
                          (+ aliases LectureRecorder / PdfSummarizer)
```

## Screens

| Screen | Features |
|---|---|
| **Splash** | Animated orb; waits for session restore; routes to tabs or onboarding |
| **Onboarding** | Name + focus-area selection; personalizes greeting |
| **Login / Register** | Real JWT auth, validation + error banner, one-tap **⚡ Quick Demo Login** |
| **Home** | Greeting, tap-to-talk orb → Voice, wearable status card, quick-tools grid, today's tasks, reminders, recent chats |
| **Chat** | Real Groq AI; threads modal (create/switch/delete), quick-prompt pills, typing indicator, **markdown-rendered replies** (tables, code, lists), 🔊 speak (browser TTS), localStorage persistence, Live/Offline mode banner |
| **Voice Cockpit** | State machine (idle→listening→thinking→speaking), pulsing AuraOrb + waveform, live transcript + AI answer card, demo query chips, Wearable Press trigger |
| **Lecture Recorder** | Real mic recording: red "● RECORDING — YOUR MIC IS LIVE" state, **live audio-level meter** (Web Audio RMS), staged processing (prepare → transcribe → generate → save) with detail text, **Groq Whisper** transcription, AI generates title + summary + takeaways + structured **markdown study notes**, cancel/retry, TTS playback of transcript, saved-lecture library |
| **PDF Summarizer** | File-picker upload → backend extraction → AI executive summary + key sections → **grounded Q&A** per document → knowledge library list |
| **Study Cockpit** | Weekly progress ring + bar, 4 module cards, priority tasks, upcoming reminders, knowledge library |
| **Study Planner** | Task CRUD (title/subject/deadline/priority), filter pills (all/active/completed), optimistic backend sync |
| **Reminders** | Reminder CRUD with tags, backend-synced |
| **Profile** | User card, sync status, long-term memory list (deletable), sign out (wipes session) |
| **Device Manager** | Wearable connection state, battery/RSSI/firmware metrics, BLE scan simulation, **GATT spec table** (Omi-derived UUIDs), simulate button press |

## Stores (Zustand)

| Store | State | Key behaviors |
|---|---|---|
| `authStore` | user, token, hydrated | Session persisted to storage; `hydrate()` restores on boot; login/logout/updateUser persist |
| `chatStore` | conversations, activeId, isSending, backendOffline | Optimistic message append; local persistence (AsyncStorage); honest offline message |
| `studyStore` | tasks, reminders, lectures, documents, isSyncing | **Optimistic sync**: local temp IDs → backend create → replace; toggle/delete sync best-effort; hydrate from cache then refresh |
| `voiceStore` | state machine, transcript, aiResponse, audioLevel, error | Drives orb/waveform; simulated level when native STT unavailable |
| `deviceStore` | connection, device, battery, RSSI, listeners | Mock BLE; `simulateButtonPress` fans out to registered handlers |
| `memoryStore` | memories | Long-term memories injected into AI context; delete supported |

## Services

### ApiClient
- Injects `Authorization: Bearer` from authStore (fallback to legacy storage key).
- 30s timeout via AbortController; uniform JSON/error parsing; 204 handling.
- `FormData` passthrough (PDF/audio uploads).
- `ensureSession()` — silent `/api/chat/demo-login` when no token, so protected endpoints work without an account.

### AIService + chatStore flow
```
sendMessage(text)
  → optimistic user bubble
  → AIService.query → ensureSession → ensure backend conversation
  → POST /api/chat/messages (memories + history server-side)
  → AI bubble + persist conversation list locally
  → on failure: honest offline message (no fake answers)
```

### VoiceService
- Web: real SpeechRecognition (partial + final results) → AI → speechSynthesis.
- Native/mock: simulated pipeline with deterministic demo answers.
- Every exchange is mirrored into the chat history.

### TranscriptionService
- `transcribeAudioBlob(blob)` — multipart `FormData` upload on web (base64 JSON fallback on native), size guards, provider-aware errors.
- `generateLectureNotes(transcript)` — strict-format AI prompt returning `TITLE / SUMMARY / TAKEAWAYS / NOTES`, parsed into structured fields.
- `getTranscriptionStatus()` — live STT engine name for the UI.

### BLE (wearable) layer
- `BleService` interface: scan / connect / disconnect / discoverServices / read+write+subscribe characteristics / battery / events.
- `MockBleService` — the **only intentionally virtual module**: simulates discovery (AURA Wearable + Omi Dev Board), connection delays, battery & firmware reads against standard + Omi GATT UUIDs, `simulateButtonPress()` emitting `BUTTON_PRESSED`/`BUTTON_RELEASED`.
- `RealBleService` — stub where native BLE (e.g. react-native-ble-plx) slots in. Everything downstream consumes the interface, so real hardware is a one-file swap.

## Design System

- **Palette** (`theme/colors.ts`): background `#07070D`, surfaces `#0F101A`/`#151625`, primary radiant violet `#7C3AED`, secondary indigo, cyan `#22D3EE`, coral `#FFAE85`, full status scale.
- **`tokens.ts`** — backward-compatible adapter (`colors.bg` → `colors.background`) so older code keeps working.
- **`responsive.ts` / `useLayout()`** — breakpoints: small phone <360, phone <768, tablet <1024, desktop ≥1024. Provides gutter, `contentMaxWidth` (≤780dp centered column), `tabBarMaxWidth`, grid columns.
- **AuraOrb** — multi-ring animated identity: breathing idle → coral pulse (listening) → rotation (thinking) → cyan expansion (speaking) → red (error). Scales with amplitude.
- **Layout rules** — centered content column with adaptive gutters; floating bottom tab bar is centered, max-width, and safe-area aware; chat bubbles cap at 72–85% width by breakpoint.

## Environment

```
EXPO_PUBLIC_USE_MOCK_AI=false        # live Groq pipeline when false
EXPO_PUBLIC_USE_MOCK_BLE=false       # virtual wearable regardless
# EXPO_PUBLIC_API_BASE_URL=          # set for physical devices (LAN IP)
# EXPO_PUBLIC_WEBSOCKET_URL=
```

Web defaults to `http://localhost:4000`; Android emulator to `http://10.0.2.2:4000` (host alias).
