import { useState } from "react";
import { useParams } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { Download, FileArchive, Loader2 } from "lucide-react";
import { db } from "../lib/db";
import type { ExportManifest } from "../lib/manuscriptExport";

export function Export() {
  const { id = "" } = useParams();
  const project = useLiveQuery(() => db.projects.get(id), [id]);
  const noteCount = useLiveQuery(
    () => db.notes.where("project_id").equals(id).count(),
    [id],
  ) ?? 0;
  const refCount = useLiveQuery(
    () => db.references.where("project_id").equals(id).count(),
    [id],
  ) ?? 0;
  const fileCount = useLiveQuery(
    () => db.files.where("project_id").equals(id).count(),
    [id],
  ) ?? 0;
  const figCount = useLiveQuery(
    () =>
      db.files
        .where("project_id")
        .equals(id)
        .filter((f) => f.mime.startsWith("image/"))
        .count(),
    [id],
  ) ?? 0;
  const tableCount = useLiveQuery(
    () =>
      db.files
        .where("project_id")
        .equals(id)
        .filter((f) => f.mime === "text/csv" || f.name.endsWith(".csv"))
        .count(),
    [id],
  ) ?? 0;

  const [status, setStatus] = useState<"idle" | "building" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [manifest, setManifest] = useState<ExportManifest | null>(null);

  async function buildAndDownload() {
    setStatus("building");
    setError(null);
    try {
      const { buildManuscriptZip } = await import("../lib/manuscriptExport");
      const { blob, filename, manifest } = await buildManuscriptZip(id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      setManifest(manifest);
      setStatus("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setStatus("error");
    }
  }

  if (!project) {
    return (
      <div className="px-8 py-16 max-w-3xl mx-auto text-center text-sm text-[var(--color-ink-3)]">
        Loading…
      </div>
    );
  }

  return (
    <div className="px-8 py-8 max-w-3xl mx-auto">
      <h1 className="serif text-3xl mb-1">Export manuscript</h1>
      <p className="text-sm text-[var(--color-ink-3)] mb-6">
        Bundle this project as a Quarto-ready folder. Open <code className="mono text-xs">index.qmd</code> in Quarto / RStudio / VS Code with the Quarto extension to render PDF, HTML, DOCX, or LaTeX.
      </p>

      <section className="rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-[var(--color-surface)] p-5 mb-5">
        <div className="serif text-lg mb-3">
          <FileArchive size={18} className="inline mr-2 text-[var(--color-ink-3)]" />
          What's included
        </div>
        <ul className="text-sm space-y-1 mb-4">
          <li>
            <span className="text-[var(--color-ink-3)] inline-block w-32">
              index.qmd
            </span>
            <span className="font-medium">{noteCount}</span> note
            {noteCount === 1 ? "" : "s"} merged in created-at order, with Quarto YAML.
          </li>
          <li>
            <span className="text-[var(--color-ink-3)] inline-block w-32">
              references.bib
            </span>
            <span className="font-medium">{refCount}</span> citation
            {refCount === 1 ? "" : "s"} exported via citation-js.
          </li>
          <li>
            <span className="text-[var(--color-ink-3)] inline-block w-32">
              figures/
            </span>
            <span className="font-medium">{figCount}</span> image
            {figCount === 1 ? "" : "s"} (auto-referenced from index.qmd).
          </li>
          <li>
            <span className="text-[var(--color-ink-3)] inline-block w-32">
              tables/
            </span>
            <span className="font-medium">{tableCount}</span> CSV
            {tableCount === 1 ? "" : "s"}.
          </li>
          <li>
            <span className="text-[var(--color-ink-3)] inline-block w-32">
              files/
            </span>
            <span className="font-medium">
              {fileCount - figCount - tableCount}
            </span>{" "}
            other file{fileCount - figCount - tableCount === 1 ? "" : "s"}.
          </li>
          <li>
            <span className="text-[var(--color-ink-3)] inline-block w-32">
              README.md
            </span>
            Quarto render instructions + project description.
          </li>
          <li>
            <span className="text-[var(--color-ink-3)] inline-block w-32">
              export-manifest.json
            </span>
            Counts + timestamp.
          </li>
        </ul>

        <button
          type="button"
          onClick={buildAndDownload}
          disabled={status === "building"}
          className="px-4 py-2 rounded-md bg-[var(--color-accent)] text-[#f6f2ea] text-sm font-medium hover:bg-[var(--color-accent-2)] disabled:opacity-60 flex items-center gap-2"
        >
          {status === "building" ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Download size={14} />
          )}
          {status === "building" ? "Building zip…" : "Download .zip"}
        </button>

        {status === "done" && manifest && (
          <div className="mt-3 text-xs text-[var(--color-green)]">
            Built export with {manifest.notes} notes, {manifest.references}{" "}
            references, {manifest.figures + manifest.tables + manifest.other_files} files.
          </div>
        )}
        {status === "error" && error && (
          <div className="mt-3 text-xs text-[var(--color-warm)]">{error}</div>
        )}
      </section>

      <section className="rounded-[var(--radius-lg)] border border-dashed border-[var(--color-line-2)] p-5 text-sm text-[var(--color-ink-3)]">
        <strong className="text-[var(--color-ink-2)]">Next step (Quarto):</strong>
        <pre className="mono text-[11px] mt-2 bg-[var(--color-surface-2)] p-3 rounded-md overflow-x-auto">
{`cd ${project.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-export
quarto render index.qmd --to pdf
# or --to html, --to docx, --to latex`}
        </pre>
      </section>
    </div>
  );
}
