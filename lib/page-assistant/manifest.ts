import type { Capability } from "@page-assistant/core";

/** Capability schemas for llm.txt / agent discovery (browser `run()` lives in the app). */
export function paperAssistantCapabilityManifest(): Capability[] {
  return [
    {
      name: "navigate_to",
      description: "Navigate to an in-app route (e.g. /projects, /settings, /projects/:id/files).",
      parameters: {
        type: "object",
        properties: { path: { type: "string", description: "App path starting with /" } },
        required: ["path"],
      },
      run: async () => ({ ok: false }),
      render: () => "Navigated.",
    },
    {
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
      run: async () => ({ papers: [] }),
      render: (r: { summary?: string }) => r.summary ?? "Search complete.",
    },
    {
      name: "list_projects",
      description: "List the user's research projects in this browser.",
      parameters: { type: "object", properties: { limit: { type: "number" } } },
      run: async () => ({ projects: [] }),
      render: (r: { summary: string }) => r.summary,
    },
    {
      name: "open_project",
      description: "Switch to a project and open its overview page.",
      parameters: {
        type: "object",
        properties: { project_id: { type: "string", description: "Project id from list_projects" } },
        required: ["project_id"],
      },
      run: async () => ({ ok: true }),
      render: (r: { name: string }) => `Opened project "${r.name}".`,
    },
    {
      name: "list_files",
      description: "List files in the current (or specified) project.",
      parameters: {
        type: "object",
        properties: {
          project_id: { type: "string", description: "Optional; defaults to current project" },
          limit: { type: "number" },
        },
      },
      run: async () => ({ files: [] }),
      render: (r: { summary: string }) => r.summary,
    },
    {
      name: "delete_file",
      description: "Permanently delete a file from a project. Cannot delete demo/example projects.",
      parameters: {
        type: "object",
        properties: {
          file_id: { type: "string", description: "File id from list_files" },
          project_id: { type: "string", description: "Owning project id" },
        },
        required: ["file_id", "project_id"],
      },
      confirm: true,
      run: async () => ({ deleted: true }),
      render: (r: { name: string }) => `Deleted file "${r.name}".`,
    },
  ];
}

export const PAPERASSISTANT_PA_KNOWLEDGE = `PaperAssistant is a research workspace: projects, PDFs, figures, tables, markdown notes, citations, PDF highlights, Semantic Scholar search, citation graphs, co-author sharing, and PDF Q&A on /projects/:id/ask.
The site-wide assistant navigates the app, searches papers, and manages projects/files in the local Dexie store (synced when signed in).
For deep PDF questions use the dedicated Ask page on the current project — it is separate from this assistant.`;

export function paLlmTxtMeta(origin: string) {
  const base = origin.replace(/\/$/, "");
  return {
    appName: "PaperAssistant",
    appUrl: base,
    description:
      "Research paper workspace with projects, files, citations, Semantic Scholar search, and grounded page assistant.",
    version: "0.1.3",
    agentEndpoint: `${base}/api/pa/v1/agent`,
  };
}
