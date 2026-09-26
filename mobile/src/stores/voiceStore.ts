import { create } from "zustand";
import { VoiceState } from "../types/voice";
import { AIService } from "../services/ai/AIService";
import { MockAIService } from "../services/ai/MockAIService";

interface VoiceStoreState {
  state: VoiceState;
  liveTranscript: string;
  isFinal: boolean;
  aiResponse: string;
  errorMessage: string | null;
  audioLevel: number; // 0.0 to 1.0

  setState: (state: VoiceState) => void;
  setTranscript: (text: string, isFinal?: boolean) => void;
  setAiResponse: (text: string) => void;
  setError: (msg: string | null) => void;
  setAudioLevel: (level: number) => void;
  startSession: () => void;
  commitListening: (forcedPrompt?: string) => Promise<void>;
  reset: () => void;
}

let simulatedWaveformInterval: ReturnType<typeof setInterval> | null = null;

export const useVoiceStore = create<VoiceStoreState>((set, get) => ({
  state: "idle",
  liveTranscript: "",
  isFinal: false,
  aiResponse: "",
  errorMessage: null,
  audioLevel: 0,

  setState: (state) => {
    if (state !== "listening" && state !== "speaking") {
      if (simulatedWaveformInterval) {
        clearInterval(simulatedWaveformInterval);
        simulatedWaveformInterval = null;
      }
      set({ audioLevel: 0, state });
    } else {
      set({ state });
    }
  },

  setTranscript: (liveTranscript, isFinal = false) => set({ liveTranscript, isFinal }),
  setAiResponse: (aiResponse) => set({ aiResponse }),
  setError: (errorMessage) => {
    if (simulatedWaveformInterval) {
      clearInterval(simulatedWaveformInterval);
      simulatedWaveformInterval = null;
    }
    set({ errorMessage, state: errorMessage ? "error" : "idle", audioLevel: 0 });
  },
  setAudioLevel: (audioLevel) => set({ audioLevel }),

  startSession: () => {
    if (simulatedWaveformInterval) {
      clearInterval(simulatedWaveformInterval);
    }

    set({
      state: "listening",
      liveTranscript: "Listening to your voice...",
      isFinal: false,
      aiResponse: "",
      errorMessage: null,
    });

    // Simulate reactive audio amplitude levels
    simulatedWaveformInterval = setInterval(() => {
      const level = 0.2 + Math.random() * 0.75;
      set({ audioLevel: level });
    }, 120);

    // Simulate speech arriving after 1.6s
    setTimeout(() => {
      if (get().state === "listening") {
        set({
          liveTranscript: "What is the difference between TCP and UDP?",
          isFinal: true,
        });
      }
    }, 1600);
  },

  commitListening: async (forcedPrompt?: string) => {
    if (simulatedWaveformInterval) {
      clearInterval(simulatedWaveformInterval);
      simulatedWaveformInterval = null;
    }

    const queryText = forcedPrompt || get().liveTranscript || "Explain the concept of entropy.";
    set({
      state: "thinking",
      audioLevel: 0,
      liveTranscript: queryText,
      isFinal: true,
    });

    try {
      const reply = await AIService.query(queryText);

      set({
        state: "speaking",
        aiResponse: reply,
      });

      // Fluctuate speaking levels
      simulatedWaveformInterval = setInterval(() => {
        const level = 0.25 + Math.random() * 0.6;
        set({ audioLevel: level });
      }, 140);

      // Finish speaking after response reading duration
      const speakingDurationMs = Math.min(8000, Math.max(3000, reply.length * 35));
      setTimeout(() => {
        if (simulatedWaveformInterval) {
          clearInterval(simulatedWaveformInterval);
          simulatedWaveformInterval = null;
        }
        set({
          state: "idle",
          audioLevel: 0,
        });
      }, speakingDurationMs);
    } catch (err: any) {
      set({
        state: "error",
        errorMessage: err.message || "Failed to process voice query",
        audioLevel: 0,
      });
    }
  },

  reset: () => {
    if (simulatedWaveformInterval) {
      clearInterval(simulatedWaveformInterval);
      simulatedWaveformInterval = null;
    }
    set({
      state: "idle",
      liveTranscript: "",
      isFinal: false,
      aiResponse: "",
      errorMessage: null,
      audioLevel: 0,
    });
  },
}));
