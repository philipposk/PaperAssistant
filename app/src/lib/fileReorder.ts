import { db, fileSortCompare, now, type FileRecord } from "./db";
import { pushFileUpsert } from "./sync";

export async function reorderFiles(orderedIds: string[]): Promise<void> {
  const t = now();
  await db.transaction("rw", db.files, async () => {
    for (let i = 0; i < orderedIds.length; i++) {
      await db.files.update(orderedIds[i], { sort_order: i, updated_at: t });
    }
  });
  for (const id of orderedIds) {
    const fresh = await db.files.get(id);
    if (fresh) void pushFileUpsert(fresh);
  }
}

export function sortedSubset(
  files: FileRecord[],
  predicate: (f: FileRecord) => boolean,
): FileRecord[] {
  return files.filter(predicate).sort(fileSortCompare);
}

export async function updateFileMeta(
  fileId: string,
  patch: Pick<FileRecord, "caption" | "include_in_export">,
): Promise<void> {
  await db.files.update(fileId, { ...patch, updated_at: now() });
  const fresh = await db.files.get(fileId);
  if (fresh) void pushFileUpsert(fresh);
}

export function captureOrder(files: FileRecord[]): Map<string, number> {
  return new Map(files.map((f) => [f.id, f.sort_order ?? 0]));
}

export async function restoreOrder(snapshot: Map<string, number>): Promise<void> {
  const t = now();
  await db.transaction("rw", db.files, async () => {
    for (const [id, sort_order] of snapshot) {
      await db.files.update(id, { sort_order, updated_at: t });
    }
  });
  for (const id of snapshot.keys()) {
    const fresh = await db.files.get(id);
    if (fresh) void pushFileUpsert(fresh);
  }
}
