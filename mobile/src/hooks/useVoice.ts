/**
 * useVoice Hook
 * Coordinates voice interaction: start listening, stop/commit, state tracking, and waveforms.
 */

import { useVoiceStore } from "../stores/voiceStore";

export const useVoice = () => {
  const {
    state,
    liveTranscript,
    isFinal,
    aiResponse,
    errorMessage,
    audioLevel,
    setState,
    setTranscript,
    setAiResponse,
    setError,
    startSession,
    commitListening,
    reset,
  } = useVoiceStore();

  return {
    state,
    isIdle: state === "idle",
    isListening: state === "listening",
    isThinking: state === "thinking",
    isSpeaking: state === "speaking",
    isError: state === "error",
    liveTranscript,
    isFinal,
    aiResponse,
    errorMessage,
    audioLevel,
    startListening: startSession,
    stopListening: () => commitListening(),
    askQuestion: (prompt: string) => commitListening(prompt),
    setState,
    setTranscript,
    setAiResponse,
    setError,
    reset,
  };
};

