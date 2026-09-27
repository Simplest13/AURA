import { create } from "zustand";
import { Conversation, Message } from "../types/chat";
import { AIService } from "../services/ai/AIService";
import { StorageService } from "../services/storage/StorageService";
import { normalizeMessage } from "../utils/normalize";
import { useAuthStore } from "./authStore";

/** Per-user cache key: conversations never leak across accounts. */
const chatStorageKey = (userId: string | null | undefined) => `aura:user:${userId ?? "anon"}:conversations`;

const createWelcomeConversation = (): Conversation => ({
  id: "welcome-conversation",
  title: "AURA Study Assistant",
  createdAt: Date.now(),
  updatedAt: Date.now(),
  messages: [
    {
      id: "welcome-msg",
      conversationId: "welcome-conversation",
      sender: "aura",
      text: "I'm ready to help with study questions, summaries, definitions, and exam prep. Ask me anything.",
      timestamp: Date.now(),
      memoryReferences: ["Live AI mode"],
    },
  ],
});

interface ChatStoreState {
  conversations: Conversation[];
  activeConversationId: string | null;
  isSending: boolean;
  isHydrated: boolean;
  backendOffline: boolean;

  hydrate: () => Promise<void>;
  setActiveConversation: (id: string) => void;
  createConversation: (title?: string) => string;
  deleteConversation: (id: string) => void;
  sendMessage: (text: string, customReply?: string) => Promise<void>;
  getActiveConversation: () => Conversation | undefined;
  /** Clear local conversations (called on logout so accounts never share history). */
  reset: () => void;
}

function persist(conversations: Conversation[]) {
  void StorageService.setItem(chatStorageKey(useAuthStore.getState().user?.id), conversations);
}

export const useChatStore = create<ChatStoreState>((set, get) => ({
  conversations: [createWelcomeConversation()],
  activeConversationId: "welcome-conversation",
  isSending: false,
  isHydrated: false,
  backendOffline: false,

  hydrate: async () => {
    if (get().isHydrated) return;
    try {
      const stored = await StorageService.getItem<Conversation[]>(
        chatStorageKey(useAuthStore.getState().user?.id)
      );
      if (stored && stored.length) {
        set({
          conversations: stored,
          activeConversationId: stored[0].id,
          isHydrated: true,
        });
        return;
      }
    } catch {
      // ignore and use defaults
    }
    set({ isHydrated: true });
  },

  setActiveConversation: (id: string) => {
    set({ activeConversationId: id });
  },

  createConversation: (title = "New conversation") => {
    const newId = `conv-${Date.now()}`;
    const newConv: Conversation = {
      id: newId,
      title,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
    };
    let conversations: Conversation[] = [];
    set((state) => {
      conversations = [newConv, ...state.conversations];
      return { conversations, activeConversationId: newId };
    });
    persist(conversations);
    return newId;
  },

  deleteConversation: (id: string) => {
    let conversations: Conversation[] = [];
    set((state) => {
      conversations = state.conversations.filter((c) => c.id !== id);
      const nextActive =
        state.activeConversationId === id ? conversations[0]?.id ?? null : state.activeConversationId;
      return { conversations, activeConversationId: nextActive };
    });
    persist(conversations);
  },

  getActiveConversation: () => {
    const { conversations, activeConversationId } = get();
    return conversations.find((c) => c.id === activeConversationId);
  },

  sendMessage: async (text: string, customReply?: string) => {
    let activeId = get().activeConversationId;
    if (!activeId || activeId === "welcome-conversation") {
      activeId = get().createConversation(text.slice(0, 40));
    }

    const userMsg: Message = {
      id: `msg-${Date.now()}-u`,
      conversationId: activeId,
      sender: "user",
      text,
      timestamp: Date.now(),
    };

    let conversations: Conversation[] = [];
    set((state) => ({
      isSending: true,
      conversations: state.conversations.map((c) =>
        c.id === activeId
          ? {
              ...c,
              title:
                c.title === "New conversation" && c.messages.length === 0
                  ? text.slice(0, 40)
                  : c.title,
              updatedAt: Date.now(),
              messages: [...c.messages, userMsg],
            }
          : c
      ),
    }));

    let replyText = customReply;
    if (!replyText) {
      try {
        replyText = await AIService.query(text);
        set({ backendOffline: false });
      } catch (error: any) {
        console.warn("[chatStore] AI query failed, using local stub:", error);
        set({ backendOffline: true });
        replyText =
          "I can't reach the AI service right now. Check that the backend is running, then try again — your messages are saved locally and will be here when you return.";
      }
    }

    const auraMsg: Message = {
      id: `msg-${Date.now()}-a`,
      conversationId: activeId,
      sender: "aura",
      text: replyText,
      timestamp: Date.now(),
    };

    set((state) => ({
      isSending: false,
      conversations: state.conversations.map((c) =>
        c.id === activeId
          ? {
              ...c,
              updatedAt: Date.now(),
              messages: [...c.messages, auraMsg],
            }
          : c
      ),
    }));
    persist(get().conversations);
  },

  reset: () => {
    set({
      conversations: [createWelcomeConversation()],
      activeConversationId: "welcome-conversation",
      isSending: false,
      isHydrated: false,
      backendOffline: false,
    });
  },
}));

export { normalizeMessage };
