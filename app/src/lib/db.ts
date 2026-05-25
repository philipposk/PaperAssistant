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

export interface Setting {
  key: string;
  value: unknown;
}

export interface SyncOp {
  id?: number;
  op: "create" | "update" | "delete";
  entity: "project" | "file" | "note";
  entity_id: string;
  created_at: number;
}

class PaperDB extends Dexie {
  projects!: Table<Project, string>;
  files!: Table<FileRecord, string>;
  notes!: Table<Note, string>;
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
  }
}

export const db = new PaperDB();

export function uid(): string {
  return crypto.randomUUID();
}

export function now(): number {
  return Date.now();
}
