import fetch from "node-fetch";
import { config } from "../../config";

export interface SpeechProvider {
  /** Human-readable provider name, for status surfaces. */
  readonly name: string;
  transcribe(audioBuffer: Buffer | string, mimeType?: string): Promise<string>;
}

/**
 * Groq Whisper transcription — uses the same GROQ_API_KEY as chat.
 * Accepts webm/ogg/mp3/wav/m4a audio up to ~25MB (free tier limits).
 */
export class GroqWhisperProvider implements SpeechProvider {
  readonly name = "Groq Whisper";

  async transcribe(audioBuffer: Buffer | string, mimeType = "audio/webm"): Promise<string> {
    if (!config.groqApiKey) {
      throw new Error("GROQ_API_KEY is not configured on the backend");
    }

    const buffer = Buffer.isBuffer(audioBuffer)
      ? audioBuffer
      : Buffer.from(audioBuffer as string, "base64");

    const ext = mimeType.includes("webm")
      ? "webm"
      : mimeType.includes("ogg")
      ? "ogg"
      : mimeType.includes("mp4") || mimeType.includes("m4a")
      ? "m4a"
      : mimeType.includes("mpeg") || mimeType.includes("mp3")
      ? "mp3"
      : mimeType.includes("wav")
      ? "wav"
      : "webm";

    // node-fetch 3 (ESM) — build FormData via the global (Node 18+)
    const form = new FormData();
    form.append("file", new Blob([new Uint8Array(buffer)], { type: mimeType }), `audio.${ext}`);
    form.append("model", "whisper-large-v3-turbo");
    form.append("response_format", "json");
    form.append("temperature", "0");

    const response = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.groqApiKey}`,
      },
      body: form as any,
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Groq Whisper failed: ${response.status} ${errText.slice(0, 300)}`);
    }

    const data: any = await response.json();
    const text = data?.text ?? "";
    return typeof text === "string" ? text.trim() : "";
  }
}

export class MockSTTProvider implements SpeechProvider {
  readonly name = "Mock (no STT key)";

  async transcribe(_audio: Buffer | string): Promise<string> {
    return "";
  }
}

export class DeepgramProvider implements SpeechProvider {
  readonly name = "Deepgram Nova-2";

  constructor(private apiKey: string) {}

  async transcribe(audioBuffer: Buffer | string, mimeType = "audio/webm"): Promise<string> {
    if (!this.apiKey) {
      throw new Error("DEEPGRAM_API_KEY is not configured on the backend");
    }

    const buffer = Buffer.isBuffer(audioBuffer)
      ? audioBuffer
      : Buffer.from(audioBuffer as string, "base64");

    const contentType = mimeType.includes("wav")
      ? "audio/wav"
      : mimeType.includes("ogg")
      ? mimeType
      : mimeType.includes("mp3") || mimeType.includes("mpeg")
      ? "audio/mpeg"
      : mimeType.includes("mp4") || mimeType.includes("m4a")
      ? "audio/mp4"
      : "audio/webm;codecs=opus";

    const response = await fetch(
      "https://api.deepgram.com/v1/listen?model=nova-2&smart_format=true&punctuate=true",
      {
        method: "POST",
        headers: {
          Authorization: `Token ${this.apiKey}`,
          "Content-Type": contentType,
        },
        body: buffer as any,
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Deepgram failed: ${response.status} ${errText.slice(0, 300)}`);
    }

    const data: any = await response.json();
    return data?.results?.channels?.[0]?.alternatives?.[0]?.transcript || "";
  }
}

/** Pick the best available speech provider, Groq Whisper first (free with the chat key). */
export function getSpeechProvider(): SpeechProvider {
  if (config.useMockAI) {
    return new MockSTTProvider();
  }
  if (config.groqApiKey) {
    return new GroqWhisperProvider();
  }
  if (config.deepgramApiKey) {
    return new DeepgramProvider(config.deepgramApiKey);
  }
  return new MockSTTProvider();
}
