import { normalizeTicket } from "@page-assistant/core";
import { enforceRateLimit } from "../../lib/ratelimit.js";
import { jsonResponse, preflight } from "../../lib/cors.js";

export const config = { runtime: "nodejs" };

const tickets: unknown[] = [];

export default {
  async fetch(req: Request): Promise<Response> {
    const origin = req.headers.get("Origin");
    if (req.method === "OPTIONS") return preflight(origin);

    if (req.method === "POST") {
      const limited = enforceRateLimit("anon", "feedback");
      if (limited) return limited;
      let body: unknown;
      try {
        body = await req.json();
      } catch {
        return jsonResponse(400, { error: "Invalid JSON" }, origin);
      }
      const t = normalizeTicket({ app: "PaperAssistant", ...(body as object) });
      if ("error" in t) return jsonResponse(400, t, origin);
      tickets.push(t);
      return jsonResponse(200, { ok: true }, origin);
    }

    if (req.method === "GET") {
      return jsonResponse(200, { tickets }, origin);
    }

    return jsonResponse(405, { error: "GET or POST only" }, origin);
  },
};
