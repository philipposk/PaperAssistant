import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { Check, ChevronDown, Plus } from "lucide-react";
import { db } from "../lib/db";
import { useCurrentProject } from "../lib/currentProject";

export function ProjectPicker() {
  const { currentProject, setCurrentProjectId } = useCurrentProject();
  const projects = useLiveQuery(
    () => db.projects.orderBy("updated_at").reverse().toArray(),
    [],
  );
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  return (
    <div className="relative mx-3 mt-2 mb-1" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full px-3 py-2.5 rounded-md border border-[var(--color-line)] bg-[var(--color-surface-2)] hover:bg-[var(--color-line)] transition-colors flex items-center justify-between"
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-2 h-2 rounded-full bg-[var(--color-warm)] shrink-0" />
          <div className="min-w-0 text-left">
            <div className="mono uppercase text-[10px] tracking-wider text-[var(--color-ink-3)]">
              Current project
            </div>
            <div className="text-sm truncate">
              {currentProject?.name ?? "No project selected"}
            </div>
          </div>
        </div>
        <ChevronDown
          size={14}
          className={
            "text-[var(--color-ink-3)] transition-transform " +
            (open ? "rotate-180" : "")
          }
        />
      </button>

      {open && (
        <div className="absolute z-30 left-0 right-0 mt-2 rounded-md border border-[var(--color-line)] bg-[var(--color-surface)] shadow-lg overflow-hidden">
          <ul className="max-h-64 overflow-y-auto">
            {projects?.length ? (
              projects.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentProjectId(p.id);
                      setOpen(false);
                      navigate(`/projects/${p.id}`);
                    }}
                    className="w-full text-left px-3 py-2 text-sm flex items-center gap-2 hover:bg-[var(--color-surface-2)]"
                  >
                    <span className="w-4 shrink-0">
                      {currentProject?.id === p.id && (
                        <Check size={14} className="text-[var(--color-accent)]" />
                      )}
                    </span>
                    <span className="truncate flex-1">{p.name}</span>
                  </button>
                </li>
              ))
            ) : (
              <li className="px-3 py-3 text-sm text-[var(--color-ink-3)] text-center">
                No projects yet
              </li>
            )}
          </ul>
          <div className="border-t border-[var(--color-line)]">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                navigate("/projects");
              }}
              className="w-full px-3 py-2 text-sm flex items-center gap-2 hover:bg-[var(--color-surface-2)] text-[var(--color-accent)]"
            >
              <Plus size={14} />
              New project
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
