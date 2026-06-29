// Two ways to run the Ask assistant:
//   - "free": calls the host-funded pa-chat proxy (Supabase Edge Function),
//     which runs a fast open model on the project owner's dime. No key needed,
//     but rate-limited per signed-in user (50/day). No provider key ever
//     touches the browser on this path.
//   - "byok": bring-your-own-key. The user pastes an Anthropic or OpenAI key
//     in Settings; nothing leaves their browser except the direct API call.
//     Keys live in localStorage and are not synced.

import { supabase } from "./supabase";
import type { Quota } from "./aiPlans";

export type AiProvider = "anthropic" | "openai";
export type AiMode = "free" | "byok";

const KEY_ANTHROPIC = "paperassistant.ai.anthropicKey";
const KEY_OPENAI = "paperassistant.ai.openaiKey";
const KEY_PROVIDER = "paperassistant.ai.provider";
const KEY_MODEL = "paperassistant.ai.model";
const KEY_MODE = "paperassistant.ai.mode";

export interface AiSettings {
  mode: AiMode;
  provider: AiProvider;
  model: string;
  anthropicKey: string;
  openaiKey: string;
}

export const DEFAULT_MODEL: Record<AiProvider, string> = {
  anthropic: "claude-sonnet-4-6",
  openai: "gpt-4o-mini",
};

export function loadAiSettings(): AiSettings {
  const provider = (localStorage.getItem(KEY_PROVIDER) as AiProvider) || "anthropic";
  const mode = (localStorage.getItem(KEY_MODE) as AiMode) || "free";
  return {
    mode,
    provider,
    model: localStorage.getItem(KEY_MODEL) || DEFAULT_MODEL[provider],
    anthropicKey: localStorage.getItem(KEY_ANTHROPIC) || "",
    openaiKey: localStorage.getItem(KEY_OPENAI) || "",
  };
}

export function saveAiSettings(next: Partial<AiSettings>) {
  if (next.mode) localStorage.setItem(KEY_MODE, next.mode);
  if (next.provider) localStorage.setItem(KEY_PROVIDER, next.provider);
  if (next.model !== undefined) localStorage.setItem(KEY_MODEL, next.model);
  if (next.anthropicKey !== undefined)
    localStorage.setItem(KEY_ANTHROPIC, next.anthropicKey);
  if (next.openaiKey !== undefined)
    localStorage.setItem(KEY_OPENAI, next.openaiKey);
}

// Does the currently selected provider have a non-empty key?
function keyPresent(s: AiSettings): boolean {
  return Boolean(
    s.provider === "anthropic" ? s.anthropicKey.trim() : s.openaiKey.trim(),
  );
}

export function hasAiConfigured(): boolean {
  const s = loadAiSettings();
  if (s.mode === "free") return true;
  return keyPresent(s);
}

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatResult {
  text: string;
  inputTokens?: number;
  outputTokens?: number;
  quota?: Quota;
}

export async function chat(
  messages: ChatMessage[],
  options: { maxTokens?: number } = {},
): Promise<ChatResult> {
  const s = loadAiSettings();
  const useProxy = s.mode === "free" || !keyPresent(s);
  if (useProxy) return chatViaProxy(messages, options);
  if (s.provider === "anthropic") return chatAnthropic(messages, s, options);
  return chatOpenAI(messages, s, options);
}

async function chatViaProxy(
  messages: ChatMessage[],
  options: { maxTokens?: number },
): Promise<ChatResult> {
  if (!supabase) {
    throw new Error(
      "Sign in to use the free AI tier, or add your own API key in Settings.",
    );
  }
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) {
    throw new Error(
      "Sign in to use the free AI tier, or add your own API key in Settings.",
    );
  }
  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/pa-chat`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ messages, maxTokens: options.maxTokens }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `AI error ${res.status}`);
  }
  return data as ChatResult;
}

async function chatAnthropic(
  messages: ChatMessage[],
  s: AiSettings,
  options: { maxTokens?: number },
): Promise<ChatResult> {
  if (!s.anthropicKey.trim()) throw new Error("Add an Anthropic API key in Settings.");
  const system = messages.filter((m) => m.role === "system").map((m) => m.content).join("\n\n");
  const conv = messages.filter((m) => m.role !== "system");
  const body = {
    model: s.model || DEFAULT_MODEL.anthropic,
    max_tokens: options.maxTokens ?? 1024,
    system: system || undefined,
    messages: conv.map((m) => ({ role: m.role, content: m.content })),
  };
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": s.anthropicKey.trim(),
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Anthropic ${res.status}: ${errText.slice(0, 300)}`);
  }
  const data = (await res.json()) as {
    content: { type: string; text?: string }[];
    usage?: { input_tokens?: number; output_tokens?: number };
  };
  const text = data.content
    .filter((c) => c.type === "text")
    .map((c) => c.text ?? "")
    .join("");
  return {
    text,
    inputTokens: data.usage?.input_tokens,
    outputTokens: data.usage?.output_tokens,
  };
}

async function chatOpenAI(
  messages: ChatMessage[],
  s: AiSettings,
  options: { maxTokens?: number },
): Promise<ChatResult> {
  if (!s.openaiKey.trim()) throw new Error("Add an OpenAI API key in Settings.");
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${s.openaiKey.trim()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: s.model || DEFAULT_MODEL.openai,
      max_tokens: options.maxTokens ?? 1024,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    }),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`OpenAI ${res.status}: ${errText.slice(0, 300)}`);
  }
  const data = (await res.json()) as {
    choices: { message: { content: string } }[];
    usage?: { prompt_tokens?: number; completion_tokens?: number };
  };
  return {
    text: data.choices[0]?.message?.content ?? "",
    inputTokens: data.usage?.prompt_tokens,
    outputTokens: data.usage?.completion_tokens,
  };
}
