import { useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { Download, Eye, Trash2, Upload } from "lucide-react";
import { db, now, uid, type FileRecord } from "../lib/db";
import { pushFileDelete, pushFileUpsert } from "../lib/sync";

function fileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export function Files() {
  const { id = "" } = useParams();
  const files = useLiveQuery(
    () => db.files.where("project_id").equals(id).reverse().sortBy("updated_at"),
    [id],
  );
  const input = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  async function onPick(list: FileList | null) {
    if (!list) return;
    const records: FileRecord[] = [];
    for (const f of Array.from(list)) {
      records.push({
        id: uid(),
        project_id: id,
        name: f.name,
        mime: f.type || "application/octet-stream",
        size: f.size,
        blob: f,
        tags: [],
        created_at: now(),
        updated_at: now(),
      });
    }
    await db.files.bulkAdd(records);
    await db.projects.update(id, { updated_at: now() });
    for (const r of records) void pushFileUpsert(r);
  }

  async function download(f: FileRecord) {
    const url = URL.createObjectURL(f.blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = f.name;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function remove(fid: string) {
    const existing = await db.files.get(fid);
    await db.files.delete(fid);
    if (existing) void pushFileDelete(existing);
  }

  return (
    <div className="px-8 py-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="serif text-3xl">Files</h1>
        <button
          type="button"
          onClick={() => input.current?.click()}
          className="px-3 py-2 rounded-md bg-[var(--color-accent)] text-[#f6f2ea] text-sm font-medium hover:bg-[var(--color-accent-2)] flex items-center gap-2"
        >
          <Upload size={14} /> Upload
        </button>
        <input
          ref={input}
          type="file"
          multiple
          hidden
          onChange={(e) => {
            void onPick(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          void onPick(e.dataTransfer.files);
        }}
        className={
          "rounded-[var(--radius-lg)] border-2 border-dashed p-8 mb-6 text-center transition-colors " +
          (dragging
            ? "border-[var(--color-accent)] bg-[var(--color-accent-soft)]"
            : "border-[var(--color-line-2)] bg-[var(--color-surface-2)]")
        }
      >
        <Upload size={20} className="mx-auto mb-2 text-[var(--color-ink-3)]" />
        <div className="text-sm text-[var(--color-ink-2)]">
          Drop files here or click <strong>Upload</strong>. All file types accepted.
        </div>
      </div>

      {files && files.length > 0 ? (
        <ul className="border border-[var(--color-line)] rounded-[var(--radius-lg)] bg-[var(--color-surface)] divide-y divide-[var(--color-line)]">
          {files.map((f) => (
            <li key={f.id} className="flex items-center px-5 py-3 gap-4">
              <div className="flex-1 min-w-0">
                <div className="text-sm truncate">{f.name}</div>
                <div className="mono text-[11px] text-[var(--color-ink-3)]">
                  {f.mime || "binary"} · {fileSize(f.size)} ·{" "}
                  {new Date(f.updated_at).toLocaleString()}
                </div>
              </div>
              {(f.mime === "application/pdf" ||
                f.name.toLowerCase().endsWith(".pdf")) && (
                <Link
                  to={`/projects/${id}/files/${f.id}/view`}
                  aria-label="Open in PDF viewer"
                  className="p-2 text-[var(--color-ink-3)] hover:text-[var(--color-accent)]"
                >
                  <Eye size={15} />
                </Link>
              )}
              <button
                type="button"
                onClick={() => download(f)}
                aria-label="Download"
                className="p-2 text-[var(--color-ink-3)] hover:text-[var(--color-accent)]"
              >
                <Download size={15} />
              </button>
              <button
                type="button"
                onClick={() => remove(f.id)}
                aria-label="Delete"
                className="p-2 text-[var(--color-ink-4)] hover:text-[var(--color-warm)]"
              >
                <Trash2 size={15} />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-center py-12 text-sm text-[var(--color-ink-3)]">
          No files yet. Upload your first one above.
        </div>
      )}
    </div>
  );
}
