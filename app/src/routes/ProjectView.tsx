import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../lib/db";
import { useCurrentProject } from "../lib/currentProject";
import { PushToGitHubButton } from "../components/PushToGitHubButton";
import { ShareSection } from "../components/ShareSection";

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

  return (
    <div className="px-12 py-12 max-w-4xl mx-auto">
      <div className="text-center mb-8 relative">
        <div className="mono uppercase text-[10px] tracking-wider text-[var(--color-warm)]">
          Active project · {project.name}
          {project.is_demo && (
            <span className="ml-2 text-[var(--color-ink-3)]">· example</span>
          )}
        </div>
        <h1 className="serif text-3xl mt-3 mb-4 leading-tight">
          {project.description || project.name}
        </h1>
        <div className="flex justify-center">
          <PushToGitHubButton project={project} />
        </div>
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

      <ShareSection projectId={id} />

      <h2 className="serif text-xl mb-4">
        <span className="text-[var(--color-warm)] mono mr-2">§ 1</span>
        Workspace areas
      </h2>
      <ul className="space-y-2 mb-10 text-sm">
        <li>
          <Link to={`/projects/${id}/files`} className="text-[var(--color-accent)] hover:underline">
            Files
          </Link>
          <span className="text-[var(--color-ink-3)]"> — uploads, PDFs, code, data</span>
        </li>
        <li>
          <Link to={`/projects/${id}/figures`} className="text-[var(--color-accent)] hover:underline">
            Figures
          </Link>
          <span className="text-[var(--color-ink-3)]"> — image gallery and export order</span>
        </li>
        <li>
          <Link to={`/projects/${id}/tables`} className="text-[var(--color-accent)] hover:underline">
            Tables
          </Link>
          <span className="text-[var(--color-ink-3)]"> — CSV data tables</span>
        </li>
        <li>
          <Link to={`/projects/${id}/notes`} className="text-[var(--color-accent)] hover:underline">
            Manuscript
          </Link>
          <span className="text-[var(--color-ink-3)]"> — draft sections merged on export</span>
        </li>
        <li>
          <Link to={`/projects/${id}/references`} className="text-[var(--color-accent)] hover:underline">
            References
          </Link>
          <span className="text-[var(--color-ink-3)]"> — citations and bibliography styles</span>
        </li>
        <li>
          <Link to={`/projects/${id}/graph`} className="text-[var(--color-accent)] hover:underline">
            Citation graph
          </Link>
          <span className="text-[var(--color-ink-3)]"> — Semantic Scholar network</span>
        </li>
      </ul>
    </div>
  );
}
