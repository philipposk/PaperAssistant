import { Bell, Search, Settings } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../lib/db";

function isUuid(s: string): boolean {
  return /^[0-9a-f-]{32,36}$/i.test(s);
}

export function Topbar() {
  const location = useLocation();
  const segments = location.pathname.split("/").filter(Boolean);

  const projectIds = segments.filter(isUuid);
  const projectNames = useLiveQuery(
    () =>
      projectIds.length
        ? db.projects
            .where("id")
            .anyOf(projectIds)
            .toArray()
            .then((ps) => Object.fromEntries(ps.map((p) => [p.id, p.name])))
        : Promise.resolve({} as Record<string, string>),
    [projectIds.join(",")],
  );

  return (
    <header className="h-16 shrink-0 border-b border-[var(--color-line)] bg-[var(--color-surface)] px-6 flex items-center justify-between gap-4">
      <nav className="flex items-center gap-2 text-sm text-[var(--color-ink-2)] min-w-0">
        <Link to="/" className="hover:text-[var(--color-ink)]">PaperAssistant</Link>
        {segments.map((s, i) => {
          const decoded = decodeURIComponent(s);
          const label = isUuid(decoded) ? (projectNames?.[decoded] ?? "…") : decoded;
          return (
            <span key={i} className="flex items-center gap-2 truncate">
              <span className="text-[var(--color-ink-4)]">›</span>
              <span className="truncate capitalize">{label}</span>
            </span>
          );
        })}
        {segments.length === 0 && (
          <>
            <span className="text-[var(--color-ink-4)]">›</span>
            <span>Dashboard</span>
          </>
        )}
      </nav>

      <div className="flex items-center gap-2">
        <div className="relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-3)]"
          />
          <input
            placeholder="Search files, figures, sections…"
            className="w-80 pl-9 pr-3 py-2 text-sm rounded-md border border-[var(--color-line)] bg-[var(--color-bg)] focus:outline-none focus:border-[var(--color-accent)] focus:bg-[var(--color-surface)] transition-colors"
          />
        </div>
        <button
          type="button"
          aria-label="Notifications"
          className="w-9 h-9 rounded-md border border-[var(--color-line)] hover:bg-[var(--color-surface-2)] flex items-center justify-center text-[var(--color-ink-2)]"
        >
          <Bell size={16} />
        </button>
        <Link
          to="/settings"
          aria-label="Settings"
          className="w-9 h-9 rounded-md border border-[var(--color-line)] hover:bg-[var(--color-surface-2)] flex items-center justify-center text-[var(--color-ink-2)]"
        >
          <Settings size={16} />
        </Link>
      </div>
    </header>
  );
}
