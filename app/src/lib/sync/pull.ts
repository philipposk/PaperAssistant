// Pull cloud rows into Dexie, last-write-wins by updated_at.

import { supabase } from "../supabase";
import { useAuthStore } from "../auth";
import {
  db,
  type FileRecord,
  type Highlight,
  type Note,
  type Project,
  type Reference,
} from "../db";
import {
  toMs,
  type RemoteFile,
  type RemoteHighlight,
  type RemoteNote,
  type RemoteProject,
  type RemoteReference,
} from "./types";

const BUCKET = "files";

function active(): boolean {
  return Boolean(supabase) && Boolean(useAuthStore.getState().user);
}

export async function pullAll(): Promise<{
  projects: number;
  files: number;
  notes: number;
  references: number;
  highlights: number;
}> {
  if (!active() || !supabase)
    return { projects: 0, files: 0, notes: 0, references: 0, highlights: 0 };

  const [projectsRes, filesRes, notesRes, refsRes, hlsRes] = await Promise.all([
    supabase.from("projects").select("*"),
    supabase.from("files").select("*"),
    supabase.from("notes").select("*"),
    supabase.from("references").select("*"),
    supabase.from("highlights").select("*"),
  ]);

  let projects = 0;
  if (projectsRes.data) {
    for (const row of projectsRes.data as RemoteProject[]) {
      const local = await db.projects.get(row.id);
      const remoteMs = toMs(row.updated_at);
      if (!local || remoteMs > local.updated_at) {
        const next: Project = {
          id: row.id,
          name: row.name,
          description: row.description ?? undefined,
          color: row.color ?? undefined,
          created_at: toMs(row.created_at),
          updated_at: remoteMs,
          remote_id: row.id,
        };
        await db.projects.put(next);
        projects++;
      }
    }
  }

  let files = 0;
  if (filesRes.data) {
    for (const row of filesRes.data as RemoteFile[]) {
      const local = await db.files.get(row.id);
      const remoteMs = toMs(row.updated_at);
      if (!local || remoteMs > local.updated_at) {
        const dl = await supabase.storage.from(BUCKET).download(row.storage_path);
        if (dl.error || !dl.data) {
          console.warn("[sync] file blob download failed", row.storage_path, dl.error?.message);
          continue;
        }
        const blob = dl.data;
        const next: FileRecord = {
          id: row.id,
          project_id: row.project_id,
          name: row.name,
          mime: row.mime,
          size: row.size_bytes,
          blob,
          tags: row.tags ?? [],
          created_at: toMs(row.created_at),
          updated_at: remoteMs,
          remote_id: row.id,
        };
        await db.files.put(next);
        files++;
      }
    }
  }

  let notes = 0;
  if (notesRes.data) {
    for (const row of notesRes.data as RemoteNote[]) {
      const local = await db.notes.get(row.id);
      const remoteMs = toMs(row.updated_at);
      if (!local || remoteMs > local.updated_at) {
        const next: Note = {
          id: row.id,
          project_id: row.project_id,
          title: row.title,
          markdown: row.markdown,
          created_at: toMs(row.created_at),
          updated_at: remoteMs,
          remote_id: row.id,
        };
        await db.notes.put(next);
        notes++;
      }
    }
  }

  let references = 0;
  if (refsRes.data) {
    for (const row of refsRes.data as RemoteReference[]) {
      const local = await db.references.get(row.id);
      const remoteMs = toMs(row.updated_at);
      if (!local || remoteMs > local.updated_at) {
        const next: Reference = {
          id: row.id,
          project_id: row.project_id,
          citation_key: row.citation_key,
          csl_json: row.csl_json ?? {},
          bibtex: row.bibtex ?? undefined,
          doi: row.doi ?? undefined,
          url: row.url ?? undefined,
          pdf_file_id: row.pdf_file_id ?? undefined,
          tags: row.tags ?? [],
          created_at: toMs(row.created_at),
          updated_at: remoteMs,
          remote_id: row.id,
        };
        await db.references.put(next);
        references++;
      }
    }
  }

  let highlights = 0;
  if (hlsRes.data) {
    for (const row of hlsRes.data as RemoteHighlight[]) {
      const local = await db.highlights.get(row.id);
      const remoteMs = toMs(row.updated_at);
      if (!local || remoteMs > local.updated_at) {
        const next: Highlight = {
          id: row.id,
          file_id: row.file_id,
          project_id: row.project_id,
          page: row.page,
          position: row.position ?? {},
          content: row.content ?? {},
          comment: row.comment ?? "",
          color: row.color ?? "#ffd54f",
          created_at: toMs(row.created_at),
          updated_at: remoteMs,
          remote_id: row.id,
        };
        await db.highlights.put(next);
        highlights++;
      }
    }
  }

  return { projects, files, notes, references, highlights };
}
