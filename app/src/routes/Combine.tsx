import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { Loader2, Merge } from "lucide-react";
import { db } from "../lib/db";
import {
  combineProjects,
  listCombineSections,
  type CombineSection,
} from "../lib/combineProjects";
import { useCurrentProject } from "../lib/currentProject";
import { DraggableShell, DragHandle, useDragReorder } from "../components/DragReorder";

export function Combine() {
  const navigate = useNavigate();
  const { setCurrentProjectId } = useCurrentProject();
  const projects = useLiveQuery(
    () =>
      db.projects
        .filter((p) => !p.is_demo)
        .reverse()
        .sortBy("updated_at"),
    [],
  );

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sections, setSections] = useState<CombineSection[]>([]);
  const [name, setName] = useState("Combined paper");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const selectedIds = useMemo(() => [...selected], [selected]);

  useEffect(() => {
    if (selectedIds.length < 2) {
      setSections([]);
      return;
    }
    void listCombineSections(selectedIds).then(setSections);
  }, [selectedIds.join(",")]);

  const draggableSections = useMemo(
    () => sections.map((s) => ({ ...s, id: s.noteId })),
    [sections],
  );

  const { dragId, onDragStart, onDragOver, onDrop, onDragEnd } = useDragReorder(
    draggableSections,
    (orderedIds) => {
      setSections((prev) => {
        const byId = new Map(prev.map((s) => [s.noteId, s]));
        return orderedIds.map((nid) => byId.get(nid)!).filter(Boolean);
      });
    },
  );

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleCombine() {
    setBusy(true);
    setErr(null);
    try {
      const project = await combineProjects(selectedIds, name, sections);
      setCurrentProjectId(project.id);
      navigate(`/projects/${project.id}`);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="px-8 py-8 max-w-3xl mx-auto">
      <h1 className="serif text-3xl mb-1">Combine papers</h1>
      <p className="text-sm text-[var(--color-ink-3)] mb-6">
        Merge manuscript sections, references (deduped by DOI), and files from two or more projects into a new project.
      </p>

      <section className="rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-[var(--color-surface)] p-5 mb-5">
        <div className="mono uppercase text-[10px] tracking-wider text-[var(--color-ink-3)] mb-3">
          Source projects
        </div>
        <ul className="space-y-2 max-h-48 overflow-y-auto">
          {(projects ?? []).map((p) => (
            <li key={p.id}>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={selected.has(p.id)}
                  onChange={() => toggle(p.id)}
                />
                <span>{p.name}</span>
              </label>
            </li>
          ))}
          {projects && projects.length === 0 && (
            <li className="text-sm text-[var(--color-ink-3)]">No user projects yet.</li>
          )}
        </ul>
      </section>

      {sections.length > 0 && (
        <section className="rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-[var(--color-surface)] p-5 mb-5">
          <div className="mono uppercase text-[10px] tracking-wider text-[var(--color-ink-3)] mb-3">
            Section order (drag to reorder)
          </div>
          <ul className="space-y-1">
            {sections.map((s) => (
              <DraggableShell
                key={s.noteId}
                id={s.noteId}
                dragging={dragId === s.noteId}
                onDragStart={onDragStart}
                onDragOver={onDragOver}
                onDrop={onDrop}
                onDragEnd={onDragEnd}
              >
                <li className="flex items-center gap-2 px-3 py-2 rounded-md border border-[var(--color-line)] bg-[var(--color-bg)] text-sm">
                  <DragHandle />
                  <span className="flex-1 truncate">{s.noteTitle}</span>
                  <span className="mono text-[10px] text-[var(--color-ink-3)] truncate max-w-[40%]">
                    {s.sourceProjectName}
                  </span>
                </li>
              </DraggableShell>
            ))}
          </ul>
        </section>
      )}

      <section className="rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-[var(--color-surface)] p-5 mb-5">
        <label className="block text-sm mb-2">New project name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 rounded-md border border-[var(--color-line)] bg-[var(--color-bg)] text-sm"
        />
      </section>

      {err && <div className="text-sm text-[var(--color-warm)] mb-4">{err}</div>}

      <button
        type="button"
        onClick={handleCombine}
        disabled={busy || selectedIds.length < 2 || !name.trim()}
        className="px-4 py-2 rounded-md bg-[var(--color-accent)] text-[#f6f2ea] text-sm font-medium hover:bg-[var(--color-accent-2)] disabled:opacity-60 flex items-center gap-2"
      >
        {busy ? <Loader2 size={14} className="animate-spin" /> : <Merge size={14} />}
        Create combined project
      </button>
    </div>
  );
}
