/**
 * AURA AI Service
 * Real chat pipeline: backend conversations (Groq-backed) with resilient
 * local persistence so history survives app restarts and offline usage.
 */

import { ApiClient } from "../api/ApiClient";
import { StorageService } from "../storage/StorageService";
import { useChatStore } from "../../stores/chatStore";
import { Conversation } from "../../types/chat";

let activeConversationId: string | null = null;

export const CHAT_STORAGE_KEY = "aura_chat_conversations";

export function getActiveConversationId(): string | null {
  return activeConversationId;
}

export function setActiveConversationId(id: string | null) {
  activeConversationId = id;
}

/** Clear the cached backend conversation id (called on logout — the id belongs to the previous account). */
export function resetBackendConversationId() {
  activeConversationId = null;
}

export class AIService {
  /**
   * Send a question to the AI and return the reply text.
   * Uses the authenticated conversation pipeline when a session exists,
   * falling back to the stateless public endpoint, then to a local stub.
   */
  public static async query(text: string): Promise<string> {
    try {
      // Ensure a backend session exists (silent demo login if needed)
      await ApiClient.ensureSession();
    } catch {
      // Backend unreachable — fall through to stateless / local handling
    }

    const { token } = useAuthStoreSafe();
    if (token) {
      try {
        // Ensure conversation exists on the backend
        if (!activeConversationId) {
          const conv = await ApiClient.post<{ id: string }>("/api/chat/conversations", {
            title: text.slice(0, 40) || "Voice Session",
          });
          if (conv && conv.id) {
            activeConversationId = conv.id;
          }
        }

        if (activeConversationId) {
          const response = await ApiClient.post<{
            aiMessage?: { text: string };
            reply?: string;
          }>("/api/chat/messages", {
            conversationId: activeConversationId,
            text,
          });

          const reply =
            response?.aiMessage?.text ??
            response?.reply ??
            (typeof response === "string" ? response : undefined);
          if (reply && reply.trim()) {
            return reply;
          }
        }
      } catch (err) {
        console.warn("[AIService] Authenticated chat failed, trying public endpoint:", err);
      }
    }

    // Stateless fallback (no auth / conversation APIs unavailable)
    try {
      const response = await ApiClient.post<{ reply?: string }>("/api/chat", {
        message: text,
      });
      if (response?.reply) {
        return response.reply;
      }
    } catch (err) {
      console.warn("[AIService] Public chat endpoint unavailable:", err);
    }

    throw new Error("AI backend unavailable");
  }

  /** Push the locally created welcome conversation id to the backend-safe state. */
  public static async syncConversationsFromBackend(): Promise<Conversation[]> {
    try {
      await ApiClient.ensureSession();
      const convs = await ApiClient.get<any[]>("/api/chat/conversations");
      if (Array.isArray(convs)) {
        return convs.map((c: any) => ({
          id: c.id,
          title: c.title ?? "Conversation",
          createdAt: Number(c.createdAt ?? c.created_at ?? Date.now()),
          updatedAt: Number(c.updatedAt ?? c.updated_at ?? c.created_at ?? Date.now()),
          isPinned: Boolean(c.isPinned ?? c.is_pinned),
          messages: [],
        }));
      }
    } catch {
      // offline — local conversations remain authoritative
    }
    return [];
  }

  public static async persistConversations(conversations: Conversation[]): Promise<void> {
    try {
      await StorageService.setItem(CHAT_STORAGE_KEY, conversations);
    } catch {
      // non-fatal
    }
  }

  public static async loadPersistedConversations(): Promise<Conversation[] | null> {
    try {
      const stored = await StorageService.getItem<Conversation[]>(CHAT_STORAGE_KEY);
      return Array.isArray(stored) && stored.length ? stored : null;
    } catch {
      return null;
    }
  }
}

function useAuthStoreSafe(): { token: string | null } {
  try {
    // Lazy require to avoid circular import at module load time
    const { useAuthStore } = require("../../stores/authStore");
    return useAuthStore.getState();
  } catch {
    return { token: null };
  }
}
