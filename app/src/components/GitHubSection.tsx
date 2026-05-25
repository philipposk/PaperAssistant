import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { clearToken, getToken, setToken } from "../lib/github";
import { GitHubIcon } from "./GitHubIcon";

export function GitHubSection() {
  const [token, setLocal] = useState(getToken());
  const [show, setShow] = useState(false);
  const [saved, setSaved] = useState(false);

  function save() {
    setToken(token);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1500);
  }

  function clear() {
    clearToken();
    setLocal("");
    setSaved(false);
  }

  return (
    <section className="rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-[var(--color-surface)] p-5 mb-5">
      <div className="flex items-center gap-2 mb-1">
        <GitHubIcon size={16} className="text-[var(--color-ink-2)]" />
        <div className="serif text-lg">GitHub</div>
      </div>
      <p className="text-sm text-[var(--color-ink-3)] mb-3">
        Paste a fine-grained Personal Access Token with{" "}
        <span className="mono text-xs">repo</span> write scope. The token is
        kept only in this browser's localStorage. Used to push a project as a
        repo via "Push to GitHub" on a project page.
      </p>
      <div className="flex gap-2 mb-3">
        <div className="relative flex-1">
          <input
            type={show ? "text" : "password"}
            value={token}
            onChange={(e) => setLocal(e.target.value)}
            placeholder="github_pat_…"
            className="w-full px-3 py-2 pr-10 rounded-md border border-[var(--color-line)] bg-[var(--color-bg)] text-sm mono focus:outline-none focus:border-[var(--color-accent)]"
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? "Hide token" : "Show token"}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[var(--color-ink-3)] hover:text-[var(--color-ink)]"
          >
            {show ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>
        <button
          type="button"
          onClick={save}
          disabled={!token}
          className="px-3 py-2 rounded-md bg-[var(--color-accent)] text-[#f6f2ea] text-sm font-medium hover:bg-[var(--color-accent-2)] disabled:opacity-60"
        >
          {saved ? "Saved" : "Save"}
        </button>
        {getToken() && (
          <button
            type="button"
            onClick={clear}
            className="px-3 py-2 rounded-md border border-[var(--color-line)] text-sm hover:bg-[var(--color-surface-2)]"
          >
            Clear
          </button>
        )}
      </div>
      <div className="mono text-[11px] uppercase text-[var(--color-ink-3)]">
        Status:{" "}
        <span className={getToken() ? "text-[var(--color-green)]" : "text-[var(--color-amber)]"}>
          {getToken() ? "connected" : "not connected"}
        </span>
      </div>
    </section>
  );
}
