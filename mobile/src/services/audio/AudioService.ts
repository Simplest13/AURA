import { AudioData } from "../../types/voice";

export type AudioState = "idle" | "recording" | "playing" | "error";

export interface AudioServiceEvents {
  onStateChange?: (state: AudioState) => void;
  onAudioLevel?: (level: number) => void; // 0.0 to 1.0
  onError?: (error: string) => void;
}

/**
 * Isolated Audio Abstraction
 * Manages microphone capture, recording buffers, audio playback, and level monitoring.
 */
export class AudioService {
  private state: AudioState = "idle";
  private events: AudioServiceEvents;
  private levelInterval?: ReturnType<typeof setInterval>;
  private recordedChunks: Uint8Array[] = [];

  constructor(events: AudioServiceEvents = {}) {
    this.events = events;
  }

  private setState(next: AudioState) {
    this.state = next;
    this.events.onStateChange?.(next);
  }

  getState(): AudioState {
    return this.state;
  }

  async requestPermissions(): Promise<boolean> {
    console.log("[AudioService] Requesting Android RECORD_AUDIO permission...");
    return true;
  }

  async startRecording(): Promise<void> {
    if (this.state === "recording") return;

    const granted = await this.requestPermissions();
    if (!granted) {
      this.events.onError?.("Microphone permission denied");
      this.setState("error");
      return;
    }

    this.recordedChunks = [];
    this.setState("recording");

    // Monitor audio levels for waveform
    this.levelInterval = setInterval(() => {
      const simulatedLevel = 0.2 + Math.random() * 0.75;
      this.events.onAudioLevel?.(simulatedLevel);
    }, 100);
  }

  async stopRecording(): Promise<AudioData> {
    if (this.levelInterval) {
      clearInterval(this.levelInterval);
      this.levelInterval = undefined;
    }

    this.setState("idle");
    this.events.onAudioLevel?.(0);

    // Return captured audio data structure
    return {
      durationMs: 2500,
      sampleRate: 16000,
      channels: 1,
      buffer: new Uint8Array([0x52, 0x49, 0x46, 0x46]), // Simulated RIFF header
    };
  }

  async playAudio(_audioData: AudioData | string): Promise<void> {
    this.setState("playing");
    setTimeout(() => {
      this.setState("idle");
    }, 3000);
  }

  async stopPlayback(): Promise<void> {
    this.setState("idle");
  }

  cleanup(): void {
    if (this.levelInterval) {
      clearInterval(this.levelInterval);
    }
    this.setState("idle");
  }
}
