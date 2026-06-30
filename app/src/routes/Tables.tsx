import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import Papa from "papaparse";
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
import { DraggableShell, DragHandle, useDragReorder } from "../components/DragReorder";
import { useToast } from "../components/Toast";

function TableCard({
  file,
  onExportChange,
  onCaptionChange,
}: {
  file: FileRecord;
  onExportChange: (id: string, include: boolean) => void;
  onCaptionChange: (id: string, caption: string) => void;
}) {
  const [rows, setRows] = useState<string[][] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [captionDraft, setCaptionDraft] = useState(file.caption ?? "");

  useEffect(() => {
    let cancelled = false;
    void file.blob.text().then((text) => {
      const parsed = Papa.parse<string[]>(text, { skipEmptyLines: true });
      if (cancelled) return;
      if (parsed.errors.length) setError(parsed.errors[0].message);
      setRows(parsed.data as string[][]);
    });
    return () => {
      cancelled = true;
    };
  }, [file.blob]);

  const head = rows?.[0] ?? [];
  const body = rows?.slice(1, 21) ?? [];

  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-[var(--color-surface)] overflow-hidden">
      <div className="px-5 py-3 border-b border-[var(--color-line)] flex items-center gap-3">
        <DragHandle />
        <div className="flex-1 min-w-0">
          {editing ? (
            <div className="flex gap-2 items-center">
              <input
                value={captionDraft}
                onChange={(e) => setCaptionDraft(e.target.value)}
                className="flex-1 px-2 py-1 rounded border border-[var(--color-line)] bg-[var(--color-bg)] text-sm"
                placeholder="Table caption"
              />
              <button
                type="button"
                className="text-xs text-[var(--color-accent)]"
                onClick={() => {
                  onCaptionChange(file.id, captionDraft);
                  setEditing(false);
                }}
              >
                Save
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="serif text-lg truncate text-left hover:text-[var(--color-accent)] w-full"
            >
              {fileDisplayName(file)}
            </button>
          )}
          <div className="mono text-[10px] text-[var(--color-ink-3)]">{file.name}</div>
        </div>
        <label className="flex items-center gap-1.5 text-xs cursor-pointer text-[var(--color-ink-2)] shrink-0">
          <input
            type="checkbox"
            checked={fileIncludedInExport(file)}
            onChange={(e) => onExportChange(file.id, e.target.checked)}
            className="shrink-0"
          />
          Include in export
        </label>
      </div>
      {error && <div className="p-4 text-sm text-[var(--color-warm)]">{error}</div>}
      {rows && (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-[var(--color-surface-2)]">
              <tr>
                {head.map((h, i) => (
                  <th
                    key={i}
                    className="px-3 py-2 text-left mono text-[11px] uppercase text-[var(--color-ink-2)] border-b border-[var(--color-line)]"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {body.map((row, ri) => (
                <tr key={ri} className="border-b border-[var(--color-line)] last:border-0">
                  {row.map((cell, ci) => (
                    <td key={ci} className="px-3 py-2 text-[var(--color-ink-2)]">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export function Tables() {
  const { id = "" } = useParams();
  const { show } = useToast();
  const files = useLiveQuery(
    () => db.files.where("project_id").equals(id).toArray(),
    [id],
  );
  const tables = useMemo(
    () =>
      sortedSubset(
        files ?? [],
        (f) => f.mime === "text/csv" || f.name.toLowerCase().endsWith(".csv"),
      ),
    [files],
  );

  const handleReorder = async (orderedIds: string[]) => {
    const snapshot = captureOrder(tables);
    await reorderFiles(orderedIds);
    show("Table order updated — export follows this order.", {
      label: "Undo",
      onClick: () => void restoreOrder(snapshot),
    });
  };

  const { dragId, onDragStart, onDragOver, onDrop, onDragEnd } = useDragReorder(
    tables,
    (ids) => void handleReorder(ids),
  );

  async function setExport(fileId: string, include: boolean) {
    await updateFileMeta(fileId, { include_in_export: include });
    const fresh = await db.files.get(fileId);
    if (fresh) void pushFileUpsert(fresh);
  }

  return (
    <div className="px-8 py-8 max-w-6xl mx-auto">
      <h1 className="serif text-3xl mb-2">Tables</h1>
      <p className="text-xs text-[var(--color-ink-3)] mb-6">
        Drag to reorder. Click caption to edit. Order and captions appear in export.
      </p>
      {tables.length === 0 ? (
        <div className="text-center py-16 text-sm text-[var(--color-ink-3)]">
          No CSV files in this project yet. Upload one from the Files page.
        </div>
      ) : (
        <div className="space-y-6">
          {tables.map((f) => (
            <DraggableShell
              key={f.id}
              id={f.id}
              dragging={dragId === f.id}
              onDragStart={onDragStart}
              onDragOver={onDragOver}
              onDrop={onDrop}
              onDragEnd={onDragEnd}
            >
              <TableCard
                file={f}
                onExportChange={(fid, include) => void setExport(fid, include)}
                onCaptionChange={(fid, caption) => void updateFileMeta(fid, { caption })}
              />
            </DraggableShell>
          ))}
        </div>
      )}
    </div>
  );
}
