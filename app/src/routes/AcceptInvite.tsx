import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { CheckCircle2, Loader2, ShieldAlert } from "lucide-react";
import { useAuth } from "../lib/auth";
import { acceptInvite, fetchInviteByToken, type Invite } from "../lib/sharing";

export function AcceptInvite() {
  const { token = "" } = useParams();
  const { isCloudConfigured, isSignedIn, loading } = useAuth();
  const navigate = useNavigate();
  const [invite, setInvite] = useState<Invite | null>(null);
  const [status, setStatus] = useState<
    "idle" | "fetching" | "accepting" | "accepted" | "error"
  >("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (loading || !isCloudConfigured || !isSignedIn || !token) return;
    setStatus("fetching");
    void fetchInviteByToken(token).then((inv) => {
      if (!inv) {
        setError("Invite not found or expired.");
        setStatus("error");
        return;
      }
      setInvite(inv);
      setStatus("idle");
    });
  }, [loading, isCloudConfigured, isSignedIn, token]);

  async function accept() {
    setStatus("accepting");
    setError(null);
    try {
      const { projectId } = await acceptInvite(token);
      setStatus("accepted");
      setTimeout(() => navigate(`/projects/${projectId}`), 800);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setStatus("error");
    }
  }

  if (!isCloudConfigured) {
    return (
      <div className="max-w-md mx-auto px-8 py-16 text-center">
        <ShieldAlert
          size={28}
          className="mx-auto text-[var(--color-warm)] mb-3"
        />
        <h1 className="serif text-2xl mb-2">Cloud sync isn't configured.</h1>
        <p className="text-sm text-[var(--color-ink-3)]">
          Project invites require Supabase. This app hasn't been wired to a
          backend yet.
        </p>
      </div>
    );
  }

  if (!isSignedIn) {
    return <Navigate to={`/auth?next=${encodeURIComponent(`/accept/${token}`)}`} replace />;
  }

  return (
    <div className="max-w-md mx-auto px-8 py-16">
      <div className="mono uppercase text-[10px] tracking-wider text-[var(--color-warm)]">
        Project invite
      </div>
      <h1 className="serif text-3xl mt-3 mb-4">Join a research project</h1>

      {(status === "fetching" || loading) && (
        <div className="flex items-center gap-2 text-sm text-[var(--color-ink-3)]">
          <Loader2 size={16} className="animate-spin" />
          Looking up invite…
        </div>
      )}

      {status === "error" && (
        <div className="rounded-md border border-[var(--color-warm)] bg-[var(--color-warm-soft)] p-4 text-sm text-[var(--color-warm)]">
          {error ?? "Something went wrong."}
        </div>
      )}

      {status === "accepted" && (
        <div className="flex items-center gap-2 text-sm text-[var(--color-green)]">
          <CheckCircle2 size={16} />
          Added you to the project. Redirecting…
        </div>
      )}

      {invite && status !== "accepted" && status !== "error" && (
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-[var(--color-surface)] p-5">
          <p className="text-sm text-[var(--color-ink-2)] mb-4">
            You've been invited as a <strong>{invite.role}</strong>. Accepting
            adds this project to your workspace.
          </p>
          <button
            type="button"
            onClick={accept}
            disabled={status === "accepting"}
            className="px-4 py-2 rounded-md bg-[var(--color-accent)] text-[#f6f2ea] text-sm font-medium hover:bg-[var(--color-accent-2)] disabled:opacity-60 flex items-center gap-2"
          >
            {status === "accepting" && (
              <Loader2 size={14} className="animate-spin" />
            )}
            Accept invite
          </button>
        </div>
      )}

      <Link
        to="/"
        className="block mt-6 text-sm text-[var(--color-ink-3)] hover:text-[var(--color-ink)]"
      >
        ← Back to workspace
      </Link>
    </div>
  );
}
