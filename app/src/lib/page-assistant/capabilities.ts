import { capability } from "@page-assistant/widget";
import { db, now } from "../db";
import { useCurrentProjectStore } from "../currentProject";
import { searchPapers } from "../semanticScholar";
import { pushFileDelete } from "../sync";
import { pageAssistantNavigate } from "./navigate";

function currentProjectId(): string | null {
  return useCurrentProjectStore.getState().currentProjectId;
}

async function assertWritableProject(projectId: string) {
  const project = await db.projects.get(projectId);
  if (!project) throw new Error("Project not found.");
  if (project.is_demo) throw new Error("Cannot modify the read-only example project.");
  return project;
}

/** Browser capabilities — each `run()` uses the same Dexie/sync paths as the UI. */
export function paperAssistantCapabilities() {
  return [
    capability({
      name: "navigate_to",
      description: "Navigate to an in-app route (e.g. /projects, /settings, /projects/:id/files).",
      parameters: {
        type: "object",
        properties: { path: { type: "string", description: "App path starting with /" } },
        required: ["path"],
      },
      async run({ path }: { path: string }) {
        pageAssistantNavigate(path);
        return { path };
      },
      render: (r: { path: string }) => `Opened ${r.path}.`,
    }),
    capability({
      name: "search_papers",
      description: "Search Semantic Scholar for academic papers by keyword.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "Search phrase" },
          limit: { type: "number", description: "Max results (default 10)" },
        },
        required: ["query"],
      },
      async run({ query, limit }: { query: string; limit?: number }) {
        const res = await searchPapers(query, { limit: limit ?? 10 });
        const lines = res.data.map((p, i) => {
          const authors = p.authors?.slice(0, 3).map((a) => a.name).join(", ") ?? "";
          return `${i + 1}. ${p.title}${p.year ? ` (${p.year})` : ""}${authors ? ` — ${authors}` : ""} [${p.paperId}]`;
        });
        return {
          total: res.total,
          count: res.data.length,
          summary: lines.length ? lines.join("\n") : "No papers found.",
        };
      },
      render: (r: { summary: string; count: number; total: number }) =>
        `Found ${r.count} of ${r.total} matches.\n${r.summary}`,
    }),
    capability({
      name: "list_projects",
      description: "List the user's research projects in this browser.",
      parameters: {
        type: "object",
        properties: { limit: { type: "number", description: "Max projects (default 20)" } },
      },
      async run({ limit }: { limit?: number }) {
        const all = await db.projects.orderBy("updated_at").reverse().toArray();
        const slice = all.slice(0, limit ?? 20);
        const lines = slice.map(
          (p) =>
            `• ${p.name}${p.is_demo ? " (example)" : ""} — id: ${p.id}${p.description ? ` — ${p.description}` : ""}`,
        );
        return {
          count: slice.length,
          total: all.length,
          summary: lines.length ? lines.join("\n") : "No projects yet.",
        };
      },
      render: (r: { summary: string }) => r.summary,
    }),
    capability({
      name: "open_project",
      description: "Switch to a project and open its overview page.",
      parameters: {
        type: "object",
        properties: { project_id: { type: "string", description: "Project id from list_projects" } },
        required: ["project_id"],
      },
      async run({ project_id }: { project_id: string }) {
        const project = await db.projects.get(project_id);
        if (!project) throw new Error("Project not found.");
        useCurrentProjectStore.getState().setCurrentProjectId(project_id);
        pageAssistantNavigate(`/projects/${project_id}`);
        return { name: project.name, id: project_id };
      },
      render: (r: { name: string }) => `Opened project "${r.name}".`,
    }),
    capability({
      name: "list_files",
      description: "List files in the current (or specified) project.",
      parameters: {
        type: "object",
        properties: {
          project_id: { type: "string", description: "Optional; defaults to current project" },
          limit: { type: "number" },
        },
      },
      async run({ project_id, limit }: { project_id?: string; limit?: number }) {
        const pid = project_id ?? currentProjectId();
        if (!pid) throw new Error("No project selected. Pass project_id or open a project first.");
        const project = await db.projects.get(pid);
        if (!project) throw new Error("Project not found.");
        const files = await db.files.where("project_id").equals(pid).reverse().sortBy("updated_at");
        const slice = files.slice(0, limit ?? 30);
        const lines = slice.map(
          (f) => `• ${f.name} (${f.mime || "binary"}, ${Math.round(f.size / 1024)} KB) — id: ${f.id}`,
        );
        return {
          project: project.name,
          count: slice.length,
          total: files.length,
          summary: lines.length ? lines.join("\n") : "No files in this project.",
        };
      },
      render: (r: { summary: string; project: string }) => `Files in ${r.project}:\n${r.summary}`,
    }),
    capability({
      name: "delete_file",
      description: "Permanently delete a file from a project. Cannot delete from example projects.",
      parameters: {
        type: "object",
        properties: {
          file_id: { type: "string", description: "File id from list_files" },
          project_id: { type: "string", description: "Owning project id" },
        },
        required: ["file_id", "project_id"],
      },
      confirm: true,
      async run({ file_id, project_id }: { file_id: string; project_id: string }) {
        await assertWritableProject(project_id);
        const file = await db.files.get(file_id);
        if (!file || file.project_id !== project_id) {
          throw new Error("File not found in that project.");
        }
        await db.files.delete(file_id);
        await db.projects.update(project_id, { updated_at: now() });
        void pushFileDelete(file);
        return { name: file.name, id: file_id };
      },
      render: (r: { name: string }) => `Deleted file "${r.name}".`,
    }),
  ];
}

export { PAPERASSISTANT_PA_KNOWLEDGE } from "@paperassistant/lib/page-assistant/manifest";
