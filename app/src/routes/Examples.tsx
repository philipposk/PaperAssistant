import { useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Loader2, RefreshCw, Trash2 } from "lucide-react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../lib/db";
import {
  clearAllDemoProjects,
  DEMO_CATALOG,
  ensureDemoProjects,
  reloadDemoProject,
  type DemoProjectId,
} from "../lib/demoSeed";
import { useCurrentProject } from "../lib/currentProject";

export function Examples() {
  const [busy, setBusy] = useState("");
  const { setCurrentProjectId } = useCurrentProject();
  const demos = useLiveQuery(
    () =>
      db.projects
        .filter((p) => p.is_demo === true)
        .toArray(),
    [],
  );

  async function loadDemos() {
    setBusy("load");
    try {
      await ensureDemoProjects();
    } finally {
      setBusy("");
    }
  }

  async function clearDemos() {
    if (
      !confirm(
        "Remove all example projects from this device? Your own projects are kept.",
      )
    ) {
      return;
    }
    setBusy("clear");
    try {
      await clearAllDemoProjects();
    } finally {
      setBusy("");
    }
  }

  async function resetOne(id: DemoProjectId) {
    setBusy(id);
    try {
      await reloadDemoProject(id);
    } finally {
      setBusy("");
    }
  }

  const loaded = demos ?? [];

  return (
    <div className="px-8 py-8 max-w-4xl mx-auto">
      <h1 className="serif text-3xl mb-2">Examples</h1>
      <p className="text-[var(--color-ink-2)] mb-6 max-w-2xl">
        Three fully populated demo projects ship with PaperAssistant — figures,
        tables, references (with live DOI links), manuscript drafts, PDFs, and
        appendix code. Open one to explore; clear them when you are ready to
        work on your own.
      </p>

      <div className="flex flex-wrap gap-3 mb-8">
        <button
          type="button"
          onClick={() => void loadDemos()}
          disabled={!!busy}
          className="px-4 py-2 rounded-md bg-[var(--color-accent)] text-[#f6f2ea] text-sm font-medium hover:bg-[var(--color-accent-2)] disabled:opacity-60 flex items-center gap-2"
        >
          {busy === "load" ? <Loader2 size={14} className="animate-spin" /> : <BookOpen size={14} />}
          {loaded.length ? "Refresh examples" : "Load examples"}
        </button>
        {loaded.length > 0 && (
          <button
            type="button"
            onClick={() => void clearDemos()}
            disabled={!!busy}
            className="px-4 py-2 rounded-md border border-[var(--color-line)] text-sm hover:bg-[var(--color-surface-2)] disabled:opacity-60 flex items-center gap-2"
          >
            {busy === "clear" ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
            Clear demo data
          </button>
        )}
      </div>

      <div className="space-y-4">
        {DEMO_CATALOG.map((meta) => {
          const project = loaded.find((p) => p.id === meta.id);
          return (
            <article
              key={meta.id}
              className="rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-[var(--color-surface)] p-5"
            >
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div
                    className="mono text-[10px] uppercase tracking-wider mb-1"
                    style={{ color: meta.color }}
                  >
                    Example · demo
                  </div>
                  <h2 className="serif text-xl">{meta.name}</h2>
                  <p className="text-sm text-[var(--color-ink-2)] mt-1">{meta.blurb}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  {project ? (
                    <>
                      <Link
                        to={`/projects/${meta.id}`}
                        onClick={() => setCurrentProjectId(meta.id)}
                        className="px-3 py-2 rounded-md bg-[var(--color-accent)] text-[#f6f2ea] text-sm font-medium hover:bg-[var(--color-accent-2)]"
                      >
                        Open
                      </Link>
                      <button
                        type="button"
                        onClick={() => void resetOne(meta.id)}
                        disabled={!!busy}
                        className="px-3 py-2 rounded-md border border-[var(--color-line)] text-sm hover:bg-[var(--color-surface-2)] flex items-center gap-1"
                        title="Reset to factory demo content"
                      >
                        <RefreshCw size={14} className={busy === meta.id ? "animate-spin" : ""} />
                        Reset
                      </button>
                    </>
                  ) : (
                    <span className="text-xs text-[var(--color-ink-3)] py-2">
                      Not loaded — click Load examples
                    </span>
                  )}
                </div>
              </div>
              {project && (
                <p className="mt-3 text-xs text-[var(--color-ink-3)]">
                  Includes manuscript, 8+ figures, 8+ tables, 12 references with
                  DOIs (try the citation graph), PDFs, and appendix code.
                </p>
              )}
            </article>
          );
        })}
      </div>

      <section className="mt-10 rounded-[var(--radius-lg)] border border-dashed border-[var(--color-line-2)] p-6 text-sm text-[var(--color-ink-2)]">
        <h3 className="serif text-lg mb-2 text-[var(--color-ink-1)]">Citation graph</h3>
        <p>
          Open any example → <strong>Citation graph</strong> in the sidebar.
          References with DOIs are sent to Semantic Scholar; the graph shows what
          your papers cite (outgoing) and what cites them (incoming). Orange nodes
          are in your project; click any node to open the paper online.
        </p>
      </section>
    </div>
  );
}
