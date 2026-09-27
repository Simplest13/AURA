/**
 * Web Speech Services
 * Real speech-to-text (webkitSpeechRecognition) and text-to-speech
 * (speechSynthesis) for web, with graceful degradation on native.
 */

import { Platform } from "react-native";

/* eslint-disable no-var */
declare global {
  var SpeechRecognition: any;
  var webkitSpeechRecognition: any;
}

export function isWebSpeechSupported(): boolean {
  return Platform.OS === "web" && typeof window !== "undefined" &&
    Boolean((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
}

export function isTtsSupported(): boolean {
  return Platform.OS === "web" && typeof window !== "undefined" && "speechSynthesis" in window;
}

export interface RecognitionSession {
  stop: () => void;
}

export function startRecognition(callbacks: {
  onPartial?: (text: string) => void;
  onFinal: (text: string) => void;
  onError: (message: string) => void;
  onEnd?: () => void;
  continuous?: boolean;
}): RecognitionSession | null {
  if (!isWebSpeechSupported()) {
    callbacks.onError("Speech recognition is only supported in the web browser in this build.");
    return null;
  }

  const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  const recognition = new SR();
  recognition.continuous = callbacks.continuous ?? false;
  recognition.interimResults = true;
  recognition.lang = "en-US";

  let finalText = "";

  recognition.onresult = (event: any) => {
    let interim = "";
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        finalText += transcript + " ";
      } else {
        interim += transcript;
      }
    }
    if (interim) callbacks.onPartial?.(interim.trim());
    if (finalText.trim()) {
      // Emit final incrementally; caller decides when to stop
      callbacks.onPartial?.(finalText.trim() + (interim ? " " + interim.trim() : ""));
    }
  };

  recognition.onerror = (event: any) => {
    const code = event?.error ?? "unknown";
    const friendly =
      code === "not-allowed" || code === "service-not-allowed"
        ? "Microphone permission denied. Allow mic access in your browser to use voice."
        : code === "no-speech"
        ? "No speech detected. Try again a bit closer to the mic."
        : `Speech recognition error: ${code}`;
    callbacks.onError(friendly);
  };

  recognition.onend = () => {
    if (finalText.trim()) {
      callbacks.onFinal(finalText.trim());
    }
    callbacks.onEnd?.();
  };

  try {
    recognition.start();
  } catch (e: any) {
    callbacks.onError(e?.message ?? "Could not start speech recognition");
    return null;
  }

  return {
    stop: () => {
      try {
        recognition.stop();
      } catch {
        // already stopped
      }
    },
  };
}

export function speakText(
  text: string,
  options: { onEnd?: () => void; rate?: number; pitch?: number } = {}
): boolean {
  if (!isTtsSupported()) return false;
  try {
    const synth = window.speechSynthesis;
    synth.cancel();
    // Strip markdown symbols for a natural reading voice
    const clean = text
      .replace(/[#*_`|>]/g, " ")
      .replace(/\[(.*?)\]\(.*?\)/g, "$1")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 1200);
    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.rate = options.rate ?? 1.0;
    utterance.pitch = options.pitch ?? 1.0;
    if (options.onEnd) utterance.onend = options.onEnd;
    synth.speak(utterance);
    return true;
  } catch {
    return false;
  }
}

export function stopSpeaking() {
  if (isTtsSupported()) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // noop
    }
  }
}
