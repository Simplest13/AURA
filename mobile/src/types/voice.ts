/**
 * AURA Voice & Audio Pipeline Types
 */

export type VoiceState = "idle" | "listening" | "thinking" | "speaking" | "error";

export interface AudioData {
  uri?: string;
  blob?: Blob;
  base64?: string;
  buffer?: Uint8Array;
  durationMs: number;
  sampleRate: number;
  channels: number;
}

export interface VoiceServiceEvents {
  onStateChange?: (state: VoiceState) => void;
  onTranscript?: (text: string, isFinal: boolean) => void;
  onResponse?: (text: string) => void;
  onError?: (message: string) => void;
  onAudioLevel?: (level: number) => void; // Normalized 0.0 - 1.0 for waveform
}

/**
 * Strict VoiceService interface per project requirements
 */
export interface VoiceService {
  startListening(): Promise<void>;
  stopListening(): Promise<AudioData>;
  transcribe(audio: AudioData): Promise<string>;
  sendToAI(text: string): Promise<string>;
  speak(text: string): Promise<void>;
  stopSpeaking(): Promise<void>;
}
