import { useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import MDEditor from "@uiw/react-md-editor";
import { Plus, Trash2 } from "lucide-react";
import { db, now, uid, type Note } from "../lib/db";
import { pushNoteDelete, pushNoteUpsert } from "../lib/sync";

export function Notes() {
  const { id = "" } = useParams();
  const notes = useLiveQuery(
    () => db.notes.where("project_id").equals(id).reverse().sortBy("updated_at"),
    [id],
  );
  const [selected, setSelected] = useState<string | null>(null);
  const active = useLiveQuery<Note | undefined>(
    () => (selected ? db.notes.get(selected) : Promise.resolve(undefined)),
    [selected],
  );
  const pushTimer = useRef<number | null>(null);

  async function create() {
    const nid = uid();
    const t = now();
    const note: Note = {
      id: nid,
      project_id: id,
      title: "Untitled",
      markdown: "# Untitled\n\nStart typing…",
      created_at: t,
      updated_at: t,
    };
    await db.notes.add(note);
    setSelected(nid);
    void pushNoteUpsert(note);
  }

  async function update(patch: Partial<Note>) {
    if (!active) return;
    const noteId = active.id;
    await db.notes.update(noteId, { ...patch, updated_at: now() });
    if (pushTimer.current) window.clearTimeout(pushTimer.current);
    pushTimer.current = window.setTimeout(async () => {
      const fresh = await db.notes.get(noteId);
      if (fresh) void pushNoteUpsert(fresh);
    }, 800);
  }

  async function remove(nid: string) {
    if (!confirm("Delete this note?")) return;
    await db.notes.delete(nid);
    void pushNoteDelete(nid);
    if (selected === nid) setSelected(null);
  }

  return (
    <div className="flex h-full">
      <aside className="w-72 shrink-0 border-r border-[var(--color-line)] bg-[var(--color-surface)] flex flex-col">
        <div className="px-4 py-3 flex items-center justify-between border-b border-[var(--color-line)]">
          <div className="serif text-lg">Notes</div>
          <button
            type="button"
            onClick={create}
            className="px-2 py-1 rounded-md bg-[var(--color-accent)] text-[#f6f2ea] text-xs hover:bg-[var(--color-accent-2)] flex items-center gap-1"
          >
            <Plus size={12} /> New
          </button>
        </div>
        <ul className="flex-1 overflow-y-auto">
          {notes?.map((n) => (
            <li
              key={n.id}
              className={
                "px-4 py-3 cursor-pointer border-b border-[var(--color-line)] flex items-start gap-2 " +
                (selected === n.id
                  ? "bg-[var(--color-accent-soft)]"
                  : "hover:bg-[var(--color-surface-2)]")
              }
              onClick={() => setSelected(n.id)}
            >
              <div className="flex-1 min-w-0">
                <div className="text-sm truncate">{n.title}</div>
                <div className="mono text-[10px] text-[var(--color-ink-3)]">
                  {new Date(n.updated_at).toLocaleDateString()}
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  void remove(n.id);
                }}
                className="text-[var(--color-ink-4)] hover:text-[var(--color-warm)]"
                aria-label="Delete note"
              >
                <Trash2 size={13} />
              </button>
            </li>
          ))}
          {notes && notes.length === 0 && (
            <li className="px-4 py-6 text-center text-sm text-[var(--color-ink-3)]">
              No notes yet
            </li>
          )}
        </ul>
      </aside>
      <section className="flex-1 min-w-0 flex flex-col">
        {active ? (
          <>
            <input
              value={active.title}
              onChange={(e) => void update({ title: e.target.value })}
              className="serif text-2xl px-8 py-5 bg-transparent border-b border-[var(--color-line)] focus:outline-none"
            />
            <div className="flex-1 overflow-hidden" data-color-mode="light">
              <MDEditor
                value={active.markdown}
                onChange={(v) => void update({ markdown: v ?? "" })}
                height="100%"
                preview="live"
              />
            </div>
          </>
        ) : (
          <div className="m-auto text-sm text-[var(--color-ink-3)]">
            Select a note or create a new one.
          </div>
        )}
      </section>
    </div>
  );
}
