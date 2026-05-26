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
