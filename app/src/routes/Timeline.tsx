import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import {
  FileText,
  Image as ImageIcon,
  StickyNote,
  Table as TableIcon,
  Quote,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { db } from "../lib/db";

type Event =
  | { kind: "project-add"; ts: number; name: string }
  | { kind: "file-add"; ts: number; id: string; name: string; mime: string; size: number }
  | { kind: "file-edit"; ts: number; id: string; name: string; mime: string; size: number }
  | { kind: "note-add"; ts: number; id: string; title: string }
  | { kind: "note-edit"; ts: number; id: string; title: string }
  | { kind: "ref-add"; ts: number; id: string; key: string; title: string }
  | { kind: "ref-edit"; ts: number; id: string; key: string; title: string };

function dayKey(ts: number): string {
  return new Date(ts).toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function fileIcon(mime: string) {
  if (mime.startsWith("image/")) return ImageIcon;
  if (mime === "text/csv") return TableIcon;
  return FileText;
}

function eventKey(e: Event, i: number): string {
  if (e.kind === "project-add") return `p-${i}`;
  return `${e.kind}-${"id" in e ? e.id : i}-${e.ts}`;
}

function EventDetail({ event, projectId }: { event: Event; projectId: string }) {
  if (event.kind === "file-add" || event.kind === "file-edit") {
    return (
      <div className="mt-2 ml-7 text-xs text-[var(--color-ink-3)] space-y-1">
        <div>Type: {event.mime}</div>
        <div>Size: {(event.size / 1024).toFixed(1)} KB</div>
        <Link
          to={`/projects/${projectId}/files`}
          className="text-[var(--color-accent)] hover:underline"
        >
          Open in Files
        </Link>
      </div>
    );
  }
  if (event.kind === "note-add" || event.kind === "note-edit") {
    return (
      <div className="mt-2 ml-7 text-xs">
        <Link
          to={`/projects/${projectId}/notes`}
          className="text-[var(--color-accent)] hover:underline"
        >
          Open manuscript
        </Link>
      </div>
    );
  }
  if (event.kind === "ref-add" || event.kind === "ref-edit") {
    return (
      <div className="mt-2 ml-7 text-xs text-[var(--color-ink-3)] space-y-1">
        <div>Citation key: @{event.key}</div>
        <Link
          to={`/projects/${projectId}/references`}
          className="text-[var(--color-accent)] hover:underline"
        >
          Open references
        </Link>
      </div>
    );
  }
  return null;
}

export function Timeline() {
  const { id = "" } = useParams();
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const project = useLiveQuery(() => db.projects.get(id), [id]);
  const files = useLiveQuery(
    () => db.files.where("project_id").equals(id).toArray(),
    [id],
  );
  const notes = useLiveQuery(
    () => db.notes.where("project_id").equals(id).toArray(),
    [id],
  );
  const refs = useLiveQuery(
    () => db.references.where("project_id").equals(id).toArray(),
    [id],
  );

  const events = useMemo<Event[]>(() => {
    const list: Event[] = [];
    if (project) {
      list.push({ kind: "project-add", ts: project.created_at, name: project.name });
    }
    for (const f of files ?? []) {
      list.push({
        kind: "file-add",
        ts: f.created_at,
        id: f.id,
        name: f.name,
        mime: f.mime,
        size: f.size,
      });
      if (f.updated_at > f.created_at + 1000) {
        list.push({
          kind: "file-edit",
          ts: f.updated_at,
          id: f.id,
          name: f.name,
          mime: f.mime,
          size: f.size,
        });
      }
    }
    for (const n of notes ?? []) {
      list.push({ kind: "note-add", ts: n.created_at, id: n.id, title: n.title });
      if (n.updated_at > n.created_at + 1000) {
        list.push({
          kind: "note-edit",
          ts: n.updated_at,
          id: n.id,
          title: n.title,
        });
      }
    }
    for (const r of refs ?? []) {
      const title = (r.csl_json.title as string) || r.citation_key;
      list.push({
        kind: "ref-add",
        ts: r.created_at,
        id: r.id,
        key: r.citation_key,
        title,
      });
      if (r.updated_at > r.created_at + 1000) {
        list.push({
          kind: "ref-edit",
          ts: r.updated_at,
          id: r.id,
          key: r.citation_key,
          title,
        });
      }
    }
    list.sort((a, b) => b.ts - a.ts);
    return list;
  }, [project, files, notes, refs]);

  const grouped = useMemo(() => {
    const map = new Map<string, Event[]>();
    for (const e of events) {
      const k = dayKey(e.ts);
      const arr = map.get(k) ?? [];
      arr.push(e);
      map.set(k, arr);
    }
    return Array.from(map.entries());
  }, [events]);

  function toggle(key: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  if (!project) {
    return (
      <div className="px-8 py-16 text-center text-sm text-[var(--color-ink-3)]">
        Project not found.
      </div>
    );
  }

  if (events.length <= 1) {
    return (
      <div className="px-8 py-8 max-w-3xl mx-auto">
        <h1 className="serif text-3xl mb-6">Timeline</h1>
        <div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--color-line-2)] p-12 text-center text-sm text-[var(--color-ink-3)]">
          No activity yet. Upload files or write in the manuscript to see changes here.
        </div>
      </div>
    );
  }

  return (
    <div className="px-8 py-8 max-w-3xl mx-auto">
      <h1 className="serif text-3xl mb-1">Timeline</h1>
      <div className="mono text-[11px] uppercase text-[var(--color-ink-3)] mb-2">
        {project.name} · {events.length} events
      </div>
      <p className="text-xs text-[var(--color-ink-3)] mb-8">
        Click an event for details. Tracks files, manuscript edits, and references.
      </p>

      <div className="space-y-10">
        {grouped.map(([day, list]) => (
          <section key={day}>
            <div className="mono uppercase text-[10px] tracking-wider text-[var(--color-warm)] mb-3">
              {day}
            </div>
            <ul className="border-l border-[var(--color-line)] pl-6 space-y-4">
              {list.map((e, i) => {
                const key = eventKey(e, i);
                const isOpen = expanded.has(key);
                let label = "";
                let Icon = FileText;
                let clickable = true;
                if (e.kind === "project-add") {
                  label = `Project “${e.name}” created`;
                  clickable = false;
                } else if (e.kind === "file-add") {
                  label = `Added file ${e.name}`;
                  Icon = fileIcon(e.mime);
                } else if (e.kind === "file-edit") {
                  label = `Updated file ${e.name}`;
                  Icon = fileIcon(e.mime);
                } else if (e.kind === "note-add") {
                  label = `Created manuscript section “${e.title || "Untitled"}”`;
                  Icon = StickyNote;
                } else if (e.kind === "note-edit") {
                  label = `Edited manuscript “${e.title || "Untitled"}”`;
                  Icon = StickyNote;
                } else if (e.kind === "ref-add") {
                  label = `Added reference @${e.key}`;
                  Icon = Quote;
                } else {
                  label = `Updated reference @${e.key}`;
                  Icon = Quote;
                }
                return (
                  <li key={key} className="relative">
                    <span className="absolute -left-[27px] top-1 w-2.5 h-2.5 rounded-full bg-[var(--color-line)] border border-[var(--color-surface)]" />
                    <button
                      type="button"
                      onClick={() => clickable && toggle(key)}
                      className={`w-full flex items-center gap-3 text-left ${clickable ? "hover:opacity-80" : "cursor-default"}`}
                    >
                      {clickable ? (
                        isOpen ? (
                          <ChevronDown size={14} className="text-[var(--color-ink-4)] shrink-0" />
                        ) : (
                          <ChevronRight size={14} className="text-[var(--color-ink-4)] shrink-0" />
                        )
                      ) : (
                        <span className="w-[14px]" />
                      )}
                      <Icon size={15} className="text-[var(--color-ink-3)] shrink-0" />
                      <div className="flex-1 min-w-0 text-sm">{label}</div>
                      <div className="mono text-[10px] text-[var(--color-ink-3)] shrink-0">
                        {formatTime(e.ts)}
                      </div>
                    </button>
                    {isOpen && clickable && (
                      <EventDetail event={e} projectId={id} />
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
