// Semantic Scholar Graph API — proxied in browser to avoid CORS failures.
// https://api.semanticscholar.org/graph/v1/

function apiBase(): string {
  // Same-origin proxy: Vite in dev, Vercel edge function in production.
  return "/api/semantic-scholar";
}

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

async function ssFetch(path: string, init?: RequestInit): Promise<Response> {
  const base = apiBase();
  const url = `${base}${path.startsWith("/") ? path : `/${path}`}`;
  try {
    return await fetch(url, {
      ...init,
      headers: {
        Accept: "application/json",
        ...(init?.headers ?? {}),
      },
    });
  } catch (e) {
    throw new Error(
      "Couldn't reach Semantic Scholar. Their free API is occasionally rate-limited or down — wait a minute and retry. " +
        (e instanceof Error ? `(${e.message})` : ""),
    );
  }
}

function ssError(res: Response, context: string): Error {
  if (res.status === 429) {
    return new Error(
      "Rate limited by Semantic Scholar. The free tier shares a global limit (~1 req/sec). Wait a few seconds and retry.",
    );
  }
  if (res.status >= 500) {
    return new Error(
      `Semantic Scholar is temporarily unavailable (HTTP ${res.status}). Try again in a minute.`,
    );
  }
  return new Error(`Semantic Scholar ${context} failed: ${res.status} ${res.statusText}`);
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
  const res = await ssFetch(`/paper/search?${params}`);
  if (!res.ok) throw ssError(res, "search");
  return (await res.json()) as SsSearchResponse;
}

export async function getPaper(paperId: string): Promise<SsPaper> {
  const params = new URLSearchParams({ fields: SEARCH_FIELDS });
  const res = await ssFetch(`/paper/${paperId}?${params}`);
  if (!res.ok) throw ssError(res, "lookup");
  return (await res.json()) as SsPaper;
}

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
  const res = await ssFetch(`/paper/${paperId}/references?${params}`);
  if (!res.ok) {
    if (res.status === 429 || res.status >= 500) return [];
    throw ssError(res, "references");
  }
  const data = (await res.json()) as { data: { citedPaper: CitationEdgePaper }[] };
  return (data.data ?? [])
    .map((d) => d.citedPaper)
    .filter((p): p is CitationEdgePaper => Boolean(p?.paperId));
}

export async function getPaperCitations(
  paperId: string,
  limit = 50,
): Promise<CitationEdgePaper[]> {
  const params = new URLSearchParams({
    fields: REF_FIELDS,
    limit: String(limit),
  });
  const res = await ssFetch(`/paper/${paperId}/citations?${params}`);
  if (!res.ok) {
    if (res.status === 429 || res.status >= 500) return [];
    throw ssError(res, "citations");
  }
  const data = (await res.json()) as { data: { citingPaper: CitationEdgePaper }[] };
  return (data.data ?? [])
    .map((d) => d.citingPaper)
    .filter((p): p is CitationEdgePaper => Boolean(p?.paperId));
}

export async function batchGetPapers(
  ids: string[],
  fields = REF_FIELDS,
): Promise<SsPaper[]> {
  if (ids.length === 0) return [];
  const params = new URLSearchParams({ fields });
  const res = await ssFetch(`/paper/batch?${params}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ids }),
  });
  if (!res.ok) {
    if (res.status === 429 || res.status >= 500) return [];
    throw ssError(res, "batch");
  }
  const data = (await res.json()) as (SsPaper | null)[];
  return data.filter((p): p is SsPaper => Boolean(p));
}

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
