# AURA — Wearable AI Study Assistant

AURA is a voice-first AI study companion for university students. Talk to it (voice or text) and it answers with **Groq-powered AI grounded in your long-term memory**, records & summarizes your **lectures into structured notes**, ingests **PDFs into a queryable knowledge base**, and manages **academic tasks & reminders**. It is designed to pair with a wearable pendant (Omi-compatible GATT protocol) that triggers the assistant with a button press — currently simulated virtually.

## Project Structure

```
AURA/
├── backend/     Express + TypeScript REST & WebSocket API (the brain's server)
├── mobile/      Expo / React Native app (the primary product)
├── frontend/    Vite + React 19 web dashboard (companion view)
└── docs/        Architecture & module documentation
```

Three clients share **one backend** and one database (PostgreSQL with an in-memory dev fallback).

## Feature Matrix

| Feature | Status |
|---|---|
| Groq AI chat (multi-turn, memory-grounded, markdown replies) | ✅ Real |
| Speech-to-text (Groq Whisper `whisper-large-v3-turbo`) | ✅ Real |
| Lecture recording → transcript → AI notes & summary | ✅ Real |
| PDF ingestion + grounded Q&A | ✅ Real |
| Auth (JWT, persisted sessions) | ✅ Real |
| Tasks / Reminders sync (PostgreSQL) | ✅ Real |
| Voice output | ✅ Real (browser TTS; ElevenLabs wired server-side) |
| AURA wearable hardware | 🟡 Virtual by design (full BLE/GATT simulation, one-file swap for real hardware) |

## Quick Start

### 1. Backend (port 4000)

```bash
cd backend
npm install
cp .env.example .env        # then fill in at least GROQ_API_KEY
npm start                   # ts-node src/server.ts
```

Required `.env` keys:

```
PORT=4000
USE_MOCK_AI=false
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/aura_db
JWT_SECRET=<32+ chars>
GROQ_API_KEY=<your key>              # powers chat AND Whisper STT
# Optional upgrades:
DEEPGRAM_API_KEY=<key>               # alternative STT
ELEVENLABS_API_KEY=<key>             # studio TTS
ELEVENLABS_VOICE_ID=<voice id>
```

No PostgreSQL? The backend automatically falls back to an in-memory repository.

### 2. Mobile app (port 8081)

```bash
cd mobile
npm install
cp .env.example .env        # EXPO_PUBLIC_USE_MOCK_AI=false for live AI
npm start                   # expo start --web (or scan QR for device)
```

- **Web browser:** opens at `http://localhost:8081` — API URLs are platform-aware (localhost on web, `10.0.2.2` on Android emulator).
- **Physical device:** set `EXPO_PUBLIC_API_BASE_URL=http://<your-LAN-IP>:4000` in `mobile/.env`.
- Log in with any email/password, or tap **⚡ Quick Demo Mode Login**.

### 3. Web dashboard (optional)

```bash
cd frontend
npm install
npm run dev
```

## Tests

```bash
cd mobile   && npm test        # 15 verification tests (BLE, voice FSM, mock AI)
cd backend  && npm test        # live API integration test (needs backend running)
```

## Documentation

| Doc | Contents |
|---|---|
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Full system architecture, module map, design decisions |
| [docs/BACKEND.md](docs/BACKEND.md) | Every route, service, and the provider fallback chains |
| [docs/MOBILE.md](docs/MOBILE.md) | Screens, navigation, stores, services, design system |
| [docs/FRONTEND.md](docs/FRONTEND.md) | Web dashboard structure |
| [docs/DATA-FLOWS.md](docs/DATA-FLOWS.md) | Step-by-step request flows for the three core features |

## Tech Stack

- **Backend:** Node, Express 4, TypeScript, PostgreSQL (`pg`) + in-memory fallback, `ws`, `multer`, `pdf-parse`, `node-fetch`
- **Mobile:** Expo ~57, React Native 0.81, TypeScript, Zustand 5, AsyncStorage, react-native-web
- **Frontend:** Vite 8, React 19, Axios
- **AI providers:** Groq (chat `openai/gpt-oss-20b` + Whisper STT), OpenAI/Claude fallbacks, Deepgram, ElevenLabs
