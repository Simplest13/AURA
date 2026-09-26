/**
 * AURA Mock AI Service & Conversation Engine
 * Provides deterministic and realistic conversational responses for engineering,
 * computer science, science, and study productivity.
 */

export interface MockAIResponse {
  answer: string;
  category: string;
  suggestedFollowUp?: string;
}

export class MockAIService {
  private static responses: Record<string, string> = {
    recursion:
      "Recursion is a computational method where a function solves a problem by calling itself with smaller instances of the same problem until reaching a base condition. Key components include the base case, recursive step, and the call stack frame allocation.",

    tcp:
      "TCP (Transmission Control Protocol) is connection-oriented, providing reliable, ordered, and error-checked delivery of octets using a 3-way handshake and checksums. In contrast, UDP (User Datagram Protocol) is connectionless, prioritizing low latency over reliability.",

    entropy:
      "Entropy in thermodynamics measures the degree of microscopic disorder or thermal energy unavailable for useful mechanical work. In information theory, Shannon entropy quantifies the average uncertainty or information content produced by a stochastic data source.",

    "binary search":
      "Binary search is an efficient logarithmic algorithm, O(log n), that repeatedly divides a sorted interval in half to locate a target element, significantly faster than linear search O(n).",

    "machine learning":
      "Machine learning focuses on training mathematical models using statistical algorithms to recognize patterns, generalize from empirical datasets, and make accurate predictions without explicit procedural instructions.",

    lecture:
      "I've summarized your latest Distributed Systems lecture: Topics included Consensus protocols (Raft, Paxos), CAP theorem trade-offs, and vector clocks for causal ordering.",

    study:
      "Your highest priority task today is the Operating Systems synchronization assignment due at 5:00 PM. Would you like me to quiz you on semaphores vs. mutexes?",

    schedule:
      "Looking at your academic calendar, you have Algorithms at 10:00 AM, Database Systems at 1:30 PM, and 2 pending assignments.",

    hello:
      "Greetings. I am AURA, your intelligent wearable companion. How can I assist your research or studies right now?",

    default:
      "I understand your query. Based on your study context and recent lecture notes, I recommend synthesizing the core fundamentals, reviewing relevant formulas, and testing your recall with flashcards.",
  };

  public static async query(text: string): Promise<string> {
    // Artificial delay to simulate neural network processing
    await new Promise((resolve) => setTimeout(resolve, 600));

    const normalized = text.toLowerCase().trim();

    if (!normalized) {
      return this.responses.default;
    }

    // Match keywords
    for (const [key, answer] of Object.entries(this.responses)) {
      if (key !== "default" && normalized.includes(key)) {
        return answer;
      }
    }

    if (normalized.includes("difference") || normalized.includes("vs") || normalized.includes("compare")) {
      return "When comparing these concepts, the critical distinction lies in their trade-offs: architectural overhead vs. operational throughput and latency constraints.";
    }

    return `Synthesized insights on "${text}": The foundational principles suggest decomposing the problem into discrete functional blocks and verifying the boundary conditions.`;
  }
}

