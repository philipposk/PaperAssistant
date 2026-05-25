import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { Plus, Trash2 } from "lucide-react";
import { db, now, uid } from "../lib/db";
import { useCurrentProject } from "../lib/currentProject";

export function Projects() {
  const projects = useLiveQuery(
    () => db.projects.orderBy("updated_at").reverse().toArray(),
    [],
  );
  const { currentProjectId, setCurrentProjectId } = useCurrentProject();
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const navigate = useNavigate();

  async function createProject() {
    if (!name.trim()) return;
    const id = uid();
    const t = now();
    await db.projects.add({
      id,
      name: name.trim(),
      description: description.trim() || undefined,
      created_at: t,
      updated_at: t,
    });
    setCurrentProjectId(id);
    setName("");
    setDescription("");
    setCreating(false);
    navigate(`/projects/${id}`);
  }

  async function deleteProject(id: string) {
    if (!confirm("Delete this project and all its files?")) return;
    await db.transaction("rw", db.projects, db.files, db.notes, async () => {
      await db.files.where("project_id").equals(id).delete();
      await db.notes.where("project_id").equals(id).delete();
      await db.projects.delete(id);
    });
    if (currentProjectId === id) setCurrentProjectId(null);
  }

  return (
    <div className="px-8 py-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="serif text-3xl">Projects</h1>
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="px-3 py-2 rounded-md bg-[var(--color-accent)] text-[#f6f2ea] text-sm font-medium hover:bg-[var(--color-accent-2)] flex items-center gap-2"
        >
          <Plus size={14} /> New project
        </button>
      </div>

      {creating && (
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-[var(--color-surface)] p-5 mb-5">
          <div className="mono uppercase text-[10px] tracking-wider text-[var(--color-ink-3)] mb-3">
            New project
          </div>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Project name"
            className="w-full px-3 py-2 rounded-md border border-[var(--color-line)] bg-[var(--color-bg)] text-sm focus:outline-none focus:border-[var(--color-accent)] mb-3"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)"
            rows={2}
            className="w-full px-3 py-2 rounded-md border border-[var(--color-line)] bg-[var(--color-bg)] text-sm focus:outline-none focus:border-[var(--color-accent)] mb-3"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={createProject}
              className="px-3 py-1.5 rounded-md bg-[var(--color-accent)] text-[#f6f2ea] text-sm hover:bg-[var(--color-accent-2)]"
            >
              Create
            </button>
            <button
              type="button"
              onClick={() => {
                setCreating(false);
                setName("");
                setDescription("");
              }}
              className="px-3 py-1.5 rounded-md border border-[var(--color-line)] text-sm hover:bg-[var(--color-surface-2)]"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {projects && projects.length === 0 && !creating && (
        <div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--color-line-2)] p-12 text-center">
          <div className="serif text-xl mb-2">No projects yet.</div>
          <p className="text-sm text-[var(--color-ink-3)] mb-4">
            Create your first research project to get started.
          </p>
          <button
            type="button"
            onClick={() => setCreating(true)}
            className="px-3 py-2 rounded-md bg-[var(--color-accent)] text-[#f6f2ea] text-sm font-medium hover:bg-[var(--color-accent-2)]"
          >
            Create project
          </button>
        </div>
      )}

      <ul className="space-y-2">
        {projects?.map((p) => (
          <li
            key={p.id}
            className="rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-[var(--color-surface)] hover:border-[var(--color-accent)] transition-colors"
          >
            <div className="flex items-center px-5 py-4 gap-4">
              <button
                type="button"
                onClick={() => setCurrentProjectId(p.id)}
                aria-label="Select project"
                className={
                  "w-3 h-3 rounded-full shrink-0 " +
                  (currentProjectId === p.id
                    ? "bg-[var(--color-warm)]"
                    : "bg-[var(--color-line-2)] hover:bg-[var(--color-warm)]")
                }
              />
              <Link to={`/projects/${p.id}`} className="flex-1 min-w-0">
                <div className="serif text-lg leading-tight">{p.name}</div>
                {p.description && (
                  <div className="text-sm text-[var(--color-ink-3)] truncate">
                    {p.description}
                  </div>
                )}
              </Link>
              <button
                type="button"
                onClick={() => deleteProject(p.id)}
                aria-label="Delete project"
                className="text-[var(--color-ink-4)] hover:text-[var(--color-warm)] p-1"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
