import { Link } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { FileText, Image as ImageIcon, Table as TableIcon, Wrench } from "lucide-react";
import { db } from "../lib/db";
import { useCurrentProject } from "../lib/currentProject";

function Stat({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-[var(--color-surface)] p-5">
      <div className="mono uppercase text-[10px] tracking-wider text-[var(--color-ink-3)]">
        {label}
      </div>
      <div className="serif text-4xl mt-2 mb-1">{value}</div>
      {sub && <div className="text-xs text-[var(--color-ink-3)]">{sub}</div>}
    </div>
  );
}

function QuickAccess({
  to,
  icon: Icon,
  label,
}: {
  to: string;
  icon: typeof FileText;
  label: string;
}) {
  return (
    <Link
      to={to}
      className="rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-[var(--color-surface)] p-5 hover:border-[var(--color-accent)] transition-colors block"
    >
      <Icon size={22} className="text-[var(--color-ink-3)] mb-3" strokeWidth={1.4} />
      <div className="text-sm font-medium">{label}</div>
    </Link>
  );
}

export function Dashboard() {
  const { currentProject } = useCurrentProject();
  const projectCount = useLiveQuery(() => db.projects.count(), []);
  const fileCount = useLiveQuery(
    () =>
      currentProject
        ? db.files.where("project_id").equals(currentProject.id).count()
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

  if (!currentProject) {
    return (
      <div className="max-w-2xl mx-auto px-8 py-16">
        <div className="mono uppercase text-[10px] tracking-wider text-[var(--color-warm)]">
          No project · welcome
        </div>
        <h1 className="serif text-4xl mt-3 mb-4 leading-tight">
          Start your research workspace.
        </h1>
        <p className="text-[var(--color-ink-2)] mb-8">
          PaperAssistant keeps your projects, files, figures, and drafts in one
          place. Works offline by default, syncs to the cloud when you sign in.
        </p>
        <div className="flex gap-3">
          <Link
            to="/projects"
            className="px-4 py-2.5 rounded-md bg-[var(--color-accent)] text-[#f6f2ea] text-sm font-medium hover:bg-[var(--color-accent-2)]"
          >
            Create your first project
          </Link>
          <Link
            to="/projects"
            className="px-4 py-2.5 rounded-md border border-[var(--color-line)] text-sm hover:bg-[var(--color-surface-2)]"
          >
            Browse projects ({projectCount ?? 0})
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="px-8 py-8 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-[var(--color-surface)] p-8">
          <div className="mono uppercase text-[10px] tracking-wider text-[var(--color-warm)]">
            {currentProject.name} · active
          </div>
          <h1 className="serif text-4xl mt-3 mb-4 leading-tight">
            {currentProject.description || currentProject.name}
          </h1>
          <div className="flex gap-3 mt-6">
            <Link
              to={`/projects/${currentProject.id}/files`}
              className="px-4 py-2 rounded-md bg-[var(--color-accent)] text-[#f6f2ea] text-sm font-medium hover:bg-[var(--color-accent-2)]"
            >
              Browse files
            </Link>
            <Link
              to={`/projects/${currentProject.id}/notes`}
              className="px-4 py-2 rounded-md border border-[var(--color-line)] text-sm hover:bg-[var(--color-surface-2)]"
            >
              Open notes
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Stat label="Files" value={fileCount ?? 0} />
          <Stat label="Figures" value={figCount ?? 0} />
          <Stat label="Tables" value={tableCount ?? 0} />
          <Stat label="Projects" value={projectCount ?? 0} />
        </div>
      </div>

      <h2 className="serif text-2xl mb-4">Quick access</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <QuickAccess
          to={`/projects/${currentProject.id}/files`}
          icon={FileText}
          label="Files"
        />
        <QuickAccess
          to={`/projects/${currentProject.id}/figures`}
          icon={ImageIcon}
          label="Figures"
        />
        <QuickAccess
          to={`/projects/${currentProject.id}/tables`}
          icon={TableIcon}
          label="Tables"
        />
        <QuickAccess to="/settings" icon={Wrench} label="Settings" />
      </div>
    </div>
  );
}
