// Bidirectional reconciliation on sign-in.
// Order: pull remote first (so we know what already exists in cloud),
// then push any local row without a remote_id.

import { db } from "../db";
import {
  pushFileUpsert,
  pushNoteUpsert,
  pushProjectUpsert,
} from "./push";
import { pullAll } from "./pull";

export interface ReconcileReport {
  pulled: { projects: number; files: number; notes: number };
  pushed: { projects: number; files: number; notes: number };
}

export async function reconcile(): Promise<ReconcileReport> {
  const pulled = await pullAll();

  const localProjects = await db.projects.toArray();
  const localFiles = await db.files.toArray();
  const localNotes = await db.notes.toArray();

  const pushed = { projects: 0, files: 0, notes: 0 };

  for (const p of localProjects) {
    if (!p.remote_id) {
      await pushProjectUpsert(p);
      pushed.projects++;
    }
  }
  for (const f of localFiles) {
    if (!f.remote_id) {
      await pushFileUpsert(f);
      pushed.files++;
    }
  }
  for (const n of localNotes) {
    if (!n.remote_id) {
      await pushNoteUpsert(n);
      pushed.notes++;
    }
  }

  return { pulled, pushed };
}
