import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { useSync } from "../lib/sync";

export function AppShell() {
  // Subscribes to auth + runs reconcile() on sign-in. Safe no-op when
  // cloud isn't configured or user is anonymous.
  useSync();
  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 overflow-y-auto bg-[var(--color-bg)]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
