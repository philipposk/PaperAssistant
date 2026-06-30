import {
  db,
  fileSortCompare,
  now,
  sortNotes,
  uid,
  type FileRecord,
  type Note,
  type Project,
  type Reference,
} from "./db";

export interface CombineSection {
  sourceProjectId: string;
  sourceProjectName: string;
  noteId: string;
  noteTitle: string;
}

function normalizeDoi(doi: string | undefined): string | null {
  if (!doi) return null;
  return doi.trim().toLowerCase().replace(/^https?:\/\/(dx\.)?doi\.org\//i, "");
}

export async function combineProjects(
  sourceIds: string[],
  newName: string,
  sections: CombineSection[],
): Promise<Project> {
  if (sourceIds.length < 2) throw new Error("Select at least two projects");
  if (!newName.trim()) throw new Error("Name the new project");

  const sources = await Promise.all(sourceIds.map((id) => db.projects.get(id)));
  if (sources.some((p) => !p)) throw new Error("A source project was not found");
  if (sources.some((p) => p!.is_demo)) {
    throw new Error("Cannot combine example projects — duplicate them first");
  }

  const t = now();
  const newId = uid();
  const project: Project = {
    id: newId,
    name: newName.trim(),
    description: `Combined from: ${sources.map((p) => p!.name).join(", ")}`,
    color: sources[0]!.color,
    is_demo: false,
    created_at: t,
    updated_at: t,
  };

  const noteById = new Map<string, Note>();
  for (const sid of sourceIds) {
    const notes = await db.notes.where("project_id").equals(sid).toArray();
    for (const n of sortNotes(notes)) noteById.set(n.id, n);
  }

  const newNotes: Note[] = [];
  for (let i = 0; i < sections.length; i++) {
    const sec = sections[i];
    const src = noteById.get(sec.noteId);
    if (!src) continue;
    const header = `> *From ${sec.sourceProjectName}*\n\n`;
    newNotes.push({
      id: uid(),
      project_id: newId,
      title: src.title,
      markdown: header + src.markdown,
      sort_order: i,
      created_at: t + i,
      updated_at: t + i,
    });
  }

  const seenDoi = new Set<string>();
  const newRefs: Reference[] = [];
  for (const sid of sourceIds) {
    const refs = await db.references.where("project_id").equals(sid).toArray();
    for (const r of refs) {
      const doi = normalizeDoi(r.doi ?? (r.csl_json.DOI as string | undefined));
      if (doi) {
        if (seenDoi.has(doi)) continue;
        seenDoi.add(doi);
      }
      newRefs.push({
        ...r,
        id: uid(),
        project_id: newId,
        created_at: t,
        updated_at: t,
        remote_id: undefined,
      });
    }
  }

  const newFiles: FileRecord[] = [];
  let fileOrder = 0;
  for (const sid of sourceIds) {
    const files = await db.files.where("project_id").equals(sid).toArray();
    files.sort(fileSortCompare);
    for (const f of files) {
      newFiles.push({
        ...f,
        id: uid(),
        project_id: newId,
        blob: f.blob,
        sort_order: fileOrder++,
        created_at: t,
        updated_at: t,
        remote_id: undefined,
      });
    }
  }

  await db.transaction(
    "rw",
    [db.projects, db.notes, db.references, db.files],
    async () => {
      await db.projects.add(project);
      if (newNotes.length) await db.notes.bulkAdd(newNotes);
      if (newRefs.length) await db.references.bulkAdd(newRefs);
      if (newFiles.length) await db.files.bulkAdd(newFiles);
    },
  );

  return project;
}

export async function listCombineSections(
  projectIds: string[],
): Promise<CombineSection[]> {
  const sections: CombineSection[] = [];
  for (const pid of projectIds) {
    const project = await db.projects.get(pid);
    if (!project) continue;
    const notes = sortNotes(
      await db.notes.where("project_id").equals(pid).toArray(),
    );
    for (const n of notes) {
      sections.push({
        sourceProjectId: pid,
        sourceProjectName: project.name,
        noteId: n.id,
        noteTitle: n.title.trim() || "Untitled",
      });
    }
  }
  return sections;
}
