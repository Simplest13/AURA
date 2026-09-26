import { Memory } from "../../types/chat";
import { useMemoryStore } from "../../stores/memoryStore";

export class MemoryService {
  /**
   * Keyword relevance scoring algorithm
   */
  static retrieveRelevantMemories(query: string, limit = 3): Memory[] {
    const allMemories = useMemoryStore.getState().memories;
    if (!query || query.trim() === "") return allMemories.slice(0, limit);

    const terms = query
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .split(/\s+/)
      .filter((w) => w.length > 2);

    const scored = allMemories.map((mem) => {
      let score = 0;
      const contentLower = mem.content.toLowerCase();

      terms.forEach((term) => {
        if (contentLower.includes(term)) score += 3;
        mem.tags.forEach((tag) => {
          if (tag.toLowerCase().includes(term)) score += 2;
        });
      });

      if (mem.importance === "high") score += 1.5;

      return { mem, score };
    });

    return scored
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((item) => item.mem);
  }

  /**
   * Automatically extracts and saves memorable facts from student prompts
   */
  static extractAndSaveMemory(userMessage: string): void {
    const lower = userMessage.toLowerCase();
    if (lower.includes("exam on") || lower.includes("exam in")) {
      useMemoryStore.getState().addMemory(userMessage, "high", ["Academics"]);
    } else if (lower.includes("prefer") || lower.includes("always")) {
      useMemoryStore.getState().addMemory(userMessage, "medium", ["Preferences"]);
    }
  }
}
