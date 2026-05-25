import { useState } from "react";
import { ExternalLink, Loader2 } from "lucide-react";
import type { Project } from "../lib/db";
import { getToken } from "../lib/github";
import { GitHubIcon } from "./GitHubIcon";

interface State {
  status: "idle" | "pushing" | "success" | "error";
  message?: string;
  url?: string;
}

export function PushToGitHubButton({ project }: { project: Project }) {
  const [state, setState] = useState<State>({ status: "idle" });
  const [open, setOpen] = useState(false);
  const [repoName, setRepoName] = useState("");
  const [isPrivate, setIsPrivate] = useState(true);

  async function push() {
    setState({ status: "pushing" });
    try {
      const { pushProjectToGitHub } = await import("../lib/github");
      const result = await pushProjectToGitHub(project, {
        repoName: repoName.trim() || undefined,
        isPrivate,
      });
      setState({
        status: "success",
        message: `Pushed ${result.fileCount} files.`,
        url: result.repoUrl,
      });
    } catch (e) {
      setState({
        status: "error",
        message: e instanceof Error ? e.message : String(e),
      });
    }
  }

  if (!getToken()) {
    return (
      <a
        href="/settings"
        className="px-3 py-2 rounded-md border border-[var(--color-line)] text-sm hover:bg-[var(--color-surface-2)] inline-flex items-center gap-2"
        title="Configure a GitHub token in Settings"
      >
        <GitHubIcon size={14} /> Push to GitHub
      </a>
    );
  }

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="px-3 py-2 rounded-md border border-[var(--color-line)] hover:bg-[var(--color-surface-2)] text-sm flex items-center gap-2"
      >
        <GitHubIcon size={14} /> Push to GitHub
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 z-20 rounded-md border border-[var(--color-line)] bg-[var(--color-surface)] shadow-lg p-4">
          <div className="mono uppercase text-[10px] tracking-wider text-[var(--color-ink-3)] mb-2">
            Push to GitHub
          </div>
          <label className="text-xs text-[var(--color-ink-3)] block mb-1">Repo name</label>
          <input
            value={repoName}
            onChange={(e) => setRepoName(e.target.value)}
            placeholder={project.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 50)}
            className="w-full px-2 py-1.5 rounded-md border border-[var(--color-line)] bg-[var(--color-bg)] text-sm mb-3 focus:outline-none focus:border-[var(--color-accent)]"
          />
          <label className="flex items-center gap-2 text-sm mb-3">
            <input
              type="checkbox"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
            />
            Private repo
          </label>
          <button
            type="button"
            onClick={push}
            disabled={state.status === "pushing"}
            className="w-full px-3 py-2 rounded-md bg-[var(--color-accent)] text-[#f6f2ea] text-sm font-medium hover:bg-[var(--color-accent-2)] disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {state.status === "pushing" ? (
              <>
                <Loader2 size={14} className="animate-spin" /> Pushing…
              </>
            ) : (
              <>
                <GitHubIcon size={14} /> Push
              </>
            )}
          </button>
          {state.status === "success" && state.url && (
            <div className="mt-3 text-xs text-[var(--color-green)]">
              {state.message}
              <a
                href={state.url}
                target="_blank"
                rel="noreferrer"
                className="ml-1 inline-flex items-center gap-1 underline"
              >
                Open repo <ExternalLink size={10} />
              </a>
            </div>
          )}
          {state.status === "error" && (
            <div className="mt-3 text-xs text-[var(--color-warm)]">{state.message}</div>
          )}
        </div>
      )}
    </div>
  );
}
