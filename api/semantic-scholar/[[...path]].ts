// Proxies Semantic Scholar from the same domain as the app (fixes browser CORS on live).
// Deploys with every Vercel push — no separate Supabase step needed.

const SS = "https://api.semanticscholar.org/graph/v1";

export const config = { runtime: "edge" };

function corsHeaders(): HeadersInit {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Accept",
  };
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }

  const incoming = new URL(req.url);
  const prefix = "/api/semantic-scholar";
  let ssPath = incoming.pathname.startsWith(prefix)
    ? incoming.pathname.slice(prefix.length)
    : "";
  if (!ssPath || ssPath === "/") ssPath = "/paper/search";

  const target = `${SS}${ssPath}${incoming.search}`;
  const headers = new Headers({ Accept: "application/json" });
  const ct = req.headers.get("Content-Type");
  if (ct) headers.set("Content-Type", ct);

  const init: RequestInit = { method: req.method, headers };
  if (req.method !== "GET" && req.method !== "HEAD") {
    init.body = await req.text();
  }

  try {
    const res = await fetch(target, init);
    return new Response(res.body, {
      status: res.status,
      headers: {
        ...corsHeaders(),
        "Content-Type": res.headers.get("Content-Type") ?? "application/json",
      },
    });
  } catch (e) {
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "proxy error" }),
      { status: 502, headers: { ...corsHeaders(), "Content-Type": "application/json" } },
    );
  }
}
