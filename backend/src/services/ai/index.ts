// src/services/ai/index.ts
import fetch from "node-fetch";
import { config } from "../../config";
import { getMockResponse } from "../../utils/mockData";

/**
 * Retrieves an AI response for a given user prompt.
 * - In mock mode (`USE_MOCK_AI=true`) it returns a deterministic answer from `mockData`.
 * - In real mode it prefers OpenAI GPT and falls back to Anthropic Claude.
 */
export async function getAIResponse(userId: string, prompt: string): Promise<string> {
  if (config.useMockAI) {
    return getMockResponse(prompt);
  }

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
          messages: [
            {
              role: "system",
              content:
                "You are AURA, a helpful student assistant. Give clear, accurate explanations that are appropriate for a university student, concise but complete.",
            },
            { role: "user", content: prompt },
          ],
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
          messages: [
            {
              role: "system",
              content:
                "You are AURA, a helpful student assistant. Give clear, accurate explanations that are appropriate for a university student, concise but complete.",
            },
            { role: "user", content: prompt },
          ],
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
      const body = {
        model: "claude-3-5-sonnet-20240620",
        max_tokens: 1024,
        messages: [{ role: "user", content: prompt }],
      };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "x-api-key": config.claudeApiKey,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
        body: JSON.stringify(body),
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
      console.warn("[AIService] Claude request failed, falling back to the local mock engine:", err);
    }
  }

  return getMockResponse(prompt);
}
