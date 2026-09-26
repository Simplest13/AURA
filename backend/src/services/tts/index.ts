// src/services/tts/index.ts
import fetch from "node-fetch";
import { config } from "../../config";

/**
 * Returns a URL (or base64) for synthesized speech.
 * - In mock mode returns a placeholder audio URL.
 * - In real mode uses ElevenLabs TTS API when API key is provided.
 */
export async function getAudioForText(text: string): Promise<string> {
  if (config.useMockAI || !config.elevenlabsApiKey) {
    // Return a static placeholder – could be a local MP3 asset.
    return "https://example.com/mock-audio.mp3";
  }

  const endpoint = `https://api.elevenlabs.io/v1/text-to-speech/${config.elevenlabsVoiceId}`;
  const body = {
    text,
    voice_settings: {
      stability: 0.5,
      similarity_boost: 0.75,
    },
  };

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "xi-api-key": config.elevenlabsApiKey,
      "Content-Type": "application/json",
      Accept: "audio/mpeg",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`ElevenLabs TTS failed: ${response.status} ${errText}`);
  }

  // We will return a data URL containing base64-encoded audio.
  const arrayBuffer = await response.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");
  return `data:audio/mpeg;base64,${base64}`;
}
