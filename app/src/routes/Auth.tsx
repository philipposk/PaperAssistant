import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { Loader2, Mail } from "lucide-react";
import { sendMagicLink, signInWithGoogle, useAuth } from "../lib/auth";

export function Auth() {
  const { isCloudConfigured, isSignedIn } = useAuth();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState<"" | "magic" | "google">("");
  const [err, setErr] = useState<string | null>(null);

  if (isSignedIn) return <Navigate to="/settings" replace />;

  async function magic(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy("magic");
    try {
      await sendMagicLink(email);
      setSent(true);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy("");
    }
  }

  async function google() {
    setErr(null);
    setBusy("google");
    try {
      await signInWithGoogle();
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
      setBusy("");
    }
  }

  return (
    <div className="max-w-md mx-auto px-8 py-16">
      <div className="mono uppercase text-[10px] tracking-wider text-[var(--color-warm)]">
        Sign in · optional
      </div>
      <h1 className="serif text-3xl mt-3 mb-4 leading-tight">
        Sync your workspace.
      </h1>
      <p className="text-[var(--color-ink-2)] mb-8 text-sm">
        PaperAssistant works fully offline. Sign in to back up your projects to
        the cloud and access them from any device.
      </p>

      {!isCloudConfigured && (
        <div className="rounded-md border border-[var(--color-line)] bg-[var(--color-surface-2)] p-4 text-sm text-[var(--color-ink-2)]">
          <strong>Cloud sync is not configured.</strong> The app owner needs to
          set <code className="mono text-xs">VITE_SUPABASE_URL</code> and{" "}
          <code className="mono text-xs">VITE_SUPABASE_ANON_KEY</code> env
          variables and redeploy. See{" "}
          <a href="https://github.com/philipposk/PaperAssistant/blob/main/DEPLOY.md" className="underline">
            DEPLOY.md
          </a>
          .
        </div>
      )}

      {isCloudConfigured && (
        <>
          {sent ? (
            <div className="rounded-md border border-[var(--color-green)] bg-[var(--color-surface)] p-5">
              <div className="serif text-lg mb-1">Check your inbox.</div>
              <p className="text-sm text-[var(--color-ink-2)]">
                A sign-in link was sent to <strong>{email}</strong>. Open it on
                this device to continue.
              </p>
            </div>
          ) : (
            <form onSubmit={magic} className="rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-[var(--color-surface)] p-5">
              <label
                htmlFor="email"
                className="mono uppercase text-[10px] tracking-wider text-[var(--color-ink-3)] block mb-2"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-3 py-2 rounded-md border border-[var(--color-line)] bg-[var(--color-bg)] text-sm focus:outline-none focus:border-[var(--color-accent)] mb-3"
              />
              <button
                type="submit"
                disabled={busy === "magic"}
                className="w-full px-4 py-2 rounded-md bg-[var(--color-accent)] text-[#f6f2ea] text-sm font-medium hover:bg-[var(--color-accent-2)] disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {busy === "magic" ? <Loader2 size={14} className="animate-spin" /> : <Mail size={14} />}
                Send magic link
              </button>

              <div className="flex items-center gap-3 my-4 text-xs text-[var(--color-ink-3)]">
                <span className="flex-1 h-px bg-[var(--color-line)]" />
                or
                <span className="flex-1 h-px bg-[var(--color-line)]" />
              </div>

              <button
                type="button"
                onClick={google}
                disabled={busy === "google"}
                className="w-full px-4 py-2 rounded-md border border-[var(--color-line)] hover:bg-[var(--color-surface-2)] text-sm flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {busy === "google" ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <svg width={14} height={14} viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.75h3.57c2.08-1.92 3.28-4.74 3.28-8.07z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.75c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.12A6.6 6.6 0 0 1 5.48 12c0-.74.13-1.45.36-2.12V7.04H2.18A11 11 0 0 0 1 12c0 1.77.43 3.45 1.18 4.96l3.66-2.84z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.07.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.04l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"
                    />
                  </svg>
                )}
                Continue with Google
              </button>

              {err && (
                <div className="mt-3 text-xs text-[var(--color-warm)]">{err}</div>
              )}
            </form>
          )}
          <Link
            to="/"
            className="block mt-4 text-sm text-[var(--color-ink-3)] hover:text-[var(--color-ink)]"
          >
            ← Keep using offline
          </Link>
        </>
      )}
    </div>
  );
}
