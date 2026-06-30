import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import MarkdownPreview from "@uiw/react-markdown-preview/nohighlight";
import type { MarkdownPreviewProps } from "@uiw/react-markdown-preview/nohighlight";
import { Loader2, Printer } from "lucide-react";
import { db } from "../lib/db";
import { assembleManuscriptMarkdown, figuresForPreview } from "../lib/manuscriptPreview";
import { getMarkdownMathPreviewOptions } from "../lib/markdownMath";
import { formatBibliography } from "../lib/citations";
import {
  getProjectCitationStyle,
  getProjectCustomCsl,
} from "../lib/projectSettings";
import { fileDisplayName } from "../lib/demoSeed/helpers";

function FigurePreview({ file }: { file: { id: string; name: string; blob: Blob; caption?: string } }) {
  const [url, setUrl] = useState<string>();
  useEffect(() => {
    const u = URL.createObjectURL(file.blob);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [file.blob]);

  return (
    <figure className="my-6 text-center">
      {url && (
        <img
          src={url}
          alt={fileDisplayName(file as never)}
          className="max-w-full h-auto mx-auto rounded border border-[var(--color-line)]"
        />
      )}
      <figcaption className="text-sm text-[var(--color-ink-3)] mt-2 serif">
        {fileDisplayName(file as never)}
      </figcaption>
    </figure>
  );
}

export function PaperPreview() {
  const { id = "" } = useParams();
  const project = useLiveQuery(() => db.projects.get(id), [id]);
  const files = useLiveQuery(
    () => db.files.where("project_id").equals(id).toArray(),
    [id],
  );
  const refs = useLiveQuery(
    () => db.references.where("project_id").equals(id).toArray(),
    [id],
  );
  const style = useLiveQuery(() => getProjectCitationStyle(id), [id]);
  const customCsl = useLiveQuery(() => getProjectCustomCsl(id), [id]);

  const [markdown, setMarkdown] = useState<string | null>(null);
  const [mathPreview, setMathPreview] = useState<
    Omit<MarkdownPreviewProps, "source"> | undefined
  >();
  const [bibliography, setBibliography] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const figures = useMemo(
    () => (files ? figuresForPreview(files) : []),
    [files],
  );

  useEffect(() => {
    void getMarkdownMathPreviewOptions().then(setMathPreview);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void (async () => {
      try {
        const { markdown: md } = await assembleManuscriptMarkdown(id);
        if (cancelled) return;
        setMarkdown(md);
        if (refs?.length && style) {
          const bib = formatBibliography(
            refs.map((r) => r.csl_json),
            style,
            id,
            customCsl,
          );
          if (!cancelled) setBibliography(bib);
        } else {
          setBibliography(null);
        }
      } catch {
        if (!cancelled) setMarkdown(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, refs, style, customCsl]);

  if (!project) {
    return (
      <div className="px-8 py-16 text-center text-sm text-[var(--color-ink-3)]">
        Loading…
      </div>
    );
  }

  return (
    <div className="paper-preview-page min-h-full">
      <div className="no-print px-8 py-4 border-b border-[var(--color-line)] bg-[var(--color-surface)] flex items-center justify-between gap-3 flex-wrap sticky top-0 z-10">
        <div>
          <h1 className="serif text-2xl">Paper preview</h1>
          <p className="text-xs text-[var(--color-ink-3)] mt-0.5">
            Full manuscript assembled from sections, figures, and bibliography.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to={`/projects/${id}/export`}
            className="text-sm text-[var(--color-accent)] hover:underline"
          >
            Export zip
          </Link>
          <button
            type="button"
            onClick={() => window.print()}
            className="px-3 py-1.5 rounded-md border border-[var(--color-line)] text-sm hover:bg-[var(--color-surface-2)] flex items-center gap-2"
          >
            <Printer size={14} />
            Print / PDF
          </button>
        </div>
      </div>

      <article className="paper-preview-body max-w-3xl mx-auto px-8 py-10 bg-[var(--color-surface)] my-6 rounded-[var(--radius-lg)] border border-[var(--color-line)] shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-sm text-[var(--color-ink-3)]">
            <Loader2 size={18} className="animate-spin mr-2" />
            Assembling preview…
          </div>
        ) : (
          <>
            {markdown && (
              <div data-color-mode="light" className="prose-paper">
                <MarkdownPreview source={markdown} {...mathPreview} />
              </div>
            )}
            {figures.length > 0 && (
              <section className="mt-8">
                <h2 className="serif text-xl mb-4 border-t border-[var(--color-line)] pt-6">
                  Figures
                </h2>
                {figures.map((f) => (
                  <FigurePreview key={f.id} file={f} />
                ))}
              </section>
            )}
            {bibliography && (
              <section className="mt-8 border-t border-[var(--color-line)] pt-6">
                <h2 className="serif text-xl mb-4">References</h2>
                <div className="text-sm leading-relaxed whitespace-pre-wrap text-[var(--color-ink-2)]">
                  {bibliography}
                </div>
              </section>
            )}
          </>
        )}
      </article>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          .paper-preview-body {
            box-shadow: none !important;
            border: none !important;
            margin: 0 !important;
            max-width: none !important;
          }
        }
      `}</style>
    </div>
  );
}
