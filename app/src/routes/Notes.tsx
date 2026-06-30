import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import MDEditor from "@uiw/react-md-editor";
import type { MarkdownPreviewProps } from "@uiw/react-markdown-preview/nohighlight";
import { Clock, Plus, Trash2 } from "lucide-react";
import { db, now, uid, type Note } from "../lib/db";
import { getMarkdownMathPreviewOptions } from "../lib/markdownMath";
import { EMPTY_NOTE_MARKDOWN, noteDisplayTitle } from "../lib/noteDefaults";
import { pushNoteDelete, pushNoteUpsert } from "../lib/sync";
import {
  captureNoteOrder,
  reorderNotes,
  restoreNoteOrder,
  sortedNotes,
} from "../lib/noteReorder";
import { logActivity, listNoteActivity, restoreNoteFromActivity } from "../lib/activityLog";
import { DraggableShell, DragHandle, useDragReorder } from "../components/DragReorder";
import { useToast } from "../components/Toast";

export function Notes() {
  const { id = "" } = useParams();
  const { show } = useToast();
  const rawNotes = useLiveQuery(
    () => db.notes.where("project_id").equals(id).toArray(),
    [id],
  );
  const notes = useMemo(() => sortedNotes(rawNotes ?? []), [rawNotes]);
  const [selected, setSelected] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [mathPreview, setMathPreview] = useState<
    Omit<MarkdownPreviewProps, "source"> | undefined
  >();
  const active = useLiveQuery<Note | undefined>(
    () => (selected ? db.notes.get(selected) : Promise.resolve(undefined)),
    [selected],
  );
  const history = useLiveQuery(
    () => listNoteActivity(id, selected ?? undefined, 30),
    [id, selected],
  );
  const pushTimer = useRef<number | null>(null);
  const logTimer = useRef<number | null>(null);
  const lastSnapshot = useRef<string>("");

  useEffect(() => {
    void getMarkdownMathPreviewOptions().then(setMathPreview);
  }, []);

  useEffect(() => {
    if (active) lastSnapshot.current = active.markdown;
  }, [active?.id]);

  const handleReorder = async (orderedIds: string[]) => {
    const snapshot = captureNoteOrder(notes);
    await reorderNotes(orderedIds);
    show("Section order updated — export and preview follow this order.", {
      label: "Undo",
      onClick: () => void restoreNoteOrder(snapshot),
    });
  };

  const { dragId, onDragStart, onDragOver, onDrop, onDragEnd } = useDragReorder(
    notes,
    (ids) => void handleReorder(ids),
  );

  async function create() {
    const nid = uid();
    const t = now();
    const maxOrder = notes.reduce((m, n) => Math.max(m, n.sort_order ?? 0), -1);
    const note: Note = {
      id: nid,
      project_id: id,
      title: "",
      markdown: EMPTY_NOTE_MARKDOWN,
      sort_order: maxOrder + 1,
      created_at: t,
      updated_at: t,
    };
    await db.notes.add(note);
    await logActivity({
      project_id: id,
      entity: "note",
      entity_id: nid,
      action: "create",
      summary: "Created section",
      snapshot: note.markdown,
    });
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

    if (logTimer.current) window.clearTimeout(logTimer.current);
    logTimer.current = window.setTimeout(async () => {
      const fresh = await db.notes.get(noteId);
      if (!fresh || fresh.markdown === lastSnapshot.current) return;
      lastSnapshot.current = fresh.markdown;
      const title = noteDisplayTitle(fresh.title);
      await logActivity({
        project_id: id,
        entity: "note",
        entity_id: noteId,
        action: "edit",
        summary: `Edited "${title}"`,
        snapshot: fresh.markdown,
      });
    }, 2000);
  }

  async function remove(nid: string) {
    if (!confirm("Delete this note?")) return;
    await db.notes.delete(nid);
    void pushNoteDelete(nid);
    if (selected === nid) setSelected(null);
  }

  async function restore(entryId: string) {
    const ok = await restoreNoteFromActivity(entryId);
    if (ok) show("Section restored from history.");
    else show("Could not restore — section may have been deleted.");
  }

  return (
    <div className="flex h-full">
      <aside className="w-72 shrink-0 border-r border-[var(--color-line)] bg-[var(--color-surface)] flex flex-col">
        <div className="px-4 py-3 flex items-center justify-between border-b border-[var(--color-line)]">
          <div className="serif text-lg">Manuscript</div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setShowHistory((h) => !h)}
              className={
                "p-1.5 rounded-md " +
                (showHistory
                  ? "bg-[var(--color-accent-soft)] text-[var(--color-accent)]"
                  : "text-[var(--color-ink-3)] hover:bg-[var(--color-surface-2)]")
              }
              title="Version history"
            >
              <Clock size={14} />
            </button>
            <button
              type="button"
              onClick={create}
              className="px-2 py-1 rounded-md bg-[var(--color-accent)] text-[#f6f2ea] text-xs hover:bg-[var(--color-accent-2)] flex items-center gap-1"
            >
              <Plus size={12} /> New
            </button>
          </div>
        </div>
        <p className="px-4 py-2 text-[10px] text-[var(--color-ink-3)] border-b border-[var(--color-line)]">
          Drag sections to reorder. Export and paper preview use this order.
        </p>
        {showHistory ? (
          <ul className="flex-1 overflow-y-auto p-2 space-y-1">
            {history?.map((e) => (
              <li
                key={e.id}
                className="px-3 py-2 rounded-md border border-[var(--color-line)] text-xs"
              >
                <div className="text-[var(--color-ink-2)]">{e.summary}</div>
                <div className="mono text-[10px] text-[var(--color-ink-3)] mt-0.5">
                  {new Date(e.created_at).toLocaleString()}
                </div>
                {e.snapshot && e.action === "edit" && (
                  <button
                    type="button"
                    onClick={() => void restore(e.id)}
                    className="mt-1 text-[var(--color-accent)] hover:underline"
                  >
                    Restore
                  </button>
                )}
              </li>
            ))}
            {history && history.length === 0 && (
              <li className="px-3 py-6 text-center text-xs text-[var(--color-ink-3)]">
                No history yet. Edits are logged after you save.
              </li>
            )}
          </ul>
        ) : (
          <ul className="flex-1 overflow-y-auto">
            {notes.map((n) => (
              <DraggableShell
                key={n.id}
                id={n.id}
                dragging={dragId === n.id}
                onDragStart={onDragStart}
                onDragOver={onDragOver}
                onDrop={onDrop}
                onDragEnd={onDragEnd}
              >
                <li
                  className={
                    "px-4 py-3 cursor-pointer border-b border-[var(--color-line)] flex items-start gap-2 " +
                    (selected === n.id
                      ? "bg-[var(--color-accent-soft)]"
                      : "hover:bg-[var(--color-surface-2)]")
                  }
                  onClick={() => setSelected(n.id)}
                >
                  <DragHandle className="mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm truncate">{noteDisplayTitle(n.title)}</div>
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
              </DraggableShell>
            ))}
            {notes.length === 0 && (
              <li className="px-4 py-6 text-center text-sm text-[var(--color-ink-3)]">
                No notes yet
              </li>
            )}
          </ul>
        )}
      </aside>
      <section className="flex-1 min-w-0 flex flex-col">
        {active ? (
          <>
            <input
              value={active.title}
              onChange={(e) => void update({ title: e.target.value })}
              placeholder="Untitled"
              className="serif text-2xl px-8 py-5 bg-transparent border-b border-[var(--color-line)] focus:outline-none placeholder:text-[var(--color-ink-4)]"
            />
            <div className="flex-1 overflow-hidden" data-color-mode="light">
              <MDEditor
                value={active.markdown}
                onChange={(v) => void update({ markdown: v ?? "" })}
                height="100%"
                preview="live"
                previewOptions={mathPreview}
                textareaProps={{
                  placeholder: "Start typing…",
                }}
              />
            </div>
          </>
        ) : (
          <div className="m-auto text-sm text-[var(--color-ink-3)]">
            Select a section or create a new one.
          </div>
        )}
      </section>
    </div>
  );
}
