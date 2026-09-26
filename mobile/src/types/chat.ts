/**
 * Conversation & Memory Domain Types
 */

export interface Message {
  id: string;
  conversationId: string;
  sender: "user" | "aura";
  text: string;
  timestamp: number;
  memoryReferences?: string[]; // e.g., ["Referenced 2 memories", "Thermo_Ch4.pdf"]
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: Message[];
  isPinned?: boolean;
}

export interface Memory {
  id: string;
  content: string;
  sourceConversation?: string;
  timestamp: number;
  importance: "high" | "medium" | "low";
  tags: string[]; // e.g. ["Preferences", "Academics", "Routine", "Pinned"]
}
