import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import {
  PdfHighlighter,
  PdfLoader,
  TextHighlight,
  AreaHighlight,
  useHighlightContainerContext,
  usePdfHighlighterContext,
  type PdfHighlighterUtils,
} from "react-pdf-highlighter-extended";
import { ArrowLeft, Loader2, Trash2 } from "lucide-react";
import { db, now, uid, type Highlight as StoredHighlight } from "../lib/db";
import { pushHighlightDelete, pushHighlightUpsert } from "../lib/sync";

const COLORS = ["#ffd54f", "#a5d6a7", "#90caf9", "#f48fb1", "#ce93d8"];

// Shape we feed to PdfHighlighter.highlights — mirrors the library's Highlight
// interface. Cast as `any` only at the boundary to the library prop.
interface RuntimeHighlight {
  id: string;
  type: "text" | "area";
  position: Record<string, unknown>;
  content: { text?: string; image?: string };
  comment: string;
  color: string;
}

function toRuntime(h: StoredHighlight): RuntimeHighlight {
  return {
    id: h.id,
    type: h.content.image ? "area" : "text",
    position: h.position,
    content: h.content,
    comment: h.comment,
    color: h.color,
  };
}

function ColorBarTip({ onPick }: { onPick: (color: string) => void }) {
  return (
    <div className="rounded-md bg-[var(--color-surface)] border border-[var(--color-line)] shadow-lg px-2 py-1 flex items-center gap-2">
      {COLORS.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => onPick(c)}
          aria-label={`Highlight ${c}`}
          className="w-5 h-5 rounded-full border border-[var(--color-line)]"
          style={{ background: c }}
        />
      ))}
    </div>
  );
}

function SelectionTip({
  fileId,
  projectId,
}: {
  fileId: string;
  projectId: string;
}) {
  const ctx = usePdfHighlighterContext();
  async function add(color: string) {
    const selection = ctx.getCurrentSelection();
    if (!selection) return;
    const t = now();
    const isArea =
      "type" in selection &&
      (selection as unknown as { type?: string }).type === "area";
    const stored: StoredHighlight = {
      id: uid(),
      file_id: fileId,
      project_id: projectId,
      page: selection.position.boundingRect.pageNumber,
      position: selection.position as never,
      content: isArea
        ? { image: (selection as unknown as { content?: { image?: string } }).content?.image }
        : { text: selection.content.text ?? "" },
      comment: "",
      color,
      created_at: t,
      updated_at: t,
    };
    await db.highlights.add(stored);
    void pushHighlightUpsert(stored);
    ctx.removeGhostHighlight();
  }
  return <ColorBarTip onPick={add} />;
}

