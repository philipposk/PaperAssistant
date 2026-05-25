// Drop a .zip onto the Projects page → it becomes a new project.
// Files inside the zip are written as Dexie FileRecords + pushed to cloud
// if signed in.

import JSZip from "jszip";
import { db, now, uid, type FileRecord, type Project } from "./db";
import { pushFileUpsert, pushProjectUpsert } from "./sync";

const MIME_GUESS: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  svg: "image/svg+xml",
  webp: "image/webp",
  pdf: "application/pdf",
  txt: "text/plain",
  md: "text/markdown",
  csv: "text/csv",
  tsv: "text/tab-separated-values",
  json: "application/json",
  html: "text/html",
  xml: "application/xml",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  zip: "application/zip",
  r: "text/x-r",
  py: "text/x-python",
};

function guessMime(name: string): string {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  return MIME_GUESS[ext] ?? "application/octet-stream";
}

export interface ImportResult {
  project: Project;
  fileCount: number;
  skipped: number;
}

export async function importZipAsProject(file: File): Promise<ImportResult> {
  const zip = await JSZip.loadAsync(file);
  const projectName = file.name.replace(/\.zip$/i, "") || "Imported project";
  const t = now();
  const project: Project = {
    id: uid(),
    name: projectName,
    description: `Imported from ${file.name}`,
    created_at: t,
    updated_at: t,
  };
  await db.projects.add(project);
  void pushProjectUpsert(project);

  let fileCount = 0;
  let skipped = 0;

  const entries: { path: string; entry: JSZip.JSZipObject }[] = [];
  zip.forEach((path, entry) => {
    if (!entry.dir) entries.push({ path, entry });
  });

  for (const { path, entry } of entries) {
    try {
      const blob = await entry.async("blob");
      const name = path.split("/").pop() || path;
      const mime = blob.type || guessMime(name);
      const typedBlob = blob.type ? blob : new Blob([blob], { type: mime });
      const record: FileRecord = {
        id: uid(),
        project_id: project.id,
        name,
        mime,
        size: typedBlob.size,
        blob: typedBlob,
        tags: path.includes("/") ? [path.split("/").slice(0, -1).join("/")] : [],
        created_at: now(),
        updated_at: now(),
      };
      await db.files.add(record);
      void pushFileUpsert(record);
      fileCount++;
    } catch (e) {
      console.warn("[zip-import] skipped", path, e);
      skipped++;
    }
  }

  return { project, fileCount, skipped };
}
