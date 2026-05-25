// citation-js wrappers — DOI lookup, BibTeX parsing, bibliography rendering.
// citation-js is heavy; consumers should lazy-load this module via dynamic
// import to keep it out of the initial bundle.

import { Cite, plugins } from "@citation-js/core";
import "@citation-js/plugin-doi";
import "@citation-js/plugin-bibtex";
import "@citation-js/plugin-csl";

import type { Reference } from "./db";

type CslJson = Record<string, unknown>;

let configured = false;
function configure() {
  if (configured) return;
  // Tell the DOI plugin to use the more permissive Crossref endpoint.
  try {
    const cfg = plugins.config.get("@doi");
    if (cfg && typeof cfg === "object") {
      (cfg as Record<string, unknown>).type = "json";
    }
  } catch {
    // ignore — best-effort
  }
  configured = true;
}

export function suggestCitationKey(csl: CslJson): string {
  const author = Array.isArray(csl.author) && csl.author.length > 0
    ? ((csl.author[0] as { family?: string; literal?: string }).family ||
       (csl.author[0] as { family?: string; literal?: string }).literal ||
       "anon")
    : "anon";
  const year = (csl.issued as { "date-parts"?: number[][] } | undefined)
    ?.["date-parts"]?.[0]?.[0];
  const title = typeof csl.title === "string" ? csl.title : "";
  const firstWord = title.split(/\s+/).find((w) => w.length > 2) ?? "untitled";
  return [author, year ?? "nd", firstWord]
    .join("")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 40) || "untitled";
}

export async function lookupDoi(doi: string): Promise<CslJson> {
  configure();
  const cleaned = doi.trim().replace(/^https?:\/\/(dx\.)?doi\.org\//i, "");
  const cite = await Cite.async(cleaned);
  const entries = cite.data as CslJson[];
  if (!entries.length) throw new Error(`No metadata for DOI "${cleaned}".`);
  return entries[0];
}

export async function parseBibtex(bibtex: string): Promise<CslJson[]> {
  configure();
  const cite = await Cite.async(bibtex);
  return cite.data as CslJson[];
}

export function formatBibliographyEntry(csl: CslJson, style = "apa"): string {
  configure();
  const cite = new Cite(csl);
  return cite.format("bibliography", {
    format: "text",
    template: style,
    lang: "en-US",
  }) as string;
}

export function formatBibliography(items: CslJson[], style = "apa"): string {
  configure();
  if (items.length === 0) return "";
  const cite = new Cite(items);
  return cite.format("bibliography", {
    format: "text",
    template: style,
    lang: "en-US",
  }) as string;
}

export function exportBibtex(items: CslJson[]): string {
  configure();
  if (items.length === 0) return "";
  const cite = new Cite(items);
  return cite.format("bibtex") as string;
}

// Render `@citekey` and `[@citekey; @other]` tokens in a markdown string
// as inline citations like "(Smith, 2024)" using the project's reference
// set. Returns the rewritten markdown — does not touch CSL parsing.
export function renderInlineCitations(
  markdown: string,
  references: Reference[],
): string {
  if (!references.length) return markdown;
  const byKey = new Map(references.map((r) => [r.citation_key, r]));

  function single(key: string): string {
    const ref = byKey.get(key);
    if (!ref) return `[@${key}?]`;
    const csl = ref.csl_json;
    const family = Array.isArray(csl.author) && csl.author[0]
      ? (csl.author[0] as { family?: string }).family ?? key
      : key;
    const year =
      (csl.issued as { "date-parts"?: number[][] } | undefined)
        ?.["date-parts"]?.[0]?.[0] ?? "n.d.";
    return `${family}, ${year}`;
  }

  // [@a; @b; @c] → "(A, 2024; B, 2023)"
  let out = markdown.replace(/\[@([^\]]+)\]/g, (_, inner: string) => {
    const keys = inner.split(/[;,]\s*@?/).map((s) => s.trim()).filter(Boolean);
    return "(" + keys.map(single).join("; ") + ")";
  });

  // bare @key not inside brackets
  out = out.replace(/(^|[^[\w])@([a-zA-Z][\w]*)/g, (_, prefix: string, key: string) => {
    return `${prefix}(${single(key)})`;
  });

  return out;
}
