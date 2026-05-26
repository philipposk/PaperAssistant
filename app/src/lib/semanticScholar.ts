// Semantic Scholar Graph API — free, no key, ~1 req/sec for anonymous use.
// https://api.semanticscholar.org/graph/v1/

const BASE = "https://api.semanticscholar.org/graph/v1";

const SEARCH_FIELDS = [
  "title",
  "authors",
  "year",
  "abstract",
  "externalIds",
  "openAccessPdf",
  "citationCount",
  "tldr",
  "venue",
  "publicationDate",
  "publicationTypes",
].join(",");

export interface SsAuthor {
  authorId: string | null;
  name: string;
}

export interface SsPaper {
  paperId: string;
  title: string;
  abstract: string | null;
  authors: SsAuthor[];
  year: number | null;
  venue: string | null;
  publicationDate: string | null;
  publicationTypes: string[] | null;
  citationCount: number;
  externalIds: {
    DOI?: string;
    ArXiv?: string;
    PubMed?: string;
    MAG?: string;
    DBLP?: string;
    CorpusId?: number;
    URL?: string;
  } | null;
  openAccessPdf: { url: string; status?: string } | null;
  tldr: { text: string } | null;
}

export interface SsSearchResponse {
  total: number;
  offset: number;
  next?: number;
  data: SsPaper[];
}

export async function searchPapers(
  query: string,
  options: { limit?: number; offset?: number } = {},
): Promise<SsSearchResponse> {
  const params = new URLSearchParams({
    query,
    limit: String(options.limit ?? 20),
    offset: String(options.offset ?? 0),
    fields: SEARCH_FIELDS,
  });
  let res: Response;
  try {
    res = await fetch(`${BASE}/paper/search?${params}`, {
      headers: { Accept: "application/json" },
    });
  } catch (e) {
    // Network-layer error (CORS failure, DNS, offline). The Semantic
    // Scholar API doesn't always include CORS headers on 5xx responses,
    // so a transient outage surfaces as "Failed to fetch" rather than a
    // proper status — translate it.
    throw new Error(
      "Couldn't reach Semantic Scholar. Their free API is occasionally rate-limited or down — wait a minute and retry. " +
        (e instanceof Error ? `(${e.message})` : ""),
    );
  }
  if (res.status === 429) {
    throw new Error(
      "Rate limited by Semantic Scholar. The free tier shares a global limit (~1 req/sec). Wait a few seconds and retry.",
    );
  }
  if (res.status >= 500) {
    throw new Error(
      `Semantic Scholar is temporarily unavailable (HTTP ${res.status}). Try again in a minute.`,
    );
  }
  if (!res.ok) {
    throw new Error(`Semantic Scholar search failed: ${res.status} ${res.statusText}`);
  }
  return (await res.json()) as SsSearchResponse;
}

export async function getPaper(paperId: string): Promise<SsPaper> {
  const params = new URLSearchParams({ fields: SEARCH_FIELDS });
  const res = await fetch(`${BASE}/paper/${paperId}?${params}`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    throw new Error(`Semantic Scholar lookup failed: ${res.status}`);
  }
  return (await res.json()) as SsPaper;
}

// Outgoing references (papers this one cites).
const REF_FIELDS = "title,authors,year,externalIds";

export interface CitationEdgePaper {
  paperId: string;
  title: string;
  authors: SsAuthor[];
  year: number | null;
  externalIds: SsPaper["externalIds"];
}

export async function getPaperReferences(
  paperId: string,
  limit = 50,
): Promise<CitationEdgePaper[]> {
  const params = new URLSearchParams({
    fields: REF_FIELDS,
    limit: String(limit),
  });
  const res = await fetch(`${BASE}/paper/${paperId}/references?${params}`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    if (res.status === 429 || res.status >= 500) return [];
    throw new Error(`SS references failed: ${res.status}`);
  }
  const data = (await res.json()) as { data: { citedPaper: CitationEdgePaper }[] };
  return (data.data ?? [])
    .map((d) => d.citedPaper)
    .filter((p): p is CitationEdgePaper => Boolean(p?.paperId));
}

// Incoming citations (papers that cite this one).
export async function getPaperCitations(
  paperId: string,
  limit = 50,
): Promise<CitationEdgePaper[]> {
  const params = new URLSearchParams({
    fields: REF_FIELDS,
    limit: String(limit),
  });
  const res = await fetch(`${BASE}/paper/${paperId}/citations?${params}`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    if (res.status === 429 || res.status >= 500) return [];
    throw new Error(`SS citations failed: ${res.status}`);
  }
  const data = (await res.json()) as { data: { citingPaper: CitationEdgePaper }[] };
  return (data.data ?? [])
    .map((d) => d.citingPaper)
    .filter((p): p is CitationEdgePaper => Boolean(p?.paperId));
}

// Resolve a list of identifiers (DOI strings) to canonical SS paperIds + meta.
// Accepts a string like "DOI:10.1038/foo" or a raw DOI; SS supports both.
export async function batchGetPapers(
  ids: string[],
  fields = REF_FIELDS,
): Promise<SsPaper[]> {
  if (ids.length === 0) return [];
  const params = new URLSearchParams({ fields });
  const res = await fetch(`${BASE}/paper/batch?${params}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ ids }),
  });
  if (!res.ok) {
    if (res.status === 429 || res.status >= 500) return [];
    throw new Error(`SS batch failed: ${res.status}`);
  }
  const data = (await res.json()) as (SsPaper | null)[];
  return data.filter((p): p is SsPaper => Boolean(p));
}

// Convert a Semantic Scholar paper to a CSL-JSON record so it can drop into
// our existing Reference schema.
export function paperToCsl(paper: SsPaper): Record<string, unknown> {
  const doi = paper.externalIds?.DOI;
  const arxiv = paper.externalIds?.ArXiv;
  const date = paper.publicationDate ? paper.publicationDate.split("-").map(Number) : null;
  const issued = date && date[0]
    ? { "date-parts": [[date[0], ...(date.slice(1).filter(Boolean) as number[])]] }
    : paper.year
      ? { "date-parts": [[paper.year]] }
      : undefined;
  const isJournal = paper.publicationTypes?.some((t) =>
    /Journal|Review/i.test(t),
  );
  return {
    id: paper.paperId,
    type: isJournal ? "article-journal" : "article",
    title: paper.title,
    author: paper.authors.map((a) => {
      const parts = a.name.split(/\s+/);
      if (parts.length === 1) return { literal: a.name };
      return {
        family: parts[parts.length - 1],
        given: parts.slice(0, -1).join(" "),
      };
    }),
    "container-title": paper.venue ?? undefined,
    issued,
    abstract: paper.abstract ?? undefined,
    DOI: doi,
    URL: doi
      ? `https://doi.org/${doi}`
      : arxiv
        ? `https://arxiv.org/abs/${arxiv}`
        : paper.openAccessPdf?.url,
  };
}
