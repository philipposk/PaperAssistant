// Helpers for tag-based filtering across files + references.

import { db } from "./db";

export async function projectTagSuggestions(projectId: string): Promise<string[]> {
  const [files, refs] = await Promise.all([
    db.files.where("project_id").equals(projectId).toArray(),
    db.references.where("project_id").equals(projectId).toArray(),
  ]);
  const counts = new Map<string, number>();
  for (const f of files) for (const t of f.tags ?? []) counts.set(t, (counts.get(t) ?? 0) + 1);
  for (const r of refs) for (const t of r.tags ?? []) counts.set(t, (counts.get(t) ?? 0) + 1);
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([t]) => t);
}

// Saved searches live in localStorage keyed by project_id so they survive
// reloads without touching Dexie/Supabase yet.
const KEY_PREFIX = "paperassistant.savedSearches.";

export interface SavedSearch {
  id: string;
  label: string;
  query: string;
}

export function loadSavedSearches(projectId: string): SavedSearch[] {
  try {
    const raw = localStorage.getItem(KEY_PREFIX + projectId);
    if (!raw) return [];
    return JSON.parse(raw) as SavedSearch[];
  } catch {
    return [];
  }
}

export function saveSavedSearches(projectId: string, items: SavedSearch[]) {
  localStorage.setItem(KEY_PREFIX + projectId, JSON.stringify(items));
}
