import { paperAssistantLlm } from "../../../lib/pa-llm.js";
import { requireUser } from "../../../lib/auth.js";
import { enforceRateLimit } from "../../../lib/ratelimit.js";
import { jsonResponse, preflight } from "../../../lib/cors.js";

export const config = { runtime: "nodejs" };

export default {
  async fetch(req: Request): Promise<Response> {
    const origin = req.headers.get("Origin");
    if (req.method === "OPTIONS") return preflight(origin);
    if (req.method !== "POST") return jsonResponse(405, { error: "POST only" }, origin);

    const auth = await requireUser(req);
    if (auth instanceof Response) return auth;

    const limited = enforceRateLimit(auth.userId, "llm");
    if (limited) return limited;

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return jsonResponse(400, { error: "Invalid JSON" }, origin);
    }

    try {
      const llm = paperAssistantLlm();
      const out = await llm.complete(body as Parameters<typeof llm.complete>[0]);
      return jsonResponse(200, out, origin);
    } catch (e) {
      console.error("[pa/llm/complete]", e);
      return jsonResponse(502, { error: e instanceof Error ? e.message : String(e) }, origin);
    }
  },
};
