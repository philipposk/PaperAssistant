import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { ToastProvider } from "./Toast";
import { PageAssistantWidget } from "./PageAssistantWidget";
import { useSync } from "../lib/sync";
import { ensureDemoProjects, dedupeDemoProjects } from "../lib/demoSeed";

export function AppShell() {
  useSync();

  useEffect(() => {
    void (async () => {
      await ensureDemoProjects();
      await dedupeDemoProjects();
    })();
  }, []);

  return (
    <ToastProvider>
      <PageAssistantWidget />
      <div className="flex h-screen w-screen overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Topbar />
          <main className="flex-1 overflow-y-auto bg-[var(--color-bg)]">
            <Outlet />
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
