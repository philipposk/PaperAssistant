// Push local Dexie mutations to Supabase. No-ops if cloud not configured
// or user is anonymous — callers can always invoke these.

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

const BUCKET = "files";

function userId(): string | null {
  return useAuthStore.getState().user?.id ?? null;
}

function active(): boolean {
  return Boolean(supabase) && Boolean(userId());
}

function storagePath(uid: string, projectId: string, fileId: string): string {
  return `${uid}/${projectId}/${fileId}`;
}

// ----- projects -----

export async function pushProjectUpsert(p: Project): Promise<void> {
  if (!active() || !supabase) return;
  const uid = userId()!;
  const row = {
    id: p.id,
    user_id: uid,
    name: p.name,
    description: p.description ?? null,
    color: p.color ?? null,
    created_at: new Date(p.created_at).toISOString(),
    updated_at: new Date(p.updated_at).toISOString(),
  };
  const { error } = await supabase.from("projects").upsert(row);
  if (error) {
    console.warn("[sync] pushProjectUpsert failed", error.message);
    return;
  }
  if (!p.remote_id) {
    await db.projects.update(p.id, { remote_id: p.id });
  }
}

export async function pushProjectDelete(id: string): Promise<void> {
  if (!active() || !supabase) return;
  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) console.warn("[sync] pushProjectDelete failed", error.message);
}

// ----- files (with blob upload) -----

export async function pushFileUpsert(f: FileRecord): Promise<void> {
  if (!active() || !supabase) return;
  const uid = userId()!;
  const path = storagePath(uid, f.project_id, f.id);
  // Upload blob (upsert: replace if exists).
  const { error: upErr } = await supabase.storage
    .from(BUCKET)
    .upload(path, f.blob, {
      contentType: f.mime,
      upsert: true,
    });
  if (upErr) {
    console.warn("[sync] file blob upload failed", upErr.message);
    return;
  }
  const row = {
    id: f.id,
    project_id: f.project_id,
    user_id: uid,
    name: f.name,
    mime: f.mime,
    size_bytes: f.size,
    storage_path: path,
    tags: f.tags,
    created_at: new Date(f.created_at).toISOString(),
    updated_at: new Date(f.updated_at).toISOString(),
  };
  const { error } = await supabase.from("files").upsert(row);
  if (error) {
    console.warn("[sync] pushFileUpsert failed", error.message);
    return;
  }
  if (!f.remote_id) {
    await db.files.update(f.id, { remote_id: f.id });
  }
}

export async function pushFileDelete(f: FileRecord | { id: string; project_id: string }): Promise<void> {
  if (!active() || !supabase) return;
  const uid = userId()!;
  const path = storagePath(uid, f.project_id, f.id);
  await supabase.storage.from(BUCKET).remove([path]);
  const { error } = await supabase.from("files").delete().eq("id", f.id);
  if (error) console.warn("[sync] pushFileDelete failed", error.message);
}

// ----- notes -----

export async function pushNoteUpsert(n: Note): Promise<void> {
  if (!active() || !supabase) return;
  const uid = userId()!;
  const row = {
    id: n.id,
    project_id: n.project_id,
    user_id: uid,
    title: n.title,
    markdown: n.markdown,
    created_at: new Date(n.created_at).toISOString(),
    updated_at: new Date(n.updated_at).toISOString(),
  };
  const { error } = await supabase.from("notes").upsert(row);
  if (error) {
    console.warn("[sync] pushNoteUpsert failed", error.message);
    return;
  }
  if (!n.remote_id) {
    await db.notes.update(n.id, { remote_id: n.id });
  }
}

export async function pushNoteDelete(id: string): Promise<void> {
  if (!active() || !supabase) return;
  const { error } = await supabase.from("notes").delete().eq("id", id);
  if (error) console.warn("[sync] pushNoteDelete failed", error.message);
}

// ----- references -----

export async function pushReferenceUpsert(r: Reference): Promise<void> {
  if (!active() || !supabase) return;
  const uid = userId()!;
  const row = {
    id: r.id,
    project_id: r.project_id,
    user_id: uid,
    citation_key: r.citation_key,
    csl_json: r.csl_json,
    bibtex: r.bibtex ?? null,
    doi: r.doi ?? null,
    url: r.url ?? null,
    pdf_file_id: r.pdf_file_id ?? null,
    tags: r.tags,
    created_at: new Date(r.created_at).toISOString(),
    updated_at: new Date(r.updated_at).toISOString(),
  };
  const { error } = await supabase.from("references").upsert(row);
  if (error) {
    console.warn("[sync] pushReferenceUpsert failed", error.message);
    return;
  }
  if (!r.remote_id) {
    await db.references.update(r.id, { remote_id: r.id });
  }
}

export async function pushReferenceDelete(id: string): Promise<void> {
  if (!active() || !supabase) return;
  const { error } = await supabase.from("references").delete().eq("id", id);
  if (error) console.warn("[sync] pushReferenceDelete failed", error.message);
}

// ----- highlights -----

export async function pushHighlightUpsert(h: Highlight): Promise<void> {
  if (!active() || !supabase) return;
  const uid = userId()!;
  const row = {
    id: h.id,
    file_id: h.file_id,
    project_id: h.project_id,
    user_id: uid,
    page: h.page,
    position: h.position,
    content: h.content,
    comment: h.comment,
    color: h.color,
    created_at: new Date(h.created_at).toISOString(),
    updated_at: new Date(h.updated_at).toISOString(),
  };
  const { error } = await supabase.from("highlights").upsert(row);
  if (error) {
    console.warn("[sync] pushHighlightUpsert failed", error.message);
    return;
  }
  if (!h.remote_id) {
    await db.highlights.update(h.id, { remote_id: h.id });
  }
}

export async function pushHighlightDelete(id: string): Promise<void> {
  if (!active() || !supabase) return;
  const { error } = await supabase.from("highlights").delete().eq("id", id);
  if (error) console.warn("[sync] pushHighlightDelete failed", error.message);
}
