import { jsonResponse, preflight } from "../../lib/cors.js";

export const config = { runtime: "nodejs" };

export default {
  async fetch(req: Request): Promise<Response> {
    const origin = req.headers.get("Origin");
    if (req.method === "OPTIONS") return preflight(origin);
    return jsonResponse(200, { ok: true }, origin);
  },
};
