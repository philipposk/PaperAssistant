import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { db, type FileRecord } from "../lib/db";

function useBlobUrl(blob: Blob | undefined): string | undefined {
  const [url, setUrl] = useState<string>();
  useEffect(() => {
    if (!blob) return;
    const u = URL.createObjectURL(blob);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [blob]);
  return url;
}

function FigureCard({ file, width }: { file: FileRecord; width: number }) {
  const url = useBlobUrl(file.blob);
  return (
    <figure
      style={{ width }}
      className="rounded-[var(--radius-md)] border border-[var(--color-line)] bg-[var(--color-surface)] overflow-hidden flex flex-col"
    >
      <div className="bg-[var(--color-surface-2)] flex items-center justify-center" style={{ minHeight: 120 }}>
        {url && (
          <img
            src={url}
            alt={file.name}
            className="block max-w-full h-auto"
            loading="lazy"
          />
        )}
      </div>
      <figcaption className="px-3 py-2 text-xs text-[var(--color-ink-2)]">
        <div className="truncate">{file.name}</div>
        <div className="mono text-[10px] text-[var(--color-ink-3)]">
          {(file.size / 1024).toFixed(1)} KB
        </div>
      </figcaption>
    </figure>
  );
}

export function Figures() {
  const { id = "" } = useParams();
  const [width, setWidth] = useState(360);
  const files = useLiveQuery(
    () => db.files.where("project_id").equals(id).toArray(),
    [id],
  );
  const figures = useMemo(
    () => (files ?? []).filter((f) => f.mime.startsWith("image/")),
    [files],
  );

  return (
    <div className="px-8 py-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="serif text-3xl">Figures</h1>
        <div className="flex items-center gap-3">
          <span className="mono text-[11px] uppercase text-[var(--color-ink-3)]">
            Width
          </span>
          <input
            type="range"
            min={120}
            max={720}
            step={20}
            value={width}
            onChange={(e) => setWidth(Number(e.target.value))}
          />
          <span className="mono text-xs">{width}px</span>
        </div>
      </div>

      {figures.length === 0 ? (
        <div className="text-center py-16 text-sm text-[var(--color-ink-3)]">
          No images uploaded in this project yet. Upload PNG/JPG/SVG files from
          the Files page.
        </div>
      ) : (
        <div className="flex flex-wrap gap-5">
          {figures.map((f) => (
            <FigureCard key={f.id} file={f} width={width} />
          ))}
        </div>
      )}
    </div>
  );
}
