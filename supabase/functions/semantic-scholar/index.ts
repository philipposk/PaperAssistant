// Proxies Semantic Scholar Graph API (avoids browser CORS on 5xx / rate limits).

const SS = "https://api.semanticscholar.org/graph/v1";

function cors(origin: string | null) {
  return {
    "Access-Control-Allow-Origin": origin ?? "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, accept",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  };
}

Deno.serve(async (req) => {
  const origin = req.headers.get("Origin");
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: cors(origin) });
  }

  const incoming = new URL(req.url);
  const prefix = "/semantic-scholar";
  let ssPath = incoming.pathname;
  const fnIdx = ssPath.indexOf(prefix);
  if (fnIdx >= 0) ssPath = ssPath.slice(fnIdx + prefix.length);
  if (!ssPath.startsWith("/")) ssPath = `/${ssPath}`;
  if (ssPath === "/" || ssPath === "") ssPath = "/paper/search";

  const target = `${SS}${ssPath}${incoming.search}`;
  const headers = new Headers();
  headers.set("Accept", "application/json");
  const ct = req.headers.get("Content-Type");
  if (ct) headers.set("Content-Type", ct);

  const init: RequestInit = { method: req.method, headers };
  if (req.method !== "GET" && req.method !== "HEAD") {
    init.body = await req.text();
  }

  try {
    const res = await fetch(target, init);
    const body = await res.arrayBuffer();
    return new Response(body, {
      status: res.status,
      headers: {
        ...cors(origin),
        "Content-Type": res.headers.get("Content-Type") ?? "application/json",
      },
    });
  } catch (e) {
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "proxy error" }),
      { status: 502, headers: { ...cors(origin), "Content-Type": "application/json" } },
    );
  }
});
