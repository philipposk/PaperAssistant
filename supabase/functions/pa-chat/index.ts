// pa-chat — host-funded free-tier LLM proxy for PaperAssistant.
//
// Flow: verify the caller's Supabase JWT -> resolve tier (free | paid) ->
// atomically reserve one request against the per-user DAILY quota -> call an
// OpenAI-compatible provider with a HOST key held only in this function's env
// -> meter tokens -> return the answer + remaining quota. If the provider call
// fails, the reserved request is refunded so an outage doesn't burn quota.
//
// Host keys (GROQ_API_KEY, NVIDIA_API_KEY, OPENROUTER_API_KEY) live in Edge Function secrets and
// NEVER reach the browser. SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY are injected
// automatically by the platform.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

// ----- tiers (must stay in sync with app/src/lib/aiPlans.ts) -----
const TIER_LIMITS: Record<string, number> = { free: 50, plus: 500 };
const TIER_CHARCAP: Record<string, number> = { free: 120_000, plus: 400_000 };
const MAX_OUTPUT_TOKENS = 2000;

// ----- providers (OpenAI /chat/completions compatible; tried in order) -----
interface Provider {
  name: string;
  baseURL: string;
  model: string;
  keyEnv: string;
}
// All three serve the same Llama-3.3-70B class model (consistent answers across
// fallbacks). Non-reasoning instruct models, so `message.content` is always the
// answer (the openai/gpt-oss reasoning models can return empty content).
const PROVIDERS: Provider[] = [
  { name: "groq", baseURL: "https://api.groq.com/openai/v1", model: "llama-3.3-70b-versatile", keyEnv: "GROQ_API_KEY" },
  { name: "nvidia", baseURL: "https://integrate.api.nvidia.com/v1", model: "meta/llama-3.3-70b-instruct", keyEnv: "NVIDIA_API_KEY" },
  { name: "openrouter", baseURL: "https://openrouter.ai/api/v1", model: "meta-llama/llama-3.3-70b-instruct:free", keyEnv: "OPENROUTER_API_KEY" },
];

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

function cors(origin: string | null) {
  return {
    "Access-Control-Allow-Origin": origin ?? "*",
    "Access-Control-Allow-Headers": "authorization, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}

function json(status: number, body: unknown, origin: string | null) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...cors(origin) },
  });
}

