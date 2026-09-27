# AURA — System Architecture

## 1. Bird's-Eye View

```
                        ┌──────────────────────────┐
                        │       AI PROVIDERS       │
                        │  Groq (chat + Whisper)   │
                        │  OpenAI / Claude (FB)    │
                        │  Deepgram (STT alt)      │
                        │  ElevenLabs (TTS)        │
                        └────────────▲─────────────┘
                                     │ HTTPS
┌──────────────┐   REST /api/*      ┌─────────────────────┐
│ Mobile (Expo)│◄──────────────────►│  BACKEND (Express)  │
│  primary     │   WS /ws/voice     │  routes             │
└──────────────┘                    │  services           │
                                    │  JWT auth           │
┌──────────────┐   REST /api/*      │  ┌───────────────┐  │
│ Web dashboard│◄──────────────────►│  │ PostgreSQL or │  │
│ (Vite+React) │                    │  │ in-memory     │  │
└──────────────┘                    │  └───────────────┘  │
                                    └─────────────────────┘
```

Three clients share one backend and one database. The **mobile app is the flagship**; the web dashboard is a lighter companion over the same API.

## 2. Repository Layout

```
AURA/
├── backend/                 Express + TypeScript API
│   └── src/
│       ├── server.ts        Bootstrap, middleware, route mounting
│       ├── config/          Env config (keys, models, flags)
│       ├── middleware/      JWT authenticate
│       ├── database/        PostgreSQL + in-memory fallback repository
│       ├── routes/          8 feature routes (HTTP surface)
│       ├── services/        ai / speech / tts / auth / websocket
│       └── utils/           Deterministic mock answers
├── mobile/                  Expo React Native app (flagship)
│   └── src/
│       ├── config/          Platform-aware API URLs + mock flags
│       ├── theme/           Colors, spacing, shadows, responsive hook
│       ├── types/           Domain models (chat, study, voice, device, auth)
│       ├── utils/           Markdown renderer, response normalizer, seeds
│       ├── services/        API client, AI/STT/TTS, BLE, storage, WebSocket
│       ├── stores/          6 Zustand stores (state + actions)
│       ├── navigation/      Auth gate → tabs + detail stack
│       ├── components/      20 reusable UI components
│       └── screens/         11 feature screens
└── frontend/                Vite + React 19 dashboard
    └── src/pages/           Health, Lectures, Reminders, Pdf, Login, Register
```

## 3. Design Decisions

| Decision | Why |
|---|---|
| **Provider fallback chains** (Groq → OpenAI → Claude; Whisper → Deepgram) | One expired key never kills the product; the AI service *throws honestly* instead of silently faking answers |
| **Repository pattern with in-memory fallback** | Zero-setup local development; PostgreSQL when available, same function surface either way |
| **Platform-aware API URLs** (`localhost` on web, `10.0.2.2` on Android emulator) | One codebase runs correctly in browser, emulator, and device |
| **Zustand stores per domain** | Small observable state slices with optimistic updates; no heavyweight state framework |
| **Multipart uploads** for audio/PDF | Avoids base64 body bloat (the original "request entity too large" bug) |
| **Virtual BLE behind an interface** | All wearable features work today; real hardware swaps in via one file (`RealBleService`) |
| **`USE_MOCK_AI` master switch** | Deterministic offline demos for grading/presenting without any API keys |
| **Zero-dependency markdown renderer** | AI replies render tables/headings/code identically on native and web without heavy libs |

## 4. Real vs Virtual

| Module | Status |
|---|---|
| AI chat, STT, lecture notes, PDF Q&A, auth, task sync | Real |
| Voice output | Real (browser TTS; ElevenLabs wired server-side) |
| Wearable hardware | Virtual by design — full BLE/GATT simulation |

## 5. Cross-Cutting Concerns

- **Auth:** JWT (`Authorization: Bearer`), 7-day expiry, bcrypt password hashing. All data routes are per-user via `req.userId`.
- **Persistence:** Chat history, tasks, reminders, lectures and documents are stored server-side; the mobile app additionally caches conversations/tasks locally (AsyncStorage) for offline resilience.
- **Error honesty:** Services surface real errors ("No speech detected", "Groq 401") rather than mock fallbacks when `USE_MOCK_AI=false`.
- **Type safety:** Strict TypeScript across all three packages.
