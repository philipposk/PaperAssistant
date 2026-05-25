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

export function toMs(iso: string): number {
  return new Date(iso).getTime();
}
