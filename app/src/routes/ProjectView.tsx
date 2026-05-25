import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { FileText, Image as ImageIcon, StickyNote, Table as TableIcon } from "lucide-react";
import { db } from "../lib/db";
import { useCurrentProject } from "../lib/currentProject";

export function ProjectView() {
  const { id = "" } = useParams();
  const { setCurrentProjectId } = useCurrentProject();
  const project = useLiveQuery(() => db.projects.get(id), [id]);
  const files = useLiveQuery(
    () => db.files.where("project_id").equals(id).toArray(),
    [id],
  );

  useEffect(() => {
    if (id) setCurrentProjectId(id);
  }, [id, setCurrentProjectId]);

  if (!project) {
    return (
      <div className="px-8 py-16 max-w-3xl mx-auto text-center">
        <h1 className="serif text-2xl mb-2">Project not found.</h1>
        <Link to="/projects" className="text-[var(--color-accent)] underline text-sm">
          Back to all projects
        </Link>
      </div>
    );
  }

  const figures = files?.filter((f) => f.mime.startsWith("image/")) ?? [];
  const tables =
    files?.filter((f) => f.mime === "text/csv" || f.name.endsWith(".csv")) ?? [];

  return (
    <div className="px-12 py-12 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="mono uppercase text-[10px] tracking-wider text-[var(--color-warm)]">
          Active project · {project.name}
        </div>
        <h1 className="serif text-3xl mt-3 mb-4 leading-tight">
          {project.description || project.name}
        </h1>
      </div>

      <div className="border-t border-b border-[var(--color-line)] py-4 flex items-center justify-center gap-8 text-sm mb-12">
        <div>
          <span className="text-[var(--color-ink-3)]">Files</span>{" "}
          <span className="font-medium">{files?.length ?? 0}</span>
        </div>
        <div>
          <span className="text-[var(--color-ink-3)]">Status</span>{" "}
          <span className="font-medium">In progress</span>
        </div>
        <div>
          <span className="text-[var(--color-ink-3)]">Updated</span>{" "}
          <span className="font-medium">
            {new Date(project.updated_at).toLocaleDateString()}
          </span>
        </div>
      </div>

      <h2 className="serif text-xl mb-4">
        <span className="text-[var(--color-warm)] mono mr-2">§ 1</span>
        Contents of this workspace
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
        <Link
          to={`/projects/${id}/files`}
          className="rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-[var(--color-surface)] p-5 hover:border-[var(--color-accent)]"
        >
          <FileText size={18} className="text-[var(--color-ink-3)] mb-2" strokeWidth={1.4} />
          <div className="serif text-lg">Files</div>
          <div className="text-sm text-[var(--color-ink-3)]">
            Upload + browse · {files?.length ?? 0} items
          </div>
        </Link>
        <Link
          to={`/projects/${id}/figures`}
          className="rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-[var(--color-surface)] p-5 hover:border-[var(--color-accent)]"
        >
          <ImageIcon size={18} className="text-[var(--color-ink-3)] mb-2" strokeWidth={1.4} />
          <div className="serif text-lg">Figures</div>
          <div className="text-sm text-[var(--color-ink-3)]">
            Image gallery · {figures.length} items
          </div>
        </Link>
        <Link
          to={`/projects/${id}/tables`}
          className="rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-[var(--color-surface)] p-5 hover:border-[var(--color-accent)]"
        >
          <TableIcon size={18} className="text-[var(--color-ink-3)] mb-2" strokeWidth={1.4} />
          <div className="serif text-lg">Tables</div>
          <div className="text-sm text-[var(--color-ink-3)]">
            CSV viewer · {tables.length} items
          </div>
        </Link>
        <Link
          to={`/projects/${id}/notes`}
          className="rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-[var(--color-surface)] p-5 hover:border-[var(--color-accent)]"
        >
          <StickyNote size={18} className="text-[var(--color-ink-3)] mb-2" strokeWidth={1.4} />
          <div className="serif text-lg">Notes</div>
          <div className="text-sm text-[var(--color-ink-3)]">
            Markdown drafts
          </div>
        </Link>
      </div>
    </div>
  );
}
