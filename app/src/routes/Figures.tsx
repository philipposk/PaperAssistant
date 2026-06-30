import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { ImageUp } from "lucide-react";
import { db, fileIncludedInExport, type FileRecord } from "../lib/db";
import { fileDisplayName } from "../lib/demoSeed/helpers";
import {
  captureOrder,
  reorderFiles,
  restoreOrder,
  sortedSubset,
  updateFileMeta,
} from "../lib/fileReorder";
import { pushFileUpsert } from "../lib/sync";
import { useToast } from "../components/Toast";
import { DraggableShell, DragHandle, useDragReorder } from "../components/DragReorder";
import { replaceFileBlob } from "../lib/fileReplace";

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

function FigureCard({
  file,
  width,
  onExportChange,
  onCaptionChange,
  onReplace,
}: {
  file: FileRecord;
  width: number;
  onExportChange: (id: string, include: boolean) => void;
  onCaptionChange: (id: string, caption: string) => void;
  onReplace: (id: string, blob: Blob, name: string, mime: string) => void;
}) {
  const url = useBlobUrl(file.blob);
  const [editing, setEditing] = useState(false);
  const [captionDraft, setCaptionDraft] = useState(file.caption ?? "");
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <figure
      style={{ width }}
      className="rounded-[var(--radius-md)] border border-[var(--color-line)] bg-[var(--color-surface)] overflow-hidden flex flex-col"
    >
      <div className="px-2 py-1.5 border-b border-[var(--color-line)] flex items-center gap-1 bg-[var(--color-surface-2)]">
        <DragHandle />
        <span className="text-[10px] mono text-[var(--color-ink-3)] truncate flex-1">
          {file.name}
        </span>
      </div>
      <div className="bg-[var(--color-surface-2)] flex items-center justify-center" style={{ minHeight: 120 }}>
        {url && (
          <img
            src={url}
            alt={fileDisplayName(file)}
            className="block max-w-full h-auto"
            loading="lazy"
          />
        )}
      </div>
      <figcaption className="px-3 py-2 text-xs text-[var(--color-ink-2)] space-y-2">
        {editing ? (
          <div className="space-y-1">
            <input
              value={captionDraft}
              onChange={(e) => setCaptionDraft(e.target.value)}
              className="w-full px-2 py-1 rounded border border-[var(--color-line)] bg-[var(--color-bg)] text-xs"
              placeholder="Figure caption for export"
            />
            <div className="flex gap-2">
              <button
                type="button"
                className="text-[var(--color-accent)] hover:underline"
                onClick={() => {
                  onCaptionChange(file.id, captionDraft);
                  setEditing(false);
                }}
              >
                Save
              </button>
              <button
                type="button"
                className="text-[var(--color-ink-3)] hover:underline"
                onClick={() => {
                  setCaptionDraft(file.caption ?? "");
                  setEditing(false);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="text-left w-full hover:text-[var(--color-accent)]"
            title="Edit caption"
          >
            {fileDisplayName(file)}
          </button>
        )}
        <label className="flex items-center gap-1.5 cursor-pointer text-[11px]">
          <input
            type="checkbox"
            checked={fileIncludedInExport(file)}
            onChange={(e) => onExportChange(file.id, e.target.checked)}
            className="shrink-0"
          />
          Include in export
        </label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onReplace(file.id, f, f.name, f.type || "image/png");
            e.target.value = "";
          }}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="text-[11px] text-[var(--color-accent)] hover:underline flex items-center gap-1"
        >
          <ImageUp size={12} />
          Replace image
        </button>
      </figcaption>
    </figure>
  );
}

export function Figures() {
  const { id = "" } = useParams();
  const { show } = useToast();
  const [width, setWidth] = useState(360);
  const files = useLiveQuery(
    () => db.files.where("project_id").equals(id).toArray(),
    [id],
  );
  const figures = useMemo(
    () => sortedSubset(files ?? [], (f) => f.mime.startsWith("image/")),
    [files],
  );

  const handleReorder = async (orderedIds: string[]) => {
    const snapshot = captureOrder(figures);
    await reorderFiles(orderedIds);
    show("Figure order updated — export and manuscript follow this order.", {
      label: "Undo",
      onClick: () => void restoreOrder(snapshot),
    });
  };

  const { dragId, onDragStart, onDragOver, onDrop, onDragEnd } = useDragReorder(
    figures,
    (ids) => void handleReorder(ids),
  );

  async function setExport(fileId: string, include: boolean) {
    await updateFileMeta(fileId, { include_in_export: include });
    const fresh = await db.files.get(fileId);
    if (fresh) void pushFileUpsert(fresh);
  }

  async function handleReplace(
    fileId: string,
    blob: Blob,
    name: string,
    mime: string,
  ) {
    await replaceFileBlob(fileId, blob, name, mime, id);
    show("Figure image replaced.");
  }

  return (
    <div className="px-8 py-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-2 gap-3 flex-wrap">
        <h1 className="serif text-3xl">Figures</h1>
        <div className="flex items-center gap-3">
          <span className="mono text-[11px] uppercase text-[var(--color-ink-3)]">Width</span>
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
      <p className="text-xs text-[var(--color-ink-3)] mb-6">
        Drag figures to reorder. Order applies to the manuscript export. Click a caption to edit.
      </p>

      {figures.length === 0 ? (
        <div className="text-center py-16 text-sm text-[var(--color-ink-3)]">
          No images uploaded in this project yet. Upload PNG/JPG/SVG files from the Files page.
        </div>
      ) : (
        <div className="flex flex-wrap gap-5">
          {figures.map((f) => (
            <DraggableShell
              key={f.id}
              id={f.id}
              dragging={dragId === f.id}
              onDragStart={onDragStart}
              onDragOver={onDragOver}
              onDrop={onDrop}
              onDragEnd={onDragEnd}
            >
              <FigureCard
                file={f}
                width={width}
                onExportChange={(fid, include) => void setExport(fid, include)}
                onCaptionChange={(fid, caption) => void updateFileMeta(fid, { caption })}
                onReplace={(fid, blob, name, mime) => void handleReplace(fid, blob, name, mime)}
              />
            </DraggableShell>
          ))}
        </div>
      )}
    </div>
  );
}
