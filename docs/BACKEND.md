# AURA — Backend Reference

Express + TypeScript REST & WebSocket API. Default port **4000**.

## Module Map

```
backend/src/
├── server.ts                  App bootstrap: CORS, JSON (30MB), route mounts, /ws/voice
├── config/index.ts            Env config; dotenv override:true guards stray shell PORT
├── middleware/authenticate.ts JWT verify → req.userId
├── database/repository.ts     PostgreSQL pool + in-memory fallback (same API)
├── routes/                    8 feature routes (table below)
├── services/
│   ├── ai/index.ts            LLM orchestration + fallback chain
│   ├── speech/index.ts        STT providers (Groq Whisper / Deepgram / Mock)
│   ├── tts/index.ts           ElevenLabs TTS → base64 MP3 data URL
│   ├── auth.ts                bcrypt hashing, JWT issue
│   └── websocket/voiceSocket  Real-time voice pipeline on /ws/voice
└── utils/mockData.ts          Deterministic answers for USE_MOCK_AI=true
```

## HTTP API

| Route | Endpoint | Auth | Purpose |
|---|---|---|---|
| auth | `POST /api/auth/register` | — | Create account (bcrypt), returns JWT + user |
| auth | `POST /api/auth/login` | — | Verify credentials, returns JWT + user |
| auth | `GET /api/auth/me` | JWT | Session check |
| chat | `POST /api/chat/demo-login` | — | Guest JWT for the demo user (powers Quick Demo Login) |
| chat | `POST /api/chat` | — | Stateless one-shot AI question → `{reply}` |
| chat | `POST /api/chat/conversations` | JWT | Create conversation |
| chat | `GET /api/chat/conversations` | JWT | List conversations (with message counts) |
| chat | `GET /api/chat/conversations/:id/messages` | JWT | Full message history |
| chat | `DELETE /api/chat/conversations/:id` | JWT | Delete conversation |
| chat | `POST /api/chat/messages` | JWT | **Multi-turn chat**: memories + last 12 messages → Groq → persist both messages → `{userMessage, aiMessage}` |
| study | `POST/GET /api/study/tasks` | JWT | Task create / list |
| study | `PUT/DELETE /api/study/tasks/:id` | JWT | Toggle complete / edit / delete |
| reminders | `POST/GET /api/reminders` | JWT | Reminder create / list |
| reminders | `PUT/DELETE /api/reminders/:id` | JWT | Toggle / delete |
| lectures | `POST/GET /api/lectures/lectures` | JWT | Lecture record create / list |
| pdf | `POST /api/pdf/documents` | JWT | multipart field `pdf` (≤15MB) → pdf-parse extraction → AI summary → store text |
| pdf | `GET /api/pdf/documents` | JWT | Document library (metadata) |
| pdf | `POST /api/pdf/ask` | JWT | **Grounded Q&A**: answers only from the stored document text |
| transcription | `POST /api/transcription` | — | multipart field `audio` (≤25MB) or JSON `{audio: base64}` → `{transcript, provider}` |
| transcription | `GET /api/transcription/status` | — | Which STT engine is live |
| tts | `POST /api/tts` | JWT | `{text}` → `{audioUrl}` (base64 MP3 data URL) |
| health | `GET /health` | — | `{status:"ok"}` |

## Service Details

### services/ai — LLM orchestration

```
getAIChatResponse(messages)          multi-turn, used by /messages
  ├─ Groq  https://api.groq.com/openai/v1/chat/completions
  ├─ OpenAI https://api.openai.com/v1/chat/completions   (fallback)
  ├─ Claude https://api.anthropic.com/v1/messages        (fallback)
  └─ throws if ALL fail → caller decides (no silent mocks)

getAIResponse(userId, prompt)        single-prompt wrapper; mock mode aware
```

System prompt: *"You are AURA, a helpful student assistant… concise but complete. Use markdown when it improves clarity."*

Models: Groq `openai/gpt-oss-20b` (configurable via `GROQ_MODEL`), OpenAI `gpt-4o-mini`, Claude `claude-3-5-sonnet-20240620`.

### services/speech — Speech-to-text

Selection order (`USE_MOCK_AI=false`):

1. **GroqWhisperProvider** — `whisper-large-v3-turbo` via Groq's OpenAI-compatible audio endpoint; multipart `FormData`; mime-maps webm/ogg/wav/mp3/m4a; ≤25MB.
2. **DeepgramProvider** — Nova-2, `smart_format`, `punctuate`.
3. **MockSTTProvider** — returns empty string → route answers `422 No speech detected` (honest).

`GET /api/transcription/status` reports `{provider, configured, mock}` so the app can display the live engine.

### services/tts — Text-to-speech

ElevenLabs `/{voice_id}` with stability 0.5 / similarity 0.75; returns `data:audio/mpeg;base64,...`. Mock mode returns a placeholder URL.

### services/websocket/voiceSocket — Real-time voice

```
client → {type:"audio_chunk", data:"<base64>"}   (stream frames)
client → {type:"audio_end", conversationId, userId}
server → {type:"transcript", text}                (STT)
server → {type:"assistant_reply", text}           (LLM)
server → {type:"tts", audioUrl}                   (synthesis)
server → {type:"error", message}                  (on failure)
```

Audio chunks are buffered per connection and concatenated on `audio_end`.

### database/repository — dual backend

- Tries PostgreSQL (`DATABASE_URL`) with a 1.5s connect timeout.
- Falls back to in-memory Maps seeded with demo data (user *Shivam*, sample tasks/reminders/memories).
- Identical async surface: users, conversations, messages, memories, tasks, reminders, lectures, documents.
- PostgreSQL rows use snake_case; the mobile app normalizes to camelCase (`mobile/src/utils/normalize.ts`).

## Running & Testing

```bash
npm start        # ts-node src/server.ts (listens on PORT from .env)
npm run build    # tsc → dist/
npm test         # node test/backend.test.js — register → conversation → AI reply
```
