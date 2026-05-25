import { Link } from "react-router-dom";
import { LogIn, LogOut, UserCircle2 } from "lucide-react";
import { signOut, useAuth } from "../lib/auth";

export function AccountWidget() {
  const { isCloudConfigured, isSignedIn, user } = useAuth();

  if (!isCloudConfigured) {
    return (
      <div className="mx-3 mb-3 px-3 py-2 rounded-md border border-dashed border-[var(--color-line-2)] text-[11px] text-[var(--color-ink-3)] text-center">
        Cloud sync not configured
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <Link
        to="/auth"
        className="mx-3 mb-3 px-3 py-2.5 rounded-md border border-[var(--color-line)] hover:bg-[var(--color-surface-2)] text-sm flex items-center gap-2"
      >
        <LogIn size={14} />
        Sign in to sync
      </Link>
    );
  }

  const name = user?.user_metadata?.name ?? user?.email ?? "Signed in";
  const email = user?.email;

  return (
    <div className="mx-3 mb-3 px-3 py-2.5 rounded-md border border-[var(--color-line)] flex items-center gap-2">
      <UserCircle2 size={18} className="text-[var(--color-ink-3)] shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="text-sm truncate">{name}</div>
        {email && email !== name && (
          <div className="mono text-[10px] text-[var(--color-ink-3)] truncate">
            {email}
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={() => void signOut()}
        aria-label="Sign out"
        className="text-[var(--color-ink-4)] hover:text-[var(--color-warm)] p-1"
      >
        <LogOut size={14} />
      </button>
    </div>
  );
}
