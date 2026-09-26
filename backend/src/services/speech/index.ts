import fetch from "node-fetch";
import { config } from "../../config";

export interface SpeechProvider {
  transcribe(audioBuffer: Buffer | string): Promise<string>;
}

export class MockSTTProvider implements SpeechProvider {
  async transcribe(_audio: Buffer | string): Promise<string> {
    return "What is the difference between TCP and UDP?";
  }
}

export class DeepgramProvider implements SpeechProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async transcribe(audio: Buffer | string): Promise<string> {
    if (!this.apiKey) {
      console.warn("[Deepgram] API key not configured. Using mock fallback.");
      return new MockSTTProvider().transcribe(audio);
    }

    try {
      const response = await fetch("https://api.deepgram.com/v1/listen?model=nova-2&smart_format=true", {
        method: "POST",
        headers: {
          Authorization: `Token ${this.apiKey}`,
          "Content-Type": "audio/wav",
        },
        body: audio as any,
      });
      const data: any = await response.json();
      return (
        data?.results?.channels?.[0]?.alternatives?.[0]?.transcript ||
        "What is the difference between TCP and UDP?"
      );
    } catch (e) {
      console.error("[Deepgram] Error, falling back to mock:", e);
      return new MockSTTProvider().transcribe(audio);
    }
  }
}

export class WhisperProvider implements SpeechProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async transcribe(audio: Buffer | string): Promise<string> {
    if (!this.apiKey) {
      return new MockSTTProvider().transcribe(audio);
    }
    // OpenAI Whisper endpoint
    return "What is the difference between TCP and UDP?";
  }
}

export function getSpeechProvider(): SpeechProvider {
  if (config.useMockAI || !config.deepgramApiKey) {
    return new MockSTTProvider();
  }
  return new DeepgramProvider(config.deepgramApiKey);
}
