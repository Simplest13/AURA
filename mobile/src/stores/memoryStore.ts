import { create } from "zustand";
import { Memory } from "../types/chat";
import { MOCK_MEMORIES } from "../utils/mockData";

interface MemoryStoreState {
  memories: Memory[];
  addMemory: (content: string, importance?: "high" | "medium" | "low", tags?: string[]) => void;
  deleteMemory: (id: string) => void;
  searchMemories: (query: string) => Memory[];
}

export const useMemoryStore = create<MemoryStoreState>((set, get) => ({
  memories: MOCK_MEMORIES,

  addMemory: (content, importance = "medium", tags = ["Academics"]) => {
    const newMem: Memory = {
      id: `mem-${Date.now()}`,
      content,
      timestamp: Date.now(),
      importance,
      tags,
    };
    set((state) => ({ memories: [newMem, ...state.memories] }));
  },

  deleteMemory: (id) => {
    set((state) => ({ memories: state.memories.filter((m) => m.id !== id) }));
  },

  searchMemories: (query: string) => {
    if (!query || query.trim() === "") return get().memories;
    const q = query.toLowerCase();
    return get().memories.filter(
      (m) =>
        m.content.toLowerCase().includes(q) ||
        m.tags.some((t) => t.toLowerCase().includes(q))
    );
  },
}));