function todayUTC(): string {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

interface ChatMessage { role: "system" | "user" | "assistant"; content: string }

interface ProviderResult {
  text: string;
  inputTokens: number;
  outputTokens: number;
  model: string;
  provider: string;
}

async function callProvider(messages: ChatMessage[], maxTokens: number): Promise<ProviderResult> {
  let lastErr = "no providers configured";
  for (const p of PROVIDERS) {
    const key = Deno.env.get(p.keyEnv);
    if (!key) { lastErr = `${p.name}: missing key`; continue; }
    try {
      const res = await fetch(`${p.baseURL}/chat/completions`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${key}`,
          "Content-Type": "application/json",
          // OpenRouter ranking headers (ignored by other providers)
          "HTTP-Referer": "https://paperassistant.6x7.gr",
          "X-Title": "PaperAssistant",
        },
        body: JSON.stringify({
          model: p.model,
          max_tokens: maxTokens,
          messages,
        }),
      });
      if (!res.ok) {
        lastErr = `${p.name}: ${res.status} ${(await res.text()).slice(0, 200)}`;
        continue; // fall through to next provider
      }
      const data = await res.json();
      const text = data?.choices?.[0]?.message?.content;
      if (typeof text !== "string" || !text.trim()) {
        lastErr = `${p.name}: empty completion`;
        continue;
      }
      return {
        text,
        inputTokens: data?.usage?.prompt_tokens ?? 0,
        outputTokens: data?.usage?.completion_tokens ?? 0,
        model: data?.model ?? p.model,
        provider: p.name,
      };
    } catch (e) {
      lastErr = `${p.name}: ${e instanceof Error ? e.message : String(e)}`;
    }
  }
  throw new Error(lastErr);
}

async function resolveTier(admin: ReturnType<typeof createClient>, userId: string): Promise<string> {
  // Paid tier via the shared Stripe-driven subscriptions table (same as siblings).
  const { data } = await admin
    .schema("public")
    .from("subscriptions")
    .select("app, plan, status")
    .eq("user_id", userId)
    .in("app", ["paperassistant", "global"])
    .in("status", ["active", "trialing"]);
  if (!data || data.length === 0) return "free";
  // A 'global' all-access row wins; otherwise the paperassistant row.
  const row = data.find((r) => r.app === "global") ?? data[0];
  if (!row?.plan || row.plan === "free") return "free";
  return "plus"; // any active paid plan maps to the plus limits
}

Deno.serve(async (req) => {
  const origin = req.headers.get("Origin");
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors(origin) });
  if (req.method !== "POST") return json(405, { code: "method", error: "POST only" }, origin);

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });

  // 1) auth
  const authHeader = req.headers.get("Authorization") ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  if (!token) return json(401, { code: "auth", error: "Sign in to use the free AI tier." }, origin);
  const { data: userData, error: userErr } = await admin.auth.getUser(token);
  const user = userData?.user;
  if (userErr || !user) return json(401, { code: "auth", error: "Sign in to use the free AI tier." }, origin);

  // 2) parse + validate
  let body: { messages?: ChatMessage[]; maxTokens?: number };
  try { body = await req.json(); } catch { return json(400, { code: "bad_request", error: "Invalid JSON." }, origin); }
  const messages = body.messages;
  if (!Array.isArray(messages) || messages.length === 0) {
    return json(400, { code: "bad_request", error: "No messages." }, origin);
  }

  const tier = await resolveTier(admin, user.id);
  const limit = TIER_LIMITS[tier] ?? TIER_LIMITS.free;
  const charCap = TIER_CHARCAP[tier] ?? TIER_CHARCAP.free;
  const maxTokens = Math.min(body.maxTokens ?? 1500, MAX_OUTPUT_TOKENS);

  const chars = messages.reduce((n, m) => n + (m?.content?.length ?? 0), 0);
  if (chars > charCap) {
    return json(413, {
      code: "too_large",
      error: "Too much PDF context for this tier. Select fewer PDFs, or add your own API key in Settings.",
    }, origin);
  }

  // 3) atomic reserve
  let used: number;
  {
    const { data, error } = await admin
      .schema("paperassistant")
      .rpc("pa_chat_consume", { p_user: user.id, p_limit: limit });
    if (error) {
      if (String(error.message).includes("quota_exceeded")) {
        return json(429, {
          code: "quota",
          error: `Daily free limit reached (${limit}). Resets at 00:00 UTC, or add your own API key in Settings for unlimited use.`,
          quota: { used: limit, limit, remaining: 0, resetsUTC: todayUTC() },
        }, origin);
      }
      return json(500, { code: "server", error: "Quota check failed." }, origin);
    }
    used = typeof data === "number" ? data : Number(data);
  }

  // 4) provider call (refund the reservation on failure)
  let out: ProviderResult;
  try {
    out = await callProvider(messages, maxTokens);
  } catch (e) {
    await admin.schema("paperassistant").rpc("pa_chat_refund", { p_user: user.id });
    console.error("pa-chat provider failure:", e instanceof Error ? e.message : e);
    return json(502, { code: "provider", error: "AI provider unavailable, please try again." }, origin);
  }

  // 5) best-effort token accounting (don't fail the request if this errors)
  admin.schema("paperassistant")
    .rpc("pa_chat_record_tokens", { p_user: user.id, p_in: out.inputTokens, p_out: out.outputTokens })
    .then(() => {}, () => {});

  return json(200, {
    text: out.text,
    inputTokens: out.inputTokens,
    outputTokens: out.outputTokens,
    model: out.model,
    provider: out.provider,
    tier,
    quota: { used, limit, remaining: Math.max(limit - used, 0), resetsUTC: todayUTC() },
  }, origin);
});
