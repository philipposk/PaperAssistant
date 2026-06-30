import {
  db,
  fileIncludedInExport,
  fileSortCompare,
  sortNotes,
  type Note,
  type Project,
  type Reference,
  type FileRecord,
} from "./db";
import { renderInlineCitations } from "./citations";
import { fileDisplayName } from "./demoSeed/helpers";

function noteBody(n: Note): string {
  const body = n.markdown.trim();
  const heading = n.title.trim() || "Untitled";
  if (/^#{1,2}\s+/.test(body)) return body + "\n";
  return `## ${heading}\n\n${body}\n`;
}

export async function assembleManuscriptMarkdown(
  projectId: string,
  options?: { inlineCitations?: boolean },
): Promise<{ project: Project; markdown: string; refs: Reference[] }> {
  const project = await db.projects.get(projectId);
  if (!project) throw new Error("Project not found");

  const [notes, refs, files] = await Promise.all([
    db.notes.where("project_id").equals(projectId).toArray(),
    db.references.where("project_id").equals(projectId).toArray(),
    db.files.where("project_id").equals(projectId).toArray(),
  ]);

  const sortedNotes = sortNotes(notes);
  const figures = files
    .filter((f) => f.mime.startsWith("image/") && fileIncludedInExport(f))
    .sort(fileSortCompare);
  const tables = files
    .filter(
      (f) =>
        (f.mime === "text/csv" || f.name.toLowerCase().endsWith(".csv")) &&
        fileIncludedInExport(f),
    )
    .sort(fileSortCompare);

  const parts: string[] = [`# ${project.name}`, ""];
  if (project.description?.trim()) {
    parts.push(project.description.trim(), "");
  }

  for (const n of sortedNotes) {
    let text = noteBody(n);
    if (options?.inlineCitations !== false && refs.length) {
      text = renderInlineCitations(text, refs);
    }
    parts.push(text);
  }

  if (figures.length) {
    parts.push("", "# Figures", "");
    for (const f of figures) {
      parts.push(`### ${fileDisplayName(f)}`, "");
      parts.push(`*[${f.name}]*`, "");
    }
  }

  if (tables.length) {
    parts.push("", "# Data tables", "");
    for (const f of tables) {
      parts.push(`- **${fileDisplayName(f)}** — \`${f.name}\``);
    }
    parts.push("");
  }

  return { project, markdown: parts.join("\n"), refs };
}

export function figuresForPreview(files: FileRecord[]): FileRecord[] {
  return files
    .filter((f) => f.mime.startsWith("image/") && fileIncludedInExport(f))
    .sort(fileSortCompare);
}