function HighlightItem({
  onDelete,
}: {
  onDelete: (id: string) => void;
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { highlight } = useHighlightContainerContext() as any as { highlight: RuntimeHighlight };
  if (highlight.type === "area") {
    return (
      <AreaHighlight
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        highlight={highlight as any}
        onChange={() => {
          /* edit-in-place deferred */
        }}
        style={{ background: highlight.color, opacity: 0.4 } as React.CSSProperties}
      />
    );
  }
  return (
    <TextHighlight
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      highlight={highlight as any}
      isScrolledTo={false}
      onClick={() => {
        if (confirm("Delete this highlight?")) onDelete(highlight.id);
      }}
      style={{ background: highlight.color, opacity: 0.4 }}
    />
  );
}

function PdfPane({
  pdfDocument,
  fileId,
  projectId,
  runtime,
  onDelete,
}: {
  pdfDocument: unknown;
  fileId: string;
  projectId: string;
  runtime: RuntimeHighlight[];
  onDelete: (id: string) => void;
}) {
  const utilsRef = useRef<PdfHighlighterUtils | null>(null);
  const handleUtilsRef = useCallback((u: PdfHighlighterUtils) => {
    utilsRef.current = u;
  }, []);

  return (
    <PdfHighlighter
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      pdfDocument={pdfDocument as any}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      highlights={runtime as any}
      selectionTip={<SelectionTip fileId={fileId} projectId={projectId} />}
      enableAreaSelection={(event) => event.altKey}
      utilsRef={handleUtilsRef}
      style={{ height: "100%" }}
    >
      <HighlightItem onDelete={onDelete} />
    </PdfHighlighter>
  );
}

export function PdfViewer() {
  const { id = "", fileId = "" } = useParams();
  const file = useLiveQuery(() => db.files.get(fileId), [fileId]);
  const stored = useLiveQuery(
    () => db.highlights.where("file_id").equals(fileId).toArray(),
    [fileId],
  );
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file?.blob) return;
    const url = URL.createObjectURL(file.blob);
    setBlobUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file?.blob]);

  const runtime: RuntimeHighlight[] = useMemo(
    () => (stored ?? []).map(toRuntime),
    [stored],
  );

  async function deleteHighlight(hid: string) {
    await db.highlights.delete(hid);
    void pushHighlightDelete(hid);
  }

  if (!file) {
    return (
      <div className="px-8 py-16 max-w-3xl mx-auto text-center">
        <h1 className="serif text-2xl mb-2">File not found.</h1>
        <Link to={`/projects/${id}/files`} className="text-[var(--color-accent)] underline text-sm">
          ← Back to files
        </Link>
      </div>
    );
  }

  const isPdf =
    file.mime === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
  if (!isPdf) {
    return (
      <div className="px-8 py-16 max-w-3xl mx-auto text-center">
        <h1 className="serif text-2xl mb-2">Not a PDF.</h1>
        <p className="text-sm text-[var(--color-ink-3)] mb-4">
          The PDF viewer only opens .pdf files. <strong>{file.name}</strong> is{" "}
          <span className="mono">{file.mime}</span>.
        </p>
        <Link to={`/projects/${id}/files`} className="text-[var(--color-accent)] underline text-sm">
          ← Back to files
        </Link>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      <aside className="w-72 shrink-0 border-r border-[var(--color-line)] bg-[var(--color-surface)] flex flex-col">
        <div className="px-4 py-3 border-b border-[var(--color-line)] flex items-center gap-2">
          <Link
            to={`/projects/${id}/files`}
            className="text-[var(--color-ink-3)] hover:text-[var(--color-ink)]"
            aria-label="Back to files"
          >
            <ArrowLeft size={14} />
          </Link>
          <div className="serif text-lg truncate flex-1">Highlights</div>
          <span className="mono text-[10px] text-[var(--color-ink-3)]">
            {runtime.length}
          </span>
        </div>
        <ul className="flex-1 overflow-y-auto">
          {runtime.length === 0 ? (
            <li className="px-4 py-6 text-center text-xs text-[var(--color-ink-3)]">
              Select text to highlight. Hold <kbd className="mono">Alt</kbd> + drag for an image region.
            </li>
          ) : (
            runtime.map((h) => (
              <li
                key={h.id}
                className="px-4 py-3 border-b border-[var(--color-line)] hover:bg-[var(--color-surface-2)] flex items-start gap-2"
              >
                <span
                  className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                  style={{ background: h.color }}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-[var(--color-ink-2)] line-clamp-3">
                    {h.content.text || (h.content.image ? "[image region]" : "(empty)")}
                  </div>
                  <div className="mono text-[10px] text-[var(--color-ink-3)] mt-1">
                    p.
                    {(h.position as { boundingRect?: { pageNumber?: number } })
                      .boundingRect?.pageNumber ?? "?"}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => deleteHighlight(h.id)}
                  className="text-[var(--color-ink-4)] hover:text-[var(--color-warm)] p-1"
                  aria-label="Delete"
                >
                  <Trash2 size={12} />
                </button>
              </li>
            ))
          )}
        </ul>
        <div className="px-4 py-2 border-t border-[var(--color-line)] mono text-[10px] uppercase text-[var(--color-ink-3)] truncate">
          {file.name}
        </div>
      </aside>
      <section className="flex-1 min-w-0 bg-[var(--color-surface-2)] overflow-hidden relative">
        {blobUrl ? (
          <PdfLoader document={{ url: blobUrl }}>
            {(pdfDocument) => (
              <PdfPane
                pdfDocument={pdfDocument}
                fileId={fileId}
                projectId={id}
                runtime={runtime}
                onDelete={deleteHighlight}
              />
            )}
          </PdfLoader>
        ) : (
          <div className="h-full flex items-center justify-center text-sm text-[var(--color-ink-3)]">
            <Loader2 size={16} className="animate-spin mr-2" />
            Loading PDF…
          </div>
        )}
      </section>
    </div>
  );
}
