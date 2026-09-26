// src/utils/mockData.ts
/**
 * Deterministic mock responses for demo queries.
 * Add more patterns as needed for the project demos.
 */
export function getMockResponse(prompt: string): string {
  const lowered = prompt.toLowerCase().trim();
  if (lowered.includes("difference between tcp and udp")) {
    return "TCP provides reliable, ordered delivery with connection establishment, while UDP is connectionless, unordered, and faster but without reliability guarantees.";
  }
  if (lowered.includes("binary search")) {
    return "Binary search repeatedly halves a sorted list to locate a target in O(log n) time.";
  }
  if (lowered.includes("what is thermodynamics")) {
    return "Thermodynamics is the branch of physics that studies energy, heat, work, and the laws governing their transformations.";
  }
  if (lowered.includes("entropy")) {
    return "Entropy measures the disorder or randomness of a system and increases in spontaneous processes according to the second law of thermodynamics.";
  }
  // Default fallback
  return "I'm a mock AI. I can answer questions about networking, algorithms, thermodynamics, and study planning.";
}
