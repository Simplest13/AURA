import { create } from "zustand";
import { Conversation, Message } from "../types/chat";
import { AIService } from "../services/ai/AIService";

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
      text: "I’m ready to help with study questions, summaries, definitions, and exam prep. Ask me anything.",
      timestamp: Date.now(),
      memoryReferences: ["Live AI mode"],
    },
  ],
});

interface ChatStoreState {
  conversations: Conversation[];
  activeConversationId: string | null;
  isSending: boolean;

  setActiveConversation: (id: string) => void;
  createConversation: (title?: string) => string;
  deleteConversation: (id: string) => void;
  sendMessage: (text: string, customReply?: string) => Promise<void>;
  getActiveConversation: () => Conversation | undefined;
}

const welcomeConversation = createWelcomeConversation();

export const useChatStore = create<ChatStoreState>((set, get) => ({
  conversations: [welcomeConversation],
  activeConversationId: welcomeConversation.id,
  isSending: false,

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
    set((state) => ({
      conversations: [newConv, ...state.conversations],
      activeConversationId: newId,
    }));
    return newId;
  },

  deleteConversation: (id: string) => {
    set((state) => {
      const filtered = state.conversations.filter((c) => c.id !== id);
      const nextActive = filtered.length > 0 ? filtered[0].id : null;
      return {
        conversations: filtered,
        activeConversationId: state.activeConversationId === id ? nextActive : state.activeConversationId,
      };
    });
  },

  getActiveConversation: () => {
    const { conversations, activeConversationId } = get();
    return conversations.find((c) => c.id === activeConversationId);
  },

  sendMessage: async (text: string, customReply?: string) => {
    let activeId = get().activeConversationId;
    if (!activeId) {
      activeId = get().createConversation(text.slice(0, 30));
    }

    const userMsg: Message = {
      id: `msg-${Date.now()}-u`,
      conversationId: activeId,
      sender: "user",
      text,
      timestamp: Date.now(),
    };

    set((state) => ({
      isSending: true,
      conversations: state.conversations.map((c) =>
        c.id === activeId
          ? {
              ...c,
              updatedAt: Date.now(),
              messages: [...c.messages, userMsg],
            }
          : c
      ),
    }));

    await new Promise((res) => setTimeout(res, 400));

    let replyText = customReply;
    if (!replyText) {
      try {
        replyText = await AIService.query(text);
      } catch (error) {
        console.warn("[chatStore] AI query failed, falling back to local stub:", error);
        replyText = "I’m offline right now, but here’s a quick study-oriented answer: try breaking the question into concepts, definitions, and one example.";
      }
    }

    const auraMsg: Message = {
      id: `msg-${Date.now()}-a`,
      conversationId: activeId,
      sender: "aura",
      text: replyText,
      timestamp: Date.now(),
      memoryReferences: ["Referenced memory: mid-term prep", "AURA Knowledge"],
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
  },
}));
