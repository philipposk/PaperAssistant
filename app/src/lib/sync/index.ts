// Auto-sync orchestration. Exposes a zustand store with sync status and
// runs reconcile on sign-in.

import { create } from "zustand";
import { useEffect } from "react";
import { useAuthStore } from "../auth";
import { isCloudConfigured } from "../supabase";
import { reconcile, type ReconcileReport } from "./reconcile";

export * from "./push";
export * from "./pull";
export { reconcile };

export type SyncStatus = "idle" | "syncing" | "synced" | "error" | "offline";

interface SyncState {
  status: SyncStatus;
  lastReport: ReconcileReport | null;
  lastError: string | null;
  setStatus: (s: SyncStatus) => void;
  setLastReport: (r: ReconcileReport) => void;
  setLastError: (e: string | null) => void;
}

export const useSyncStore = create<SyncState>((set) => ({
  status: isCloudConfigured ? "idle" : "offline",
  lastReport: null,
  lastError: null,
  setStatus: (s) => set({ status: s }),
  setLastReport: (r) => set({ lastReport: r }),
  setLastError: (e) => set({ lastError: e }),
}));

let lastReconciledUserId: string | null = null;

async function runReconcile() {
  const { setStatus, setLastReport, setLastError } = useSyncStore.getState();
  setStatus("syncing");
  setLastError(null);
  try {
    const report = await reconcile();
    setLastReport(report);
    setStatus("synced");
  } catch (e) {
    setLastError(e instanceof Error ? e.message : String(e));
    setStatus("error");
  }
}

export function useSync() {
  const user = useAuthStore((s) => s.user);
  const sync = useSyncStore();

  useEffect(() => {
    if (!isCloudConfigured) return;
    const uid = user?.id ?? null;
    if (!uid) {
      lastReconciledUserId = null;
      useSyncStore.getState().setStatus("offline");
      return;
    }
    if (uid === lastReconciledUserId) return;
    lastReconciledUserId = uid;
    void runReconcile();
  }, [user?.id]);

  return sync;
}

export async function triggerSync() {
  if (!isCloudConfigured) return;
  await runReconcile();
}
