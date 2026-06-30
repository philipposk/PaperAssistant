import { Assistant, InMemoryStore } from "@page-assistant/core";
import { paperAssistantLlm } from "../../lib/pa-llm.js";
import { requireUser } from "../../lib/auth.js";
import { enforceRateLimit } from "../../lib/ratelimit.js";
import { jsonResponse, preflight } from "../../lib/cors.js";
import {
  PAPERASSISTANT_PA_KNOWLEDGE,
  paLlmTxtMeta,
  paperAssistantCapabilityManifest,
} from "../../../lib/page-assistant/manifest.js";

export const config = { runtime: "nodejs" };

const SS = "https://api.semanticscholar.org/graph/v1";
const SEARCH_FIELDS = "title,authors,year,abstract,citationCount,externalIds";

function serverCapabilities() {
  const manifest = paperAssistantCapabilityManifest();
  const search = manifest.find((c) => c.name === "search_papers")!;
  return [
    {
      ...search,
      async run(args: { query: string; limit?: number }) {
        const params = new URLSearchParams({
          query: args.query,
          limit: String(args.limit ?? 10),
          fields: SEARCH_FIELDS,
        });
        const res = await fetch(`${SS}/paper/search?${params}`, {
          headers: { Accept: "application/json" },
        });
        if (!res.ok) throw new Error(`Semantic Scholar ${res.status}`);
        const data = (await res.json()) as {
          total: number;
          data: { title: string; year: number | null; paperId: string }[];
        };
        const lines = (data.data ?? []).map(
          (p, i) => `${i + 1}. ${p.title}${p.year ? ` (${p.year})` : ""} [${p.paperId}]`,
        );
        return {
          total: data.total,
          count: data.data?.length ?? 0,
          summary: lines.length ? lines.join("\n") : "No papers found.",
        };
      },
      render: (r: { summary: string; count: number; total: number }) =>
        `Found ${r.count} of ${r.total} matches.\n${r.summary}`,
    },
  ];
}

export default {
  async fetch(req: Request): Promise<Response> {
    const origin = req.headers.get("Origin");
    if (req.method === "OPTIONS") return preflight(origin);
    if (req.method !== "POST") return jsonResponse(405, { error: "POST only" }, origin);

    const auth = await requireUser(req);
    if (auth instanceof Response) return auth;

    const limited = enforceRateLimit(auth.userId, "agent");
    if (limited) return limited;

    let body: { message?: string; page?: { url?: string; path?: string }; history?: unknown };
    try {
      body = await req.json();
    } catch {
      return jsonResponse(400, { error: "Invalid JSON" }, origin);
    }
    if (!body?.message) return jsonResponse(400, { error: "message required" }, origin);

    const siteOrigin = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : new URL(req.url).origin;
    const meta = paLlmTxtMeta(process.env.NEXT_PUBLIC_SITE_URL ?? siteOrigin);

    const assistant = new Assistant({
      capabilities: serverCapabilities(),
      llm: paperAssistantLlm(),
      memory: new InMemoryStore(),
      appName: "PaperAssistant",
      persona: "Grounded research-workspace assistant for external agents.",
      knowledge: PAPERASSISTANT_PA_KNOWLEDGE,
    });

    try {
      const result = await assistant.chat({
        message: body.message,
        page: body.page ?? { url: meta.appUrl, path: "/" },
        history: body.history as Parameters<typeof assistant.chat>[0]["history"],
        caller: "agent",
      });
      return jsonResponse(200, {
        ...result,
        feedback: { endpoint: `${meta.appUrl}/api/pa/v1/feedback` },
      }, origin);
    } catch (e) {
      return jsonResponse(500, { error: e instanceof Error ? e.message : String(e) }, origin);
    }
  },
};
