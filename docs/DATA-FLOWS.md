# Data Flows — The Three Core Pipelines

Step-by-step traces of how data moves through AURA for its three defining features: **AI chat**, **lecture recording → study notes**, and **wearable voice interaction**. Route/service details live in [BACKEND.md](BACKEND.md) and [MOBILE.md](MOBILE.md); this doc is about the sequence of events.

---

## Flow 1 — AI Chat (text)

```
ChatScreen ──► chatStore.sendMessage ──► AIService.query ──► ApiClient (JWT)
                                                              │
                                                              ▼
                                              POST /api/chat/messages (backend :4000)
                                                              │
                                   memories + last 12 messages + Groq LLM
                                                              │
                                                              ▼
                                        persist user msg + ai msg (PostgreSQL)
                                                              │
                                                              ▼
                                     MarkdownText renders reply ──► AsyncStorage
```

1. **Send** — `ChatScreen` calls `chatStore.sendMessage(text)`. The store appends the user `Message` to the active `Conversation` immediately (optimistic UI) and sets `isSending: true`. If the active conversation is the placeholder welcome conversation, a real one is created first, titled with the first 40 chars of the message.
2. **Session** — `AIService.query` first calls `ApiClient.ensureSession()` (silent demo login) so a JWT and backend user always exist.
3. **Conversation sync** — If no backend `activeConversationId` is known, `POST /api/chat/conversations` creates one. The id is cached module-level for the session.
4. **Message round-trip** — `POST /api/chat/messages { conversationId, text }`. On the backend (`routes/chat.ts`):
   - Loads the user's **memories** and injects them as grounding context.
   - Loads the **last 12 messages** of the conversation as chat history.
   - Calls the AI provider chain (Groq `openai/gpt-oss-20b` → OpenAI → Claude) and returns `{ aiMessage }`.
   - **Persists both** the user message and the AI reply to PostgreSQL (or the in-memory fallback).
5. **Reply handling** — `AIService.query` unwraps `aiMessage.text` (with `reply`/string fallbacks). Failure of the authenticated path falls back to the stateless `POST /api/chat`; total failure throws, and `chatStore` shows the honest offline message and sets `backendOffline: true`.
6. **Render + persist** — The store appends the `aura` message, persists the whole conversation list to AsyncStorage (`aura_chat_conversations`), and `MarkdownText` renders the (markdown) reply.

Offline behaviour: history is local-first. `hydrate()` reloads conversations from AsyncStorage on app start, so past chats survive restarts even if the backend was unreachable.

---

## Flow 2 — Lecture Recording → Study Notes

```
LectureRecorderScreen (web)
  MediaRecorder.start(1000)          ← 1s timeslice: ondataavailable proves data flows
  useMicLevel (Web Audio RMS)        ← live level meter + silent-mic hint
        │  Stop & Generate Notes
        ▼
  Blob (audio/webm) ──► TranscriptionService.transcribeAudioBlob
        │  FormData multipart (web) / base64 JSON (native), 24MB client guard
        ▼
  POST /api/transcription  (multer upload.single("audio"), 25MB cap)
        │
        ▼
  Groq Whisper whisper-large-v3-turbo      ← Deepgram Nova-2 → Mock fallback chain
        │  { transcript, provider }
        ▼
  TranscriptionService.generateLectureNotes(transcript)
        │  strict prompt: TITLE / SUMMARY / TAKEAWAYS / NOTES (+TRANSCRIPT)
        ▼
  POST /api/chat (stateless AI) ──► parsed LectureStudyNotes
        │
        ▼
  studyStore.saveLecture ──► LectureNote { title, summary, takeaways, notes, transcript }
        │
        ▼
  Lectures list screen ──► view notes, listen to transcript via TTS
```

1. **Record** — `LectureRecorderScreen` requests the mic, wires a Web Audio analyser for the live RMS level meter (with a "silent mic" hint if levels stay flat), and drives a phase state machine: `idle → recording → uploading → transcribing → generating → saving`. The red **● RECORDING — YOUR MIC IS LIVE** banner and staged detail text run off this FSM. `MediaRecorder.start(1000)` emits a chunk every second so feedback is immediate.
2. **Upload** — `transcribeAudioBlob` guards empty/oversized recordings (24MB client cap ≈ 90 min), then:
   - **Web:** appends the blob to `FormData` as `audio` (extension inferred from MIME: wav/ogg/m4a/mp3/webm) — multipart, no base64 bloat.
   - **Native:** base64-encodes in 32KB chunks and posts JSON (body limits raised server-side to 30MB).
