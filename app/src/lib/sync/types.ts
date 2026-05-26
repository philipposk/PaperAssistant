// DB row shapes matching supabase/migrations/0001_init.sql.

export interface RemoteProject {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  color: string | null;
  created_at: string;
  updated_at: string;
}

export interface RemoteFile {
  id: string;
  project_id: string;
  user_id: string;
  name: string;
  mime: string;
  size_bytes: number;
  storage_path: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface RemoteNote {
  id: string;
  project_id: string;
  user_id: string;
  title: string;
  markdown: string;
  created_at: string;
  updated_at: string;
}

export interface RemoteReference {
  id: string;
  project_id: string;
  user_id: string;
  citation_key: string;
  csl_json: Record<string, unknown>;
  bibtex: string | null;
  doi: string | null;
  url: string | null;
  pdf_file_id: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface RemoteHighlight {
  id: string;
  file_id: string;
  project_id: string;
  user_id: string;
  page: number;
  position: Record<string, unknown>;
  content: { text?: string; image?: string };
  comment: string;
  color: string;
  created_at: string;
  updated_at: string;
}

export function toMs(iso: string): number {
  return new Date(iso).getTime();
}
