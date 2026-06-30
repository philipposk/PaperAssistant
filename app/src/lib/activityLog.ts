import { db, now, uid, type ActivityLogEntry } from "./db";
import { pushNoteUpsert } from "./sync";

export async function logActivity(
  entry: Omit<ActivityLogEntry, "id" | "created_at">,
): Promise<ActivityLogEntry> {
  const record: ActivityLogEntry = {
    ...entry,
    id: uid(),
    created_at: now(),
  };
  await db.activity_log.add(record);
  return record;
}

export async function listNoteActivity(
  projectId: string,
  noteId?: string,
  limit = 50,
): Promise<ActivityLogEntry[]> {
  let q = db.activity_log.where("project_id").equals(projectId);
  const all = await q.reverse().sortBy("created_at");
  const filtered = all.filter(
    (e) => e.entity === "note" && (!noteId || e.entity_id === noteId),
  );
  return filtered.slice(0, limit);
}

export async function restoreNoteFromActivity(entryId: string): Promise<boolean> {
  const entry = await db.activity_log.get(entryId);
  if (!entry || entry.entity !== "note" || !entry.snapshot) return false;
  const note = await db.notes.get(entry.entity_id);
  if (!note) return false;
  const t = now();
  await db.notes.update(note.id, { markdown: entry.snapshot, updated_at: t });
  const fresh = await db.notes.get(note.id);
  if (fresh) void pushNoteUpsert(fresh);
  await logActivity({
    project_id: entry.project_id,
    entity: "note",
    entity_id: note.id,
    action: "edit",
    summary: `Restored from ${new Date(entry.created_at).toLocaleString()}`,
    snapshot: entry.snapshot,
  });
  return true;
}