3. **Transcribe** — Backend route (`routes/transcription.ts`) accepts the multipart file (or base64 JSON fallback), feeds the buffer to `getSpeechProvider()` → **Groq Whisper** `whisper-large-v3-turbo` → Deepgram → Mock, and returns `{ transcript, provider }`. Empty transcripts produce a 422 with an honest "no speech detected" error.
4. **Generate notes** — `generateLectureNotes` sends a strict-format prompt (`TITLE:` / `SUMMARY:` / `TAKEAWAYS:` / `NOTES:` sections, transcript truncated to 12k chars) through `AIService.query` → backend stateless chat → Groq. The reply is parsed with regexes into `{ title, summary, keyTakeaways[], notes }`, with sane fallbacks if a section is missing.
5. **Save** — The recorder screen saves a `LectureNote` via `studyStore` (title auto-derived if parsing yielded none), and the Lectures screen can reopen the note: summary, takeaway bullets, full markdown notes, original transcript, and text-to-speech playback.

Status surface: `GET /api/transcription/status` → `{ provider, configured, mock }` — shown in the recorder header so you always know which engine transcribed you.

---

## Flow 3 — Wearable Voice (button press → spoken answer)

The AURA pendant is **virtual by design**: `MockBleService` simulates the Omi-compatible GATT device, and the whole flow is swappable to real hardware by replacing one service file.

### On-device (current, fully working)

```
DeviceScreen "Simulate Button Press"
        │
        ▼
deviceStore.simulateButtonPress ──► MockBleService BUTTON_PRESSED event
        │
        ▼
onWearableButtonPress handlers (VoiceScreen)
        │
        ▼
VoiceService.startListening
        │  FSM: idle → listening → thinking → speaking → idle
        ▼
Web Speech recognition (browser STT)          [mock mode: scripted demo transcript]
        │  onFinal(text)
        ▼
sendToAI ──► AIService.query ──► backend chat (same as Flow 1)
        │
        ▼
voiceStore: transcript + AI response rendered
        │        └── mirrored into chat history: chatStore.sendMessage(text, answer)
        ▼
speak(answer) — browser TTS (animated speaking state if TTS unavailable)
```

1. **Trigger** — `simulateButtonPress()` fires the mock BLE `BUTTON_PRESSED` event; all registered handlers run (a real pendant would emit the same GATT characteristic write).
2. **Listen** — `VoiceServiceImplementation.startListening` sets the voice FSM to `listening`, streams partial transcripts via `onPartial`, and on a final result calls `handleQuery`. If STT is unavailable (or mock AI is on), it plays the scripted demo path instead — never a silent failure.
3. **Think** — `sendToAI` routes through `AIService.query` (mock canned responses when `USE_MOCK_AI`, otherwise the full backend chat chain). The answer is **mirrored into the chat store** so the voice exchange appears in chat history.
4. **Speak** — `speak()` uses browser TTS; the FSM returns to `idle` on TTS end (or after a length-estimated delay when TTS is unsupported).

### Streaming protocol (server-side, `/ws/voice`)

`backend/services/websocket/voiceSocket.ts` attaches a `WebSocketServer` to the same HTTP server at path `/ws/voice`, ready for native/continuous clients:

| Direction | Message | Meaning |
|---|---|---|
| client → server | `{ type: "audio_chunk", data: "<base64>" }` | Stream audio pieces |
| client → server | `{ type: "audio_end", conversationId, userId }` | End of utterance; triggers processing |
| server → client | `{ type: "transcript", text }` | STT result (provider chain as in Flow 2) |
| server → client | `{ type: "assistant_reply", text }` | AI answer via `getAIResponse(userId, …)` (memory-grounded) |
| server → client | `{ type: "tts", audioUrl }` | Synthesized speech URL via `getAudioForText` (ElevenLabs chain) |
| server → client | `{ type: "error", message }` | Any processing failure |

Buffers reset per round; on close, pending audio is dropped. This is the wire format a real wearable bridge would speak.
