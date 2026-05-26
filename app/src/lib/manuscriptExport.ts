// Build a Quarto-style manuscript folder from a project: index.qmd combining
// all notes, references.bib, figures/, and an export-manifest.json. Returns
// a JSZip Blob for download.

import JSZip from "jszip";
import { db, type Note, type Project, type Reference, type FileRecord } from "./db";
import { exportBibtex } from "./citations";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "project";
}

function frontMatter(project: Project): string {
  const safeTitle = project.name.replace(/"/g, '\\"');
  const safeAbstract = (project.description ?? "")
    .replace(/\n/g, " ")
    .replace(/"/g, '\\"');
  return [
    "---",
    `title: "${safeTitle}"`,
    safeAbstract ? `abstract: "${safeAbstract}"` : "",
    'bibliography: "references.bib"',
    "format:",
    "  html:",
    "    toc: true",
    "  pdf:",
    "    documentclass: scrartcl",
    "---",
    "",
  ]
    .filter(Boolean)
    .join("\n");
}

function notesSection(notes: Note[]): string {
  if (!notes.length) return "";
  const sorted = [...notes].sort((a, b) => a.created_at - b.created_at);
  return sorted
    .map((n) => {
      const body = n.markdown.trim();
      // If note already begins with an H1/H2, don't double-up the title.
      if (/^#{1,2}\s+/.test(body)) return body + "\n";
      return `## ${n.title}\n\n${body}\n`;
    })
    .join("\n");
}

function figuresSection(figures: FileRecord[]): string {
  if (!figures.length) return "";
  const lines = ["", "# Figures", ""];
  for (const f of figures) {
    const safe = f.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const caption = f.name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ");
    lines.push(`![${caption}](figures/${safe})\n`);
  }
  return lines.join("\n");
}

function csvSection(tables: FileRecord[]): string {
  if (!tables.length) return "";
  const lines = ["", "# Data tables", ""];
  for (const f of tables) {
    const safe = f.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    lines.push(`- [\`${f.name}\`](tables/${safe})`);
  }
  return lines.join("\n");
}

export interface ExportManifest {
  project: { id: string; name: string };
  exported_at: string;
  notes: number;
  references: number;
  figures: number;
  tables: number;
  other_files: number;
}

export async function buildManuscriptZip(projectId: string): Promise<{
  blob: Blob;
  filename: string;
  manifest: ExportManifest;
}> {
  const project = await db.projects.get(projectId);
  if (!project) throw new Error("Project not found");

  const [notes, refs, files] = await Promise.all([
    db.notes.where("project_id").equals(projectId).toArray(),
    db.references.where("project_id").equals(projectId).toArray(),
    db.files.where("project_id").equals(projectId).toArray(),
  ]);

  const figures = files.filter((f) => f.mime.startsWith("image/"));
  const tables = files.filter(
    (f) => f.mime === "text/csv" || f.name.toLowerCase().endsWith(".csv"),
  );
  const others = files.filter(
    (f) => !figures.includes(f) && !tables.includes(f),
  );

  const zip = new JSZip();

  // index.qmd
  const qmd =
    frontMatter(project) +
    "\n" +
    notesSection(notes) +
    figuresSection(figures) +
    csvSection(tables);
  zip.file("index.qmd", qmd);

  // references.bib
  if (refs.length > 0) {
    try {
      zip.file(
        "references.bib",
        exportBibtex(refs.map((r) => r.csl_json)),
      );
    } catch (e) {
      console.warn("[export] bibtex generation failed", e);
      zip.file(
        "references.bib",
        refs.map(asBibtexFallback).join("\n\n"),
      );
    }
  }

  // figures/
  for (const f of figures) {
    const safe = f.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    zip.file(`figures/${safe}`, f.blob);
  }
  // tables/
  for (const f of tables) {
    const safe = f.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    zip.file(`tables/${safe}`, f.blob);
  }
  // files/
  for (const f of others) {
    const safe = f.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    zip.file(`files/${safe}`, f.blob);
  }

  // README
  zip.file(
    "README.md",
    [
      `# ${project.name}`,
      "",
      project.description ?? "",
      "",
      "Exported from PaperAssistant. To render:",
      "",
      "```sh",
      "quarto render index.qmd --to pdf",
      "```",
      "",
      "Or open `index.qmd` in any markdown / Quarto editor.",
    ].join("\n"),
  );

  const manifest: ExportManifest = {
    project: { id: project.id, name: project.name },
    exported_at: new Date().toISOString(),
    notes: notes.length,
    references: refs.length,
    figures: figures.length,
    tables: tables.length,
    other_files: others.length,
  };
  zip.file("export-manifest.json", JSON.stringify(manifest, null, 2));

  const blob = await zip.generateAsync({ type: "blob" });
  return {
    blob,
    filename: `${slugify(project.name)}-export.zip`,
    manifest,
  };
}

function asBibtexFallback(r: Reference): string {
  const csl = r.csl_json;
  const title = (csl.title as string) ?? "Untitled";
  const year =
    (csl.issued as { "date-parts"?: number[][] } | undefined)?.[
      "date-parts"
    ]?.[0]?.[0] ?? "n.d.";
  const authors = Array.isArray(csl.author)
    ? (csl.author as { family?: string; given?: string }[])
        .map((a) => `${a.family ?? ""}, ${a.given ?? ""}`.replace(/, $/, ""))
        .join(" and ")
    : "";
  const doi = (csl.DOI as string) ?? r.doi ?? "";
  return [
    `@misc{${r.citation_key},`,
    `  title = {${title}},`,
    authors ? `  author = {${authors}},` : "",
    year ? `  year = {${year}},` : "",
    doi ? `  doi = {${doi}},` : "",
    "}",
  ]
    .filter(Boolean)
    .join("\n");
}
