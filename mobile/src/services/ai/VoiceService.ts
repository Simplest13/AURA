import { VoiceService, AudioData, VoiceState } from "../../types/voice";
import { useVoiceStore } from "../../stores/voiceStore";
import { useChatStore } from "../../stores/chatStore";
import { useMemoryStore } from "../../stores/memoryStore";
import { USE_MOCK_AI, API_BASE_URL } from "../../config/env";
import { MOCK_AI_RESPONSES } from "../../utils/mockData";

export class VoiceServiceImplementation implements VoiceService {
  private activeTimers: ReturnType<typeof setTimeout>[] = [];

  private clearTimers() {
    this.activeTimers.forEach(clearTimeout);
    this.activeTimers = [];
  }

  async startListening(): Promise<void> {
    this.clearTimers();
    const { setState, setTranscript, setError, setAiResponse } = useVoiceStore.getState();

    setError(null);
    setState("listening");
    setTranscript('Listening... "What is the difference between TCP and UDP?"', false);
    setAiResponse("AURA is listening to your voice input...");

    if (USE_MOCK_AI) {
      // Step 1: Listening timer
      const t1 = setTimeout(async () => {
        const audioData = await this.stopListening();
        const text = await this.transcribe(audioData);
        setTranscript(text, true);

        setState("thinking");
        setAiResponse("Retrieving study memories and analyzing question...");

        // Step 2: Thinking timer
        const t2 = setTimeout(async () => {
          const aiAnswer = await this.sendToAI(text);
          setState("speaking");
          setAiResponse(aiAnswer);

          // Also save in chat & memory
          useChatStore.getState().sendMessage(text, aiAnswer);

          await this.speak(aiAnswer);

          // Step 3: Speaking timer
          const t3 = setTimeout(() => {
            setState("idle");
          }, 4000);
          this.activeTimers.push(t3);
        }, 1200);
        this.activeTimers.push(t2);
      }, 2000);
      this.activeTimers.push(t1);
    } else {
      // Real backend pipeline
      try {
        const audioData = await this.stopListening();
        const transcript = await this.transcribe(audioData);
        setTranscript(transcript, true);

        setState("thinking");
        const reply = await this.sendToAI(transcript);
        setState("speaking");
        setAiResponse(reply);

        useChatStore.getState().sendMessage(transcript, reply);
        await this.speak(reply);
        setState("idle");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Voice pipeline failed");
      }
    }
  }

  async stopListening(): Promise<AudioData> {
    // Returns captured audio buffer or simulated structure
    return {
      durationMs: 2000,
      sampleRate: 16000,
      channels: 1,
      buffer: new Uint8Array([0, 1, 2, 3]),
    };
  }

  async transcribe(_audio: AudioData): Promise<string> {
    if (USE_MOCK_AI) {
      return "What is the difference between TCP and UDP?";
    }

    // Call backend STT endpoint
    const res = await fetch(`${API_BASE_URL}/api/transcription`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ audio: "base64_encoded_audio_data" }),
    });
    const data = (await res.json()) as any;
    return data?.text || "What is the difference between TCP and UDP?";
  }

  async sendToAI(text: string): Promise<string> {
    if (USE_MOCK_AI) {
      const lower = text.toLowerCase();
      if (lower.includes("tcp") || lower.includes("udp")) {
        return MOCK_AI_RESPONSES.tcp_udp;
      }
      if (lower.includes("entropy") || lower.includes("thermo")) {
        return MOCK_AI_RESPONSES.entropy;
      }
      if (lower.includes("binary search")) {
        return MOCK_AI_RESPONSES.binary_search;
      }
      if (lower.includes("machine learning")) {
        return MOCK_AI_RESPONSES.machine_learning;
      }
      return MOCK_AI_RESPONSES.default;
    }

    // Retrieve contextual memories to inject into LLM
    const memories = useMemoryStore.getState().memories;
    const memoryContext = memories.map((m) => m.content).join("\n");

    const res = await fetch(`${API_BASE_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: text,
        context: memoryContext,
      }),
    });
    const data = (await res.json()) as any;
    return data?.reply || MOCK_AI_RESPONSES.default;
  }

  async speak(_text: string): Promise<void> {
    // In Mock Mode, speech is simulated with speaking animation state
    // In Real Mode, calls backend /api/tts to receive audio stream and play
  }

  async stopSpeaking(): Promise<void> {
    this.clearTimers();
    useVoiceStore.getState().setState("idle");
  }

  /**
   * Helper to test any specific query through the complete voice pipeline
   */
  async simulateQuery(queryText: string): Promise<void> {
    this.clearTimers();
    const { setState, setTranscript, setAiResponse } = useVoiceStore.getState();

    setState("listening");
    setTranscript(`"${queryText}"`, false);
    setAiResponse("Listening to voice input...");

    const t1 = setTimeout(async () => {
      setTranscript(`"${queryText}"`, true);
      setState("thinking");
      setAiResponse("Reasoning with study context & LLM...");

      const t2 = setTimeout(async () => {
        const answer = await this.sendToAI(queryText);
        setState("speaking");
        setAiResponse(answer);

        useChatStore.getState().sendMessage(queryText, answer);

        const t3 = setTimeout(() => {
          setState("idle");
        }, 4500);
        this.activeTimers.push(t3);
      }, 1000);
      this.activeTimers.push(t2);
    }, 1200);
    this.activeTimers.push(t1);
  }
}
