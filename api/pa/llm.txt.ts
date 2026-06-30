import { generateLlmTxt } from "@page-assistant/core";
import { paLlmTxtMeta, paperAssistantCapabilityManifest } from "../../../lib/page-assistant/manifest.js";

export const config = { runtime: "nodejs" };

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "GET") {
    return new Response("GET only", { status: 405 });
  }
  const origin = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : new URL(req.url).origin;
  const meta = paLlmTxtMeta(process.env.NEXT_PUBLIC_SITE_URL ?? origin);
  const text = generateLlmTxt(meta, paperAssistantCapabilityManifest());
  return new Response(text, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
