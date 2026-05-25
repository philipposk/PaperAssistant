import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import {
  FileText,
  Image as ImageIcon,
  StickyNote,
  Table as TableIcon,
} from "lucide-react";
import { db } from "../lib/db";

type Event =
  | { kind: "file-add"; ts: number; id: string; name: string; mime: string }
  | { kind: "file-edit"; ts: number; id: string; name: string; mime: string }
  | { kind: "note-add"; ts: number; id: string; title: string }
  | { kind: "note-edit"; ts: number; id: string; title: string }
  | { kind: "project-add"; ts: number; name: string };

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

export function Timeline() {
  const { id = "" } = useParams();
  const project = useLiveQuery(() => db.projects.get(id), [id]);
  const files = useLiveQuery(
    () => db.files.where("project_id").equals(id).toArray(),
    [id],
  );
  const notes = useLiveQuery(
    () => db.notes.where("project_id").equals(id).toArray(),
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
      });
      if (f.updated_at > f.created_at + 1000) {
        list.push({
          kind: "file-edit",
          ts: f.updated_at,
          id: f.id,
          name: f.name,
          mime: f.mime,
        });
      }
    }
    for (const n of notes ?? []) {
      list.push({
        kind: "note-add",
        ts: n.created_at,
        id: n.id,
        title: n.title,
      });
      if (n.updated_at > n.created_at + 1000) {
        list.push({
          kind: "note-edit",
          ts: n.updated_at,
          id: n.id,
          title: n.title,
        });
      }
    }
    list.sort((a, b) => b.ts - a.ts);
    return list;
  }, [project, files, notes]);

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
          No activity yet. Upload files or write notes to see them here.
        </div>
      </div>
    );
  }

  return (
    <div className="px-8 py-8 max-w-3xl mx-auto">
      <h1 className="serif text-3xl mb-1">Timeline</h1>
      <div className="mono text-[11px] uppercase text-[var(--color-ink-3)] mb-8">
        {project.name} · {events.length} events
      </div>

      <div className="space-y-10">
        {grouped.map(([day, list]) => (
          <section key={day}>
            <div className="mono uppercase text-[10px] tracking-wider text-[var(--color-warm)] mb-3">
              {day}
            </div>
            <ul className="border-l border-[var(--color-line)] pl-6 space-y-4">
              {list.map((e, i) => {
                let label = "";
                let Icon = FileText;
                if (e.kind === "project-add") {
                  label = `Project “${e.name}” created`;
                  Icon = FileText;
                } else if (e.kind === "file-add") {
                  label = `Added ${e.name}`;
                  Icon = fileIcon(e.mime);
                } else if (e.kind === "file-edit") {
                  label = `Updated ${e.name}`;
                  Icon = fileIcon(e.mime);
                } else if (e.kind === "note-add") {
                  label = `Created note ${e.title}`;
                  Icon = StickyNote;
                } else {
                  label = `Edited note ${e.title}`;
                  Icon = StickyNote;
                }
                return (
                  <li key={i} className="relative">
                    <span className="absolute -left-[27px] top-1 w-2.5 h-2.5 rounded-full bg-[var(--color-line)] border border-[var(--color-surface)]" />
                    <div className="flex items-center gap-3">
                      <Icon size={15} className="text-[var(--color-ink-3)]" />
                      <div className="flex-1 min-w-0 text-sm">{label}</div>
                      <div className="mono text-[10px] text-[var(--color-ink-3)]">
                        {formatTime(e.ts)}
                      </div>
                    </div>
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
