import { useState } from "react";
import { useParams } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { Check, ExternalLink, FileText, Loader2, Plus, Search } from "lucide-react";
import { db, now, uid, type Reference } from "../lib/db";
import { pushReferenceUpsert } from "../lib/sync";
import {
  paperToCsl,
  searchPapers,
  type SsPaper,
} from "../lib/semanticScholar";
import { suggestCitationKey } from "../lib/citations";

export function SearchPapers() {
  const { id = "" } = useParams();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SsPaper[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [total, setTotal] = useState<number | null>(null);

  const existingDois = useLiveQuery(
    () =>
      db.references
        .where("project_id")
        .equals(id)
        .toArray()
        .then((rs) => new Set(rs.map((r) => r.doi).filter(Boolean) as string[])),
    [id],
  );

  async function run(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    setBusy(true);
    setErr(null);
    try {
      const res = await searchPapers(q, { limit: 20 });
      setResults(res.data ?? []);
      setTotal(res.total);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
      setResults([]);
      setTotal(null);
    } finally {
      setBusy(false);
    }
  }

  async function addPaper(paper: SsPaper) {
    const csl = paperToCsl(paper);
    const t = now();
    const ref: Reference = {
      id: uid(),
      project_id: id,
      citation_key: suggestCitationKey(csl),
      csl_json: csl,
      doi: paper.externalIds?.DOI,
      url:
        typeof csl.URL === "string"
          ? (csl.URL as string)
          : paper.openAccessPdf?.url,
      tags: [],
      created_at: t,
      updated_at: t,
    };
    await db.references.add(ref);
    void pushReferenceUpsert(ref);
  }

  return (
    <div className="px-8 py-8 max-w-5xl mx-auto">
      <h1 className="serif text-3xl mb-1">Find papers</h1>
      <p className="text-sm text-[var(--color-ink-3)] mb-6">
        Search Semantic Scholar (200M+ papers) and add any result to this
        project's references.
      </p>

      <form
        onSubmit={run}
        className="flex gap-2 mb-6 rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-[var(--color-surface)] p-3"
      >
        <div className="relative flex-1">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-3)]"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. graph neural networks for citation prediction"
            className="w-full pl-9 pr-3 py-2 rounded-md border border-[var(--color-line)] bg-[var(--color-bg)] text-sm focus:outline-none focus:border-[var(--color-accent)]"
            autoFocus
          />
        </div>
        <button
          type="submit"
          disabled={busy || !query.trim()}
          className="px-4 py-2 rounded-md bg-[var(--color-accent)] text-[#f6f2ea] text-sm font-medium hover:bg-[var(--color-accent-2)] disabled:opacity-60 flex items-center gap-2"
        >
          {busy ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
          Search
        </button>
      </form>

      {err && (
        <div className="rounded-md border border-[var(--color-warm)] bg-[var(--color-warm-soft)] p-3 mb-4 text-sm text-[var(--color-warm)]">
          {err}
        </div>
      )}

      {total !== null && !err && (
        <div className="mono text-[11px] uppercase text-[var(--color-ink-3)] mb-3">
          Showing {results.length} of {total.toLocaleString()} hits
        </div>
      )}

      <ul className="space-y-3">
        {results.map((p) => {
          const doi = p.externalIds?.DOI;
          const inProject = doi && existingDois?.has(doi);
          const oa = p.openAccessPdf?.url;
          return (
            <li
              key={p.paperId}
              className="rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-[var(--color-surface)] p-5"
            >
              <div className="flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="serif text-lg leading-snug">{p.title}</div>
                  <div className="text-sm text-[var(--color-ink-3)] mt-1">
                    {p.authors
                      .slice(0, 6)
                      .map((a) => a.name)
                      .join(", ")}
                    {p.authors.length > 6 && " …"}
                    {p.year && ` · ${p.year}`}
                    {p.venue && ` · ${p.venue}`}
                  </div>
                  {p.tldr?.text && (
                    <div className="mt-2 text-sm bg-[var(--color-surface-2)] rounded-md px-3 py-2 border-l-2 border-[var(--color-warm)]">
                      <span className="mono uppercase text-[10px] tracking-wider text-[var(--color-warm)] mr-2">
                        TL;DR
                      </span>
                      {p.tldr.text}
                    </div>
                  )}
                  {!p.tldr?.text && p.abstract && (
                    <div className="mt-2 text-sm text-[var(--color-ink-2)] line-clamp-3">
                      {p.abstract}
                    </div>
                  )}
                  <div className="mono text-[11px] text-[var(--color-ink-3)] mt-2 flex items-center gap-3 flex-wrap">
                    <span>cited {p.citationCount.toLocaleString()}</span>
                    {doi && (
                      <a
                        href={`https://doi.org/${doi}`}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-[var(--color-accent)]"
                      >
                        doi:{doi}
                      </a>
                    )}
                    {oa && (
                      <a
                        href={oa}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-[var(--color-accent)] flex items-center gap-1"
                      >
                        <FileText size={11} />
                        PDF
                      </a>
                    )}
                    <a
                      href={`https://www.semanticscholar.org/paper/${p.paperId}`}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-[var(--color-accent)] flex items-center gap-1"
                    >
                      <ExternalLink size={11} />
                      Semantic Scholar
                    </a>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => addPaper(p)}
                  disabled={Boolean(inProject)}
                  className={
                    "px-3 py-1.5 rounded-md text-sm flex items-center gap-2 shrink-0 " +
                    (inProject
                      ? "bg-[var(--color-surface-2)] text-[var(--color-ink-3)] cursor-default"
                      : "bg-[var(--color-accent)] text-[#f6f2ea] hover:bg-[var(--color-accent-2)]")
                  }
                >
                  {inProject ? <Check size={14} /> : <Plus size={14} />}
                  {inProject ? "In project" : "Add"}
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      {results.length === 0 && !busy && total === null && (
        <div className="text-center py-12 text-sm text-[var(--color-ink-3)]">
          Search 200M+ papers from Semantic Scholar's free corpus.
        </div>
      )}
    </div>
  );
}
