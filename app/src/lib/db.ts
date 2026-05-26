import Dexie, { type Table } from "dexie";

export interface Project {
  id: string;
  name: string;
  description?: string;
  color?: string;
  created_at: number;
  updated_at: number;
  remote_id?: string;
}

export interface FileRecord {
  id: string;
  project_id: string;
  name: string;
  mime: string;
  size: number;
  blob: Blob;
  tags: string[];
  created_at: number;
  updated_at: number;
  remote_id?: string;
}

export interface Note {
  id: string;
  project_id: string;
  title: string;
  markdown: string;
  created_at: number;
  updated_at: number;
  remote_id?: string;
}

export interface Reference {
  id: string;
  project_id: string;
  citation_key: string;
  csl_json: Record<string, unknown>;
  bibtex?: string;
  doi?: string;
  url?: string;
  pdf_file_id?: string;
  tags: string[];
  created_at: number;
  updated_at: number;
  remote_id?: string;
}

// Highlights anchored into PDF files. position is the
// react-pdf-highlighter-extended ScaledPosition JSON; we keep it opaque.
export interface Highlight {
  id: string;
  file_id: string;
  project_id: string;
  page: number;
  position: Record<string, unknown>;
  content: { text?: string; image?: string };
  comment: string;
  color: string;
  created_at: number;
  updated_at: number;
  remote_id?: string;
}

export interface Setting {
  key: string;
  value: unknown;
}

export interface SyncOp {
  id?: number;
  op: "create" | "update" | "delete";
  entity: "project" | "file" | "note" | "reference" | "highlight";
  entity_id: string;
  created_at: number;
}

class PaperDB extends Dexie {
  projects!: Table<Project, string>;
  files!: Table<FileRecord, string>;
  notes!: Table<Note, string>;
  references!: Table<Reference, string>;
  highlights!: Table<Highlight, string>;
  settings!: Table<Setting, string>;
  sync_queue!: Table<SyncOp, number>;

  constructor() {
    super("paperassistant");
    this.version(1).stores({
      projects: "id, name, updated_at",
      files: "id, project_id, name, mime, updated_at",
      notes: "id, project_id, title, updated_at",
      settings: "key",
      sync_queue: "++id, entity, entity_id, created_at",
    });
    this.version(2).stores({
      projects: "id, name, updated_at",
      files: "id, project_id, name, mime, updated_at",
      notes: "id, project_id, title, updated_at",
      references: "id, project_id, citation_key, doi, updated_at",
      settings: "key",
      sync_queue: "++id, entity, entity_id, created_at",
    });
    this.version(3).stores({
      projects: "id, name, updated_at",
      files: "id, project_id, name, mime, updated_at",
      notes: "id, project_id, title, updated_at",
      references: "id, project_id, citation_key, doi, updated_at",
      highlights: "id, file_id, project_id, page, updated_at",
      settings: "key",
      sync_queue: "++id, entity, entity_id, created_at",
    });
  }
}

export const db = new PaperDB();

export function uid(): string {
  return crypto.randomUUID();
}

export function now(): number {
  return Date.now();
}
