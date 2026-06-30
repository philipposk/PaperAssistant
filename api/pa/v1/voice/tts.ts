import { synthesize } from "@page-assistant/server";
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

    const limited = enforceRateLimit(auth.userId, "voice");
    if (limited) return limited;

    let body: { text?: string };
    try {
      body = await req.json();
    } catch {
      return jsonResponse(400, { error: "Invalid JSON" }, origin);
    }
    const text = body?.text;
    if (typeof text !== "string" || !text.trim()) {
      return jsonResponse(400, { error: "text required" }, origin);
    }
    if (text.length > 2000) {
      return jsonResponse(400, { error: "text too long (max 2000 chars)" }, origin);
    }

    try {
      const { audio, contentType } = await synthesize(body);
      return new Response(new Uint8Array(audio), {
        status: 200,
        headers: { "Content-Type": contentType, "Access-Control-Allow-Origin": origin ?? "*" },
      });
    } catch (e) {
      return jsonResponse(502, { error: e instanceof Error ? e.message : String(e) }, origin);
    }
  },
};
