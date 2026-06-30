import { db, now, type FileRecord } from "./db";
import { logActivity } from "./activityLog";
import { pushFileUpsert } from "./sync";

export async function replaceFileBlob(
  fileId: string,
  blob: Blob,
  name: string,
  mime: string,
  projectId: string,
): Promise<void> {
  await db.files.update(fileId, {
    blob,
    name,
    mime,
    size: blob.size,
    updated_at: now(),
  });
  const fresh = await db.files.get(fileId);
  if (fresh) void pushFileUpsert(fresh);
  await logActivity({
    project_id: projectId,
    entity: "file",
    entity_id: fileId,
    action: "replace",
    summary: `Replaced image with ${name}`,
  });
}

export function downloadFileBlob(file: FileRecord): void {
  const url = URL.createObjectURL(file.blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = file.name;
  a.click();
  URL.revokeObjectURL(url);
}
