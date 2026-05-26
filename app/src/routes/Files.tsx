import { useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { Download, Eye, Tag, Trash2, Upload, X } from "lucide-react";
import { db, now, uid, type FileRecord } from "../lib/db";
import { pushFileDelete, pushFileUpsert } from "../lib/sync";
import { TagEditor } from "../components/TagEditor";
import { projectTagSuggestions } from "../lib/tags";

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
  const [editing, setEditing] = useState<string | null>(null);
  const [tagFilter, setTagFilter] = useState<string[]>([]);

  const suggestions = useLiveQuery(() => projectTagSuggestions(id), [id]) ?? [];

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

  async function setTags(fileId: string, nextTags: string[]) {
    await db.files.update(fileId, { tags: nextTags, updated_at: now() });
    const fresh = await db.files.get(fileId);
    if (fresh) void pushFileUpsert(fresh);
  }

  const filtered = useMemo(() => {
    if (!files) return [];
    if (tagFilter.length === 0) return files;
    return files.filter((f) => tagFilter.every((t) => f.tags?.includes(t)));
  }, [files, tagFilter]);

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

      {suggestions.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap mb-4">
          <span className="mono uppercase text-[10px] tracking-wider text-[var(--color-ink-3)] mr-1">
            Filter
          </span>
          {suggestions.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() =>
                setTagFilter((cur) =>
                  cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t],
                )
              }
              className={
                "inline-flex items-center gap-1 px-2 py-0.5 rounded-full mono text-[10px] uppercase border transition-colors " +
                (tagFilter.includes(t)
                  ? "bg-[var(--color-accent-soft)] text-[var(--color-accent)] border-[var(--color-accent)]"
                  : "border-[var(--color-line)] text-[var(--color-ink-3)] hover:bg-[var(--color-surface-2)]")
              }
            >
              <Tag size={10} />
              {t}
            </button>
          ))}
          {tagFilter.length > 0 && (
            <button
              type="button"
              onClick={() => setTagFilter([])}
              className="text-[10px] text-[var(--color-ink-3)] hover:text-[var(--color-ink)] flex items-center gap-1"
            >
              <X size={10} /> clear
            </button>
          )}
        </div>
      )}

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

      {filtered.length > 0 ? (
        <ul className="border border-[var(--color-line)] rounded-[var(--radius-lg)] bg-[var(--color-surface)] divide-y divide-[var(--color-line)]">
          {filtered.map((f) => (
            <li key={f.id} className="px-5 py-3">
              <div className="flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="text-sm truncate">{f.name}</div>
                  <div className="mono text-[11px] text-[var(--color-ink-3)] flex items-center gap-2 flex-wrap">
                    <span>{f.mime || "binary"}</span>
                    <span>· {fileSize(f.size)}</span>
                    <span>· {new Date(f.updated_at).toLocaleString()}</span>
                    {f.tags?.map((t) => (
                      <span
                        key={t}
                        className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-[var(--color-accent-soft)] text-[var(--color-accent)] text-[9px]"
                      >
                        <Tag size={8} />
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setEditing(editing === f.id ? null : f.id)}
                  aria-label="Edit tags"
                  className={
                    "p-2 " +
                    (editing === f.id
                      ? "text-[var(--color-accent)]"
                      : "text-[var(--color-ink-3)] hover:text-[var(--color-accent)]")
                  }
                >
                  <Tag size={15} />
                </button>
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
              </div>
              {editing === f.id && (
                <div className="mt-2 pl-1">
                  <TagEditor
                    tags={f.tags ?? []}
                    onChange={(next) => void setTags(f.id, next)}
                    suggestions={suggestions}
                    placeholder="add tag…"
                  />
                </div>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-center py-12 text-sm text-[var(--color-ink-3)]">
          {tagFilter.length > 0
            ? `No files match all selected tags. Clear the filter to see everything.`
            : "No files yet. Upload your first one above."}
        </div>
      )}
    </div>
  );
}
