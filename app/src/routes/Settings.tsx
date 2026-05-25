import { useTheme } from "../lib/theme";
import { isCloudConfigured } from "../lib/supabase";

export function Settings() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="px-8 py-8 max-w-3xl mx-auto">
      <h1 className="serif text-3xl mb-8">Settings</h1>

      <section className="rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-[var(--color-surface)] p-5 mb-5">
        <div className="serif text-lg mb-1">Appearance</div>
        <p className="text-sm text-[var(--color-ink-3)] mb-4">
          Choose how PaperAssistant looks on this device.
        </p>
        <div className="flex gap-2">
          {(["light", "dark"] as const).map((t) => (
            <button
              type="button"
              key={t}
              onClick={() => setTheme(t)}
              className={
                "px-4 py-2 rounded-md border text-sm capitalize " +
                (theme === t
                  ? "border-[var(--color-accent)] bg-[var(--color-accent-soft)]"
                  : "border-[var(--color-line)] hover:bg-[var(--color-surface-2)]")
              }
            >
              {t}
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-[var(--color-surface)] p-5 mb-5">
        <div className="serif text-lg mb-1">Cloud sync</div>
        <p className="text-sm text-[var(--color-ink-3)] mb-3">
          {isCloudConfigured
            ? "Supabase is configured. Sign in to sync projects across devices."
            : "Cloud sync is not configured yet. The app works fully offline; your data lives in this browser."}
        </p>
        <div className="mono text-[11px] uppercase text-[var(--color-ink-3)]">
          Status:{" "}
          <span
            className={
              isCloudConfigured ? "text-[var(--color-green)]" : "text-[var(--color-amber)]"
            }
          >
            {isCloudConfigured ? "ready" : "local-only"}
          </span>
        </div>
      </section>

      <section className="rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-[var(--color-surface)] p-5">
        <div className="serif text-lg mb-1">About</div>
        <p className="text-sm text-[var(--color-ink-3)]">
          PaperAssistant v0.1 · React + Vite + Dexie + Supabase
        </p>
      </section>
    </div>
  );
}
