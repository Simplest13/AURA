// src/services/ai/index.ts
import fetch from "node-fetch";
import { config } from "../../config";
import { getMockResponse } from "../../utils/mockData";

export interface ChatTurn {
  role: "system" | "user" | "assistant";
  content: string;
}

const SYSTEM_PROMPT =
  "You are AURA, a helpful student assistant. Give clear, accurate explanations that are appropriate for a university student, concise but complete. Use markdown formatting (headings, bullet points, tables) when it improves clarity.";

/**
 * Core multi-turn chat completion. Tries Groq first, then OpenAI, then Claude.
 * Throws if every provider fails so callers can decide on fallbacks.
 */
export async function getAIChatResponse(messages: ChatTurn[]): Promise<string> {
  const payloadMessages: ChatTurn[] = [{ role: "system", content: SYSTEM_PROMPT }, ...messages];

  if (config.groqApiKey) {
    try {
      const endpoint = "https://api.groq.com/openai/v1/chat/completions";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.groqApiKey}`,
        },
        body: JSON.stringify({
          model: config.groqModel,
          temperature: 0.4,
          messages: payloadMessages,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Groq request failed: ${response.status} ${errText}`);
      }

      const data = (await response.json()) as any;
      const text = data?.choices?.[0]?.message?.content;
      if (typeof text === "string" && text.trim()) {
        return text.trim();
      }
      throw new Error("Groq returned an empty response");
    } catch (err) {
      console.warn("[AIService] Groq request failed, falling back to OpenAI:", err);
    }
  }

  if (config.openAIApiKey) {
    try {
      const endpoint = "https://api.openai.com/v1/chat/completions";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.openAIApiKey}`,
        },
        body: JSON.stringify({
          model: config.openAIModel,
          temperature: 0.4,
          messages: payloadMessages,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`OpenAI request failed: ${response.status} ${errText}`);
      }

      const data = (await response.json()) as any;
      const text = data?.choices?.[0]?.message?.content;
      if (typeof text === "string" && text.trim()) {
        return text.trim();
      }
    } catch (err) {
      console.warn("[AIService] OpenAI request failed, falling back to Claude:", err);
    }
  }

  if (config.claudeApiKey) {
    try {
      const endpoint = "https://api.anthropic.com/v1/messages";
      // Claude has no "system" array role support in the same shape; extract it
      const system = payloadMessages.find((m) => m.role === "system")?.content ?? "";
      const convoMessages = payloadMessages
        .filter((m) => m.role !== "system")
        .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "x-api-key": config.claudeApiKey,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-3-5-sonnet-20240620",
          max_tokens: 1024,
          ...(system ? { system } : {}),
          messages: convoMessages.length ? convoMessages : [{ role: "user", content: "Hello" }],
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Claude API request failed: ${response.status} ${errText}`);
      }

      const data = (await response.json()) as any;
      const contentBlocks = data?.content ?? [];
      const text = contentBlocks
        .filter((c: any) => c.type === "text")
        .map((c: any) => c.text)
        .join(" ");
      if (text && text.trim()) {
        return text.trim();
      }
    } catch (err) {
      console.warn("[AIService] Claude request failed:", err);
    }
  }

  throw new Error("No AI provider available");
}

/** Back-compatible single-prompt helper used by several routes. */
export async function getAIResponse(userId: string, prompt: string): Promise<string> {
  if (config.useMockAI) {
    return getMockResponse(prompt);
  }
  try {
    return await getAIChatResponse([{ role: "user", content: prompt }]);
  } catch {
    return getMockResponse(prompt);
  }
}
