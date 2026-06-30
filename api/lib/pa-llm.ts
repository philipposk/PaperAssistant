import type { LLMProvider } from "@page-assistant/core";
import { openaiProvider } from "@page-assistant/server";

/**
 * OpenAI-compatible provider chain — reuses the same host keys as pa-chat when set.
 * Falls back to ANTHROPIC/OPENAI/OPENROUTER env vars from @page-assistant/server.
 */
export function paperAssistantLlm(): LLMProvider {
  const chain: LLMProvider[] = [];
  const groq = process.env.GROQ_API_KEY;
  if (groq) {
    chain.push(
      openaiProvider({
        apiKey: groq,
        baseUrl: "https://api.groq.com/openai/v1",
        model: "llama-3.3-70b-versatile",
      }),
    );
  }
  const nvidia = process.env.NVIDIA_API_KEY;
  if (nvidia) {
    chain.push(
      openaiProvider({
        apiKey: nvidia,
        baseUrl: "https://integrate.api.nvidia.com/v1",
        model: "meta/llama-3.3-70b-instruct",
      }),
    );
  }
  const openrouter = process.env.OPENROUTER_API_KEY;
  if (openrouter) {
    chain.push(
      openaiProvider({
        apiKey: openrouter,
        baseUrl: "https://openrouter.ai/api/v1",
        model: "meta-llama/llama-3.3-70b-instruct:free",
      }),
    );
  }
  if (process.env.OPENAI_API_KEY) {
    chain.push(openaiProvider({ apiKey: process.env.OPENAI_API_KEY, model: process.env.PA_OPENAI_MODEL }));
  }
  if (process.env.ANTHROPIC_API_KEY) {
    // Anthropic via openrouter-style not available; skip unless using routerFromEnv separately
  }
  if (!chain.length) {
    throw new Error(
      "No LLM key configured. Set GROQ_API_KEY, NVIDIA_API_KEY, OPENROUTER_API_KEY, or OPENAI_API_KEY.",
    );
  }
  return {
    name: "paperassistant-router",
    async complete(input) {
      let last: unknown;
      for (const p of chain) {
        try {
          return await p.complete(input);
        } catch (e) {
          last = e;
        }
      }
      throw last;
    },
  };
}
