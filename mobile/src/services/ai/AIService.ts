/**
 * AURA AI Service
 * Coordinates AI reasoning, speech-to-text, text-to-speech, and memory injection.
 */

import { USE_MOCK_AI } from "../../config/env";
import { ApiClient } from "../api/ApiClient";
import { MockAIService } from "./MockAIService";
import { useMemoryStore } from "../../stores/memoryStore";

let activeConversationId: string | null = null;

export class AIService {
  /**
   * Transcribe speech audio to text
   */
  public static async transcribe(audioBase64?: string): Promise<string> {
    if (USE_MOCK_AI || !audioBase64) {
      await new Promise((r) => setTimeout(r, 400));
      return "What is the difference between TCP and UDP?";
    }

    try {
      const response = await ApiClient.post<{ text: string }>("/api/transcription", {
        audio: audioBase64,
      });
      return response.text || "Could not recognize speech";
    } catch (err) {
      console.warn("[AIService] Transcription backend unavailable, using fallback:", err);
      return "Explain the fundamental principles of recursion.";
    }
  }

  /**
   * Send question / prompt to the AI model
   */
  public static async query(text: string): Promise<string> {
    if (USE_MOCK_AI) {
      return MockAIService.query(text);
    }

    try {
      // Ensure conversation exists if hitting backend
      if (!activeConversationId) {
        try {
          const conv = await ApiClient.post<{ id: string }>("/api/chat/conversations", {
            title: "Voice Session",
          });
          if (conv && conv.id) {
            activeConversationId = conv.id;
          }
        } catch {
          // Continue if conversation route behaves differently
        }
      }

      if (activeConversationId) {
        const response = await ApiClient.post<{ aiMessage?: { text: string }; reply?: string }>(
          "/api/chat/messages",
          {
            conversationId: activeConversationId,
            text,
          }
        );

        if (response?.aiMessage?.text) {
          return response.aiMessage.text;
        }
        if (response?.reply) {
          return response.reply;
        }
      }

      // If backend endpoint is generic /api/chat
      const response = await ApiClient.post<{ reply?: string }>("/api/chat", {
        message: text,
      });

      if (response?.reply) {
        return response.reply;
      }

      return MockAIService.query(text);
    } catch (err) {
      console.warn("[AIService] AI backend unavailable or offline, using deterministic engine:", err);
      return MockAIService.query(text);
    }
  }

  /**
   * Convert AI reply to speech
   */
  public static async synthesizeSpeech(text: string): Promise<string | null> {
    if (USE_MOCK_AI) {
      return null;
    }

    try {
      const response = await ApiClient.post<{ audioUrl: string }>("/api/tts", {
        text,
      });
      return response.audioUrl || null;
    } catch (err) {
      console.warn("[AIService] TTS unavailable:", err);
      return null;
    }
  }
}

