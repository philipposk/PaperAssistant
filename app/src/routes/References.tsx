import { useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { ClipboardCopy, FileText, Loader2, Plus, Trash2, Upload } from "lucide-react";
import { db, now, uid, type Reference } from "../lib/db";
import { pushReferenceDelete, pushReferenceUpsert } from "../lib/sync";

const STYLES = [
  { id: "apa", label: "APA" },
  { id: "modern-language-association", label: "MLA" },
  { id: "chicago-author-date", label: "Chicago" },
  { id: "vancouver", label: "Vancouver" },
  { id: "harvard-cite-them-right", label: "Harvard" },
  { id: "ieee", label: "IEEE" },
];

export function References() {
  const { id = "" } = useParams();
  const refs = useLiveQuery(
    () =>
      db.references
        .where("project_id")
        .equals(id)
        .reverse()
        .sortBy("updated_at"),
    [id],
  );

  const [style, setStyle] = useState("apa");
  const [doiInput, setDoiInput] = useState("");
  const [bibtexInput, setBibtexInput] = useState("");
  const [showBibtex, setShowBibtex] = useState(false);
  const [busy, setBusy] = useState<"" | "doi" | "bib">("");
  const [err, setErr] = useState<string | null>(null);

  const formatted = useLiveQuery(async () => {
    if (!refs?.length) return null;
    const { formatBibliography } = await import("../lib/citations");
    try {
      return formatBibliography(
        refs.map((r) => r.csl_json),
        style,
      );
    } catch (e) {
      console.warn("[citations] format failed", e);
      return null;
    }
  }, [refs, style]);

  async function addDoi() {
    if (!doiInput.trim()) return;
    setBusy("doi");
    setErr(null);
    try {
      const { lookupDoi, suggestCitationKey } = await import("../lib/citations");
      const csl = await lookupDoi(doiInput.trim());
      const t = now();
      const ref: Reference = {
        id: uid(),
        project_id: id,
        citation_key: suggestCitationKey(csl),
        csl_json: csl,
        doi:
          typeof csl.DOI === "string"
            ? csl.DOI
            : doiInput.trim().replace(/^https?:\/\/(dx\.)?doi\.org\//i, ""),
        url: typeof csl.URL === "string" ? csl.URL : undefined,
        tags: [],
        created_at: t,
        updated_at: t,
      };
      await db.references.add(ref);
      void pushReferenceUpsert(ref);
      setDoiInput("");
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy("");
    }
  }

  async function importBibtex() {
    if (!bibtexInput.trim()) return;
    setBusy("bib");
    setErr(null);
    try {
      const { parseBibtex, suggestCitationKey } = await import("../lib/citations");
      const entries = await parseBibtex(bibtexInput);
      const t = now();
      const records: Reference[] = entries.map((csl) => ({
        id: uid(),
        project_id: id,
        citation_key:
          typeof csl["citation-key"] === "string"
            ? (csl["citation-key"] as string)
            : suggestCitationKey(csl),
        csl_json: csl,
        bibtex: bibtexInput,
        doi: typeof csl.DOI === "string" ? (csl.DOI as string) : undefined,
        url: typeof csl.URL === "string" ? (csl.URL as string) : undefined,
        tags: [],
        created_at: t,
        updated_at: t,
      }));
      await db.references.bulkAdd(records);
      for (const r of records) void pushReferenceUpsert(r);
      setBibtexInput("");
      setShowBibtex(false);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy("");
    }
  }

  async function remove(refId: string) {
    if (!confirm("Delete this reference?")) return;
    await db.references.delete(refId);
    void pushReferenceDelete(refId);
  }

  async function exportBib() {
    if (!refs?.length) return;
    const { exportBibtex } = await import("../lib/citations");
    const text = exportBibtex(refs.map((r) => r.csl_json));
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "references.bib";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="px-8 py-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <h1 className="serif text-3xl">References</h1>
        <div className="flex items-center gap-2">
          <label className="mono uppercase text-[10px] tracking-wider text-[var(--color-ink-3)]">
            Style
          </label>
          <select
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            className="px-2 py-1.5 rounded-md border border-[var(--color-line)] bg-[var(--color-bg)] text-sm focus:outline-none focus:border-[var(--color-accent)]"
          >
            {STYLES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={exportBib}
            disabled={!refs?.length}
            className="px-3 py-1.5 rounded-md border border-[var(--color-line)] text-sm hover:bg-[var(--color-surface-2)] disabled:opacity-60 flex items-center gap-2"
          >
            <FileText size={14} />
            Export .bib
          </button>
        </div>
      </div>

      <section className="rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-[var(--color-surface)] p-5 mb-5">
        <div className="mono uppercase text-[10px] tracking-wider text-[var(--color-ink-3)] mb-3">
          Add by DOI
        </div>
        <div className="flex gap-2">
          <input
            value={doiInput}
            onChange={(e) => setDoiInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void addDoi();
            }}
            placeholder="10.1234/foo or https://doi.org/10.1234/foo"
            className="flex-1 px-3 py-2 rounded-md border border-[var(--color-line)] bg-[var(--color-bg)] text-sm mono focus:outline-none focus:border-[var(--color-accent)]"
          />
          <button
            type="button"
            onClick={addDoi}
            disabled={busy === "doi" || !doiInput.trim()}
            className="px-3 py-2 rounded-md bg-[var(--color-accent)] text-[#f6f2ea] text-sm font-medium hover:bg-[var(--color-accent-2)] disabled:opacity-60 flex items-center gap-2"
          >
            {busy === "doi" ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
            Add
          </button>
        </div>
        <button
          type="button"
          onClick={() => setShowBibtex((b) => !b)}
          className="mt-3 text-xs text-[var(--color-accent)] hover:underline flex items-center gap-1"
        >
          <Upload size={12} />
          {showBibtex ? "Hide BibTeX import" : "Import BibTeX"}
        </button>
        {showBibtex && (
          <div className="mt-3">
            <textarea
              value={bibtexInput}
              onChange={(e) => setBibtexInput(e.target.value)}
              placeholder={"@article{smith2024,\n  title={Example},\n  author={Smith, Jane},\n  year={2024}\n}"}
              rows={6}
              className="w-full px-3 py-2 rounded-md border border-[var(--color-line)] bg-[var(--color-bg)] text-sm mono focus:outline-none focus:border-[var(--color-accent)] mb-2"
            />
            <button
              type="button"
              onClick={importBibtex}
              disabled={busy === "bib" || !bibtexInput.trim()}
              className="px-3 py-2 rounded-md bg-[var(--color-accent)] text-[#f6f2ea] text-sm font-medium hover:bg-[var(--color-accent-2)] disabled:opacity-60 flex items-center gap-2"
            >
              {busy === "bib" ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
              Parse + add
            </button>
          </div>
        )}
        {err && (
          <div className="mt-3 text-xs text-[var(--color-warm)]">{err}</div>
        )}
      </section>

      {refs && refs.length > 0 ? (
        <>
          <ReferenceList
            refs={refs}
            formatted={formatted ?? null}
            onRemove={remove}
          />
        </>
      ) : (
        <div className="text-center py-12 text-sm text-[var(--color-ink-3)]">
          No references yet. Paste a DOI above to add your first citation.
        </div>
      )}
    </div>
  );
}

function ReferenceList({
  refs,
  formatted,
  onRemove,
}: {
  refs: Reference[];
  formatted: string | null;
  onRemove: (id: string) => void;
}) {
  const blockRef = useRef<HTMLDivElement>(null);
  const lines = useMemo(
    () => (formatted ? formatted.split(/\n+/).filter(Boolean) : []),
    [formatted],
  );

  return (
    <section className="rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-[var(--color-surface)] divide-y divide-[var(--color-line)]">
      {refs.map((r, i) => (
        <article key={r.id} className="px-5 py-4 group">
          <div className="flex items-start gap-3">
            <div className="flex-1 min-w-0" ref={i === 0 ? blockRef : null}>
              <div className="serif text-base leading-snug">
                {lines[i] || (r.csl_json.title as string) || r.citation_key}
              </div>
              <div className="mono text-[11px] text-[var(--color-ink-3)] mt-1 flex items-center gap-2 flex-wrap">
                <span className="text-[var(--color-warm)]">@{r.citation_key}</span>
                {r.doi && (
                  <a
                    href={`https://doi.org/${r.doi}`}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-[var(--color-accent)]"
                  >
                    doi:{r.doi}
                  </a>
                )}
                {r.url && !r.doi && (
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-[var(--color-accent)]"
                  >
                    link
                  </a>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigator.clipboard.writeText(`[@${r.citation_key}]`)}
              aria-label="Copy citation key"
              title={`Copy [@${r.citation_key}]`}
              className="text-[var(--color-ink-4)] hover:text-[var(--color-accent)] p-1"
            >
              <ClipboardCopy size={14} />
            </button>
            <button
              type="button"
              onClick={() => onRemove(r.id)}
              aria-label="Delete"
              className="text-[var(--color-ink-4)] hover:text-[var(--color-warm)] p-1"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </article>
      ))}
    </section>
  );
}
