/**
 * AURA Mock Audio Service
 * Provides mock microphone capture, simulated amplitude levels (0.0 to 1.0)
 * for reactive visualization, and simulated audio playback.
 */

import { AudioData } from "../../types/voice";
import { AudioServiceEvents, AudioState } from "./AudioService";

export class MockAudioService {
  private state: AudioState = "idle";
  private events: AudioServiceEvents;
  private amplitudeTimer?: ReturnType<typeof setInterval>;

  constructor(events: AudioServiceEvents = {}) {
    this.events = events;
  }

  public getState(): AudioState {
    return this.state;
  }

  public async requestPermissions(): Promise<boolean> {
    return true;
  }

  public async startRecording(): Promise<void> {
    if (this.state === "recording") return;

    this.state = "recording";
    this.events.onStateChange?.("recording");

    // Produce realistic fluctuating amplitude values between 0.15 and 0.95
    this.amplitudeTimer = setInterval(() => {
      const baseLevel = 0.25;
      const variation = Math.random() * 0.7;
      const level = Math.min(1.0, baseLevel + variation);
      this.events.onAudioLevel?.(level);
    }, 120);
  }

  public async stopRecording(): Promise<AudioData> {
    if (this.amplitudeTimer) {
      clearInterval(this.amplitudeTimer);
      this.amplitudeTimer = undefined;
    }

    this.state = "idle";
    this.events.onStateChange?.("idle");
    this.events.onAudioLevel?.(0);

    return {
      durationMs: 3000,
      sampleRate: 16000,
      channels: 1,
      buffer: new Uint8Array([0x52, 0x49, 0x46, 0x46]),
    };
  }

  public async playAudio(_audioData: AudioData | string): Promise<void> {
    this.state = "playing";
    this.events.onStateChange?.("playing");

    // Fluctuate speaking levels
    this.amplitudeTimer = setInterval(() => {
      const level = 0.3 + Math.random() * 0.6;
      this.events.onAudioLevel?.(level);
    }, 150);

    setTimeout(() => {
      this.stopPlayback();
    }, 3500);
  }

  public async stopPlayback(): Promise<void> {
    if (this.amplitudeTimer) {
      clearInterval(this.amplitudeTimer);
      this.amplitudeTimer = undefined;
    }
    this.state = "idle";
    this.events.onStateChange?.("idle");
    this.events.onAudioLevel?.(0);
  }

  public cleanup(): void {
    if (this.amplitudeTimer) {
      clearInterval(this.amplitudeTimer);
      this.amplitudeTimer = undefined;
    }
    this.state = "idle";
    this.events.onAudioLevel?.(0);
  }
}

