import { VoiceService, AudioData, VoiceState } from "../../types/voice";
import { useVoiceStore } from "../../stores/voiceStore";
import { useChatStore } from "../../stores/chatStore";
import { AIService } from "./AIService";
import { USE_MOCK_AI } from "../../config/env";
import { MOCK_AI_RESPONSES } from "../../utils/mockData";
import {
  startRecognition,
  stopSpeaking,
  speakText,
  isWebSpeechSupported,
  isTtsSupported,
  RecognitionSession,
} from "../speech/WebSpeechService";

export class VoiceServiceImplementation implements VoiceService {
  private recognition: RecognitionSession | null = null;
  private lastFinalText: string = "";

  async startListening(): Promise<void> {
    const { setState, setTranscript, setError, setAiResponse } = useVoiceStore.getState();

    setError(null);
    setAiResponse("");
    this.lastFinalText = "";

    if (USE_MOCK_AI || !isWebSpeechSupported()) {
      // Simulated listening flow (native or when STT is unavailable)
      setState("listening");
      setTranscript("Listening...", false);
      setAiResponse("AURA is listening to your voice input...");

      const t1 = setTimeout(async () => {
        const text = "What is the difference between TCP and UDP?";
        setTranscript(text, true);
        setState("thinking");
        setAiResponse("Retrieving study memories and analyzing question...");

        const answer = await this.sendToAI(text);
        setState("speaking");
        setAiResponse(answer);
        useChatStore.getState().sendMessage(text, answer);
        await this.speak(answer);

        const t3 = setTimeout(() => setState("idle"), 4000);
        void t3;
      }, 2000);
      void t1;
      return;
    }

    // Real browser speech recognition
    setState("listening");
    setTranscript("Listening...", false);

    this.recognition = startRecognition({
      onPartial: (partial) => setTranscript(partial, false),
      onFinal: (final) => {
        this.lastFinalText = final;
        setTranscript(final, true);
        void this.handleQuery(final);
      },
      onError: (message) => {
        setError(message);
      },
    });
  }

  private async handleQuery(text: string) {
    const { setState, setAiResponse } = useVoiceStore.getState();
    if (!text.trim()) {
      setState("idle");
      return;
    }

    setState("thinking");
    setAiResponse("Reasoning with your study context...");

    try {
      const answer = await this.sendToAI(text);
      setState("speaking");
      setAiResponse(answer);

      // Mirror the exchange into the chat history
      useChatStore.getState().sendMessage(text, answer);

      await this.speak(answer);
    } catch (err: any) {
      useVoiceStore.getState().setError(err?.message ?? "Voice pipeline failed");
    }
  }

  async stopListening(): Promise<AudioData> {
    this.recognition?.stop();
    this.recognition = null;
    return {
      durationMs: 0,
      sampleRate: 16000,
      channels: 1,
      buffer: new Uint8Array(),
    };
  }

  async transcribe(_audio: AudioData): Promise<string> {
    // Transcription happens live during recognition; this satisfies the interface.
    return this.lastFinalText;
  }

  async sendToAI(text: string): Promise<string> {
    if (USE_MOCK_AI) {
      const lower = text.toLowerCase();
      if (lower.includes("tcp") || lower.includes("udp")) return MOCK_AI_RESPONSES.tcp_udp;
      if (lower.includes("entropy") || lower.includes("thermo")) return MOCK_AI_RESPONSES.entropy;
      if (lower.includes("binary search")) return MOCK_AI_RESPONSES.binary_search;
      if (lower.includes("machine learning")) return MOCK_AI_RESPONSES.machine_learning;
      return MOCK_AI_RESPONSES.default;
    }

    try {
      return await AIService.query(text);
    } catch (err: any) {
      return "I can't reach the AI service right now. Please check the backend connection and try again.";
    }
  }

  async speak(text: string): Promise<void> {
    if (isTtsSupported()) {
      speakText(text, {
        onEnd: () => {
          const { state, setState } = useVoiceStore.getState();
          if (state === "speaking") setState("idle");
        },
      });
      return;
    }
    // No TTS available — animate the speaking state briefly
    const duration = Math.min(8000, Math.max(3000, text.length * 35));
    setTimeout(() => {
      const { state, setState } = useVoiceStore.getState();
      if (state === "speaking") setState("idle");
    }, duration);
  }

  async stopSpeaking(): Promise<void> {
    stopSpeaking();
    this.recognition?.stop();
    this.recognition = null;
    useVoiceStore.getState().setState("idle");
  }

  /** Test helper: run any text through the full AI + speak pipeline. */
  async simulateQuery(queryText: string): Promise<void> {
    const { setState, setTranscript, setAiResponse } = useVoiceStore.getState();
    this.clearRecognition();

    setState("listening");
    setTranscript(`"${queryText}"`, false);

    setTimeout(() => {
      setTranscript(queryText, true);
      void this.handleQuery(queryText);
    }, 600);
  }

  private clearRecognition() {
    this.recognition?.stop();
    this.recognition = null;
  }
}
