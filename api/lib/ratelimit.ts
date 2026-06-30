/** Per-user fixed-window rate limit for spend endpoints (LLM / voice / agent). */

const windows = new Map<string, { n: number; reset: number }>();

const LIMITS: Record<string, { max: number; windowMs: number }> = {
  llm: { max: Number(process.env.PA_RATE_LLM ?? 30), windowMs: 60_000 },
  voice: { max: Number(process.env.PA_RATE_VOICE ?? 20), windowMs: 60_000 },
  agent: { max: Number(process.env.PA_RATE_AGENT ?? 10), windowMs: 60_000 },
  feedback: { max: Number(process.env.PA_RATE_FEEDBACK ?? 10), windowMs: 60_000 },
};

export function enforceRateLimit(
  userId: string,
  bucket: keyof typeof LIMITS,
): Response | null {
  const cfg = LIMITS[bucket];
  const key = `${bucket}:${userId}`;
  const now = Date.now();
  let hit = windows.get(key);
  if (!hit || now > hit.reset) {
    hit = { n: 0, reset: now + cfg.windowMs };
    windows.set(key, hit);
  }
  hit.n++;
  if (hit.n > cfg.max) {
    const retryAfter = Math.max(1, Math.ceil((hit.reset - now) / 1000));
    return new Response(
      JSON.stringify({ error: "Too many requests. Try again shortly.", code: "rate_limit" }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": String(retryAfter),
        },
      },
    );
  }
  return null;
}
