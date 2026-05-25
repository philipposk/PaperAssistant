import { Link } from "react-router-dom";
import { useTheme } from "../lib/theme";
import { signOut, useAuth } from "../lib/auth";

export function Settings() {
  const { theme, setTheme } = useTheme();
  const { isCloudConfigured, isSignedIn, user } = useAuth();

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
        {!isCloudConfigured && (
          <>
            <p className="text-sm text-[var(--color-ink-3)] mb-3">
              Cloud sync is not configured yet. The app works fully offline; your data lives in this browser.
            </p>
            <div className="mono text-[11px] uppercase text-[var(--color-ink-3)]">
              Status: <span className="text-[var(--color-amber)]">local-only</span>
            </div>
          </>
        )}
        {isCloudConfigured && !isSignedIn && (
          <>
            <p className="text-sm text-[var(--color-ink-3)] mb-3">
              Supabase is configured. Sign in to back up projects to the cloud and access them from any device.
            </p>
            <Link
              to="/auth"
              className="inline-block px-4 py-2 rounded-md bg-[var(--color-accent)] text-[#f6f2ea] text-sm font-medium hover:bg-[var(--color-accent-2)]"
            >
              Sign in
            </Link>
          </>
        )}
        {isCloudConfigured && isSignedIn && (
          <>
            <p className="text-sm text-[var(--color-ink-3)] mb-3">
              Signed in as <strong>{user?.email ?? user?.user_metadata?.name}</strong>.
              Your projects sync across devices.
            </p>
            <div className="mono text-[11px] uppercase text-[var(--color-ink-3)] mb-3">
              Status: <span className="text-[var(--color-green)]">syncing</span>
            </div>
            <button
              type="button"
              onClick={() => void signOut()}
              className="px-4 py-2 rounded-md border border-[var(--color-line)] text-sm hover:bg-[var(--color-surface-2)]"
            >
              Sign out
            </button>
          </>
        )}
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
