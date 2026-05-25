import { NavLink, useLocation } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import {
  LayoutDashboard,
  FileText,
  BookOpen,
  Image as ImageIcon,
  Table as TableIcon,
  StickyNote,
  Wrench,
  Flag,
  Moon,
  Sun,
} from "lucide-react";
import { cn } from "../lib/cn";
import { db } from "../lib/db";
import { useTheme } from "../lib/theme";
import { useCurrentProject } from "../lib/currentProject";
import { ProjectPicker } from "./ProjectPicker";
import { AccountWidget } from "./AccountWidget";

function NavItem({
  to,
  icon: Icon,
  label,
  badge,
}: {
  to: string;
  icon: typeof LayoutDashboard;
  label: string;
  badge?: string | number;
}) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        cn(
          "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
          isActive
            ? "bg-[var(--color-accent-soft)] text-[var(--color-accent)] font-medium"
            : "text-[var(--color-ink-2)] hover:bg-[var(--color-surface-2)]",
        )
      }
    >
      <Icon size={16} strokeWidth={1.6} />
      <span className="flex-1">{label}</span>
      {badge !== undefined && (
        <span className="mono text-[10px] text-[var(--color-ink-3)] bg-[var(--color-surface-2)] px-1.5 py-0.5 rounded">
          {badge}
        </span>
      )}
    </NavLink>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mono uppercase text-[10px] tracking-wider text-[var(--color-ink-3)] px-3 mt-5 mb-2">
      {children}
    </div>
  );
}

export function Sidebar() {
  const { theme, toggle } = useTheme();
  const { currentProject } = useCurrentProject();
  const location = useLocation();

  const fileCount = useLiveQuery(
    () =>
      currentProject
        ? db.files.where("project_id").equals(currentProject.id).count()
        : Promise.resolve(0),
    [currentProject?.id],
  );
  const noteCount = useLiveQuery(
    () =>
      currentProject
        ? db.notes.where("project_id").equals(currentProject.id).count()
        : Promise.resolve(0),
    [currentProject?.id],
  );
  const figCount = useLiveQuery(
    () =>
      currentProject
        ? db.files
            .where("project_id")
            .equals(currentProject.id)
            .filter((f) => f.mime.startsWith("image/"))
            .count()
        : Promise.resolve(0),
    [currentProject?.id],
  );
  const tableCount = useLiveQuery(
    () =>
      currentProject
        ? db.files
            .where("project_id")
            .equals(currentProject.id)
            .filter((f) => f.mime === "text/csv" || f.name.endsWith(".csv"))
            .count()
        : Promise.resolve(0),
    [currentProject?.id],
  );

  const projectId = currentProject?.id;

  return (
    <aside className="w-64 shrink-0 h-full border-r border-[var(--color-line)] bg-[var(--color-surface)] flex flex-col">
      <div className="px-4 py-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-md bg-[var(--color-accent)] flex items-center justify-center text-[#f6f2ea] font-semibold serif text-lg">
          P
        </div>
        <div>
          <div className="serif font-semibold leading-tight">PaperAssistant</div>
          <div className="mono uppercase text-[10px] tracking-wider text-[var(--color-ink-3)]">
            Research workspace
          </div>
        </div>
      </div>

      <ProjectPicker />

      <nav className="flex-1 overflow-y-auto px-2 pb-4">
        <SectionLabel>Workspace</SectionLabel>
        <NavItem to="/" icon={LayoutDashboard} label="Dashboard" />
        {projectId && (
          <>
            <NavItem
              to={`/projects/${projectId}`}
              icon={FileText}
              label="Project home"
            />
            <NavItem to="/projects" icon={BookOpen} label="All projects" />
          </>
        )}
        {!projectId && (
          <NavItem to="/projects" icon={BookOpen} label="Projects" />
        )}

        {projectId && (
          <>
            <SectionLabel>Outputs</SectionLabel>
            <NavItem
              to={`/projects/${projectId}/files`}
              icon={FileText}
              label="Files"
              badge={fileCount ?? 0}
            />
            <NavItem
              to={`/projects/${projectId}/figures`}
              icon={ImageIcon}
              label="Figures"
              badge={figCount ?? 0}
            />
            <NavItem
              to={`/projects/${projectId}/tables`}
              icon={TableIcon}
              label="Tables"
              badge={tableCount ?? 0}
            />
            <NavItem
              to={`/projects/${projectId}/notes`}
              icon={StickyNote}
              label="Notes"
              badge={noteCount ?? 0}
            />
          </>
        )}

        <SectionLabel>Tools</SectionLabel>
        <NavItem to="/settings" icon={Wrench} label="Settings" />
        <NavItem to="/examples" icon={Flag} label="Examples" />
      </nav>

      <AccountWidget />

      <button
        type="button"
        onClick={toggle}
        className="mx-3 mb-3 px-3 py-2.5 rounded-md border border-[var(--color-line)] hover:bg-[var(--color-surface-2)] transition-colors flex items-center justify-between text-sm"
      >
        <span className="flex items-center gap-2">
          {theme === "light" ? <Sun size={14} /> : <Moon size={14} />}
          Theme
        </span>
        <span className="mono text-[10px] uppercase text-[var(--color-ink-3)]">
          {theme}
        </span>
      </button>
      <div className="px-4 pb-3 text-[11px] text-[var(--color-ink-3)] flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-green)]" />
        <span className="flex-1">All systems normal</span>
        <span className="mono">{location.pathname === "/" ? "v0.1" : ""}</span>
      </div>
    </aside>
  );
}
