import { db, noteSortCompare, now, type Note } from "./db";
import { pushNoteUpsert } from "./sync";

export async function reorderNotes(orderedIds: string[]): Promise<void> {
  const t = now();
  await db.transaction("rw", db.notes, async () => {
    for (let i = 0; i < orderedIds.length; i++) {
      await db.notes.update(orderedIds[i], { sort_order: i, updated_at: t });
    }
  });
  for (const id of orderedIds) {
    const fresh = await db.notes.get(id);
    if (fresh) void pushNoteUpsert(fresh);
  }
}

export function sortedNotes(notes: Note[]): Note[] {
  return [...notes].sort(noteSortCompare);
}

export function captureNoteOrder(notes: Note[]): Map<string, number> {
  return new Map(notes.map((n) => [n.id, n.sort_order ?? 0]));
}

export async function restoreNoteOrder(snapshot: Map<string, number>): Promise<void> {
  const t = now();
  await db.transaction("rw", db.notes, async () => {
    for (const [id, sort_order] of snapshot) {
      await db.notes.update(id, { sort_order, updated_at: t });
    }
  });
  for (const id of snapshot.keys()) {
    const fresh = await db.notes.get(id);
    if (fresh) void pushNoteUpsert(fresh);
  }
}
