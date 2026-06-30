import { transcribe } from "@page-assistant/server";
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

    const buf = Buffer.from(await req.arrayBuffer());
    if (!buf.length) return jsonResponse(400, { error: "audio body required" }, origin);

    const maxBytes = Number(process.env.PA_STT_MAX_BYTES ?? 5 * 1024 * 1024);
    if (buf.length > maxBytes) {
      return jsonResponse(400, { error: `audio too large (max ${maxBytes} bytes)` }, origin);
    }

    try {
      const text = await transcribe(buf, "audio.webm");
      return jsonResponse(200, { text }, origin);
    } catch (e) {
      return jsonResponse(502, { error: e instanceof Error ? e.message : String(e) }, origin);
    }
  },
};
