import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { FileText, Image as ImageIcon, StickyNote, Table as TableIcon } from "lucide-react";
import { db, type FileRecord, type Note, type Project } from "../lib/db";

type Hit =
  | { kind: "project"; item: Project; preview?: string }
  | { kind: "file"; item: FileRecord }
  | { kind: "note"; item: Note; preview?: string };

function matchProject(p: Project, q: string): Hit | null {
  const fields = [p.name, p.description ?? ""].join(" ").toLowerCase();
  if (!fields.includes(q)) return null;
  return { kind: "project", item: p };
}

function matchFile(f: FileRecord, q: string): Hit | null {
  if (!f.name.toLowerCase().includes(q)) return null;
  return { kind: "file", item: f };
}

function snippet(text: string, q: string, around = 60): string {
  const idx = text.toLowerCase().indexOf(q);
  if (idx === -1) return text.slice(0, around * 2);
  const start = Math.max(0, idx - around);
  const end = Math.min(text.length, idx + q.length + around);
  return (start > 0 ? "…" : "") + text.slice(start, end) + (end < text.length ? "…" : "");
}

function matchNote(n: Note, q: string): Hit | null {
  const inTitle = n.title.toLowerCase().includes(q);
  const inBody = n.markdown.toLowerCase().includes(q);
  if (!inTitle && !inBody) return null;
  return {
    kind: "note",
    item: n,
    preview: inBody ? snippet(n.markdown, q) : undefined,
  };
}

function ResultIcon({ kind, mime }: { kind: Hit["kind"]; mime?: string }) {
  if (kind === "project") return <FileText size={16} className="text-[var(--color-ink-3)]" />;
  if (kind === "note") return <StickyNote size={16} className="text-[var(--color-ink-3)]" />;
  if (mime?.startsWith("image/")) return <ImageIcon size={16} className="text-[var(--color-ink-3)]" />;
  if (mime === "text/csv") return <TableIcon size={16} className="text-[var(--color-ink-3)]" />;
  return <FileText size={16} className="text-[var(--color-ink-3)]" />;
}

export function Search() {
  const [params] = useSearchParams();
  const rawQ = params.get("q") ?? "";
  const q = rawQ.trim().toLowerCase();

  const projects = useLiveQuery(() => db.projects.toArray(), []);
  const files = useLiveQuery(() => db.files.toArray(), []);
  const notes = useLiveQuery(() => db.notes.toArray(), []);

  const projectMap = useMemo(
    () => Object.fromEntries((projects ?? []).map((p) => [p.id, p])),
    [projects],
  );

  const hits = useMemo<Hit[]>(() => {
    if (!q || q.length < 2) return [];
    const acc: Hit[] = [];
    for (const p of projects ?? []) {
      const h = matchProject(p, q);
      if (h) acc.push(h);
    }
    for (const f of files ?? []) {
      const h = matchFile(f, q);
      if (h) acc.push(h);
    }
    for (const n of notes ?? []) {
      const h = matchNote(n, q);
      if (h) acc.push(h);
    }
    return acc.slice(0, 100);
  }, [q, projects, files, notes]);

  return (
    <div className="px-8 py-8 max-w-4xl mx-auto">
      <h1 className="serif text-3xl mb-1">Search</h1>
      <div className="mono text-[11px] uppercase text-[var(--color-ink-3)] mb-6">
        {rawQ ? `Results for "${rawQ}"` : "Type in the top bar to search"}
      </div>

      {q && q.length < 2 && (
        <div className="text-sm text-[var(--color-ink-3)]">
          Enter at least 2 characters.
        </div>
      )}

      {q && q.length >= 2 && hits.length === 0 && (
        <div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--color-line-2)] p-12 text-center text-sm text-[var(--color-ink-3)]">
          No results found.
        </div>
      )}

      {hits.length > 0 && (
        <ul className="rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-[var(--color-surface)] divide-y divide-[var(--color-line)]">
          {hits.map((h, i) => {
            const isProject = h.kind === "project";
            const projectId = isProject ? h.item.id : h.item.project_id;
            const project = projectMap[projectId];
            const href =
              h.kind === "project"
                ? `/projects/${h.item.id}`
                : h.kind === "note"
                  ? `/projects/${projectId}/notes`
                  : `/projects/${projectId}/files`;
            const title =
              h.kind === "project"
                ? h.item.name
                : h.kind === "note"
                  ? h.item.title
                  : h.item.name;
            const mime = h.kind === "file" ? h.item.mime : undefined;
            return (
              <li key={i}>
                <Link
                  to={href}
                  className="block px-5 py-3 hover:bg-[var(--color-surface-2)]"
                >
                  <div className="flex items-center gap-3">
                    <ResultIcon kind={h.kind} mime={mime} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm truncate">{title}</div>
                      <div className="mono text-[10px] uppercase text-[var(--color-ink-3)]">
                        {h.kind} · {project?.name ?? "unknown project"}
                      </div>
                    </div>
                  </div>
                  {h.kind === "note" && h.preview && (
                    <div className="mt-2 text-xs text-[var(--color-ink-2)] line-clamp-2 pl-7">
                      {h.preview}
                    </div>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
