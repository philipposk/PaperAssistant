import { useEffect, useState } from "react";
import { ClipboardCopy, Loader2, ShieldOff, UserPlus, X } from "lucide-react";
import {
  createInvite,
  inviteUrl,
  listInvites,
  listMembers,
  removeMember,
  revokeInvite,
  type Invite,
  type Member,
  type Role,
} from "../lib/sharing";
import { useAuth } from "../lib/auth";

export function ShareSection({ projectId }: { projectId: string }) {
  const { isCloudConfigured, isSignedIn } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Exclude<Role, "owner">>("editor");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  async function refresh() {
    const [m, i] = await Promise.all([listMembers(projectId), listInvites(projectId)]);
    setMembers(m);
    setInvites(i);
  }

  useEffect(() => {
    if (!isCloudConfigured || !isSignedIn) return;
    void refresh();
  }, [projectId, isCloudConfigured, isSignedIn]);

  async function invite() {
    if (!email.trim()) return;
    setBusy(true);
    setErr(null);
    try {
      const inv = await createInvite(projectId, email, role);
      setEmail("");
      setInvites((arr) => [inv, ...arr]);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  async function copy(token: string) {
    const url = inviteUrl(token);
    await navigator.clipboard.writeText(url);
    setCopied(token);
    setTimeout(() => setCopied(null), 1500);
  }

  async function dropInvite(id: string) {
    await revokeInvite(id);
    setInvites((arr) => arr.filter((i) => i.id !== id));
  }

  async function dropMember(id: string) {
    if (!confirm("Remove this member?")) return;
    await removeMember(id);
    setMembers((arr) => arr.filter((m) => m.id !== id));
  }

  if (!isCloudConfigured) {
    return (
      <section className="rounded-[var(--radius-lg)] border border-dashed border-[var(--color-line-2)] p-5 mb-5 text-center text-sm text-[var(--color-ink-3)]">
        <ShieldOff size={16} className="inline mr-2" />
        Sharing requires Supabase. Configure cloud sync to invite co-authors.
      </section>
    );
  }
  if (!isSignedIn) {
    return (
      <section className="rounded-[var(--radius-lg)] border border-dashed border-[var(--color-line-2)] p-5 mb-5 text-center text-sm text-[var(--color-ink-3)]">
        Sign in to invite co-authors to this project.
      </section>
    );
  }

  return (
    <section className="rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-[var(--color-surface)] p-5 mb-5 text-left">
      <div className="serif text-lg mb-1">Members</div>
      <p className="text-sm text-[var(--color-ink-3)] mb-3">
        Owners + editors can write; viewers read only.
      </p>
      <ul className="mb-4 divide-y divide-[var(--color-line)] border border-[var(--color-line)] rounded-md">
        {members.length === 0 ? (
          <li className="px-3 py-2 text-xs text-[var(--color-ink-3)]">
            Loading…
          </li>
        ) : (
          members.map((m) => (
            <li
              key={m.id}
              className="flex items-center px-3 py-2 gap-3 text-sm"
            >
              <span className="mono text-[10px] uppercase text-[var(--color-ink-3)] w-14 shrink-0">
                {m.role}
              </span>
              <span className="flex-1 truncate mono text-xs">{m.user_id}</span>
              {m.role !== "owner" && (
                <button
                  type="button"
                  onClick={() => dropMember(m.id)}
                  className="text-[var(--color-ink-4)] hover:text-[var(--color-warm)]"
                  aria-label="Remove member"
                >
                  <X size={14} />
                </button>
              )}
            </li>
          ))
        )}
      </ul>

      <div className="flex gap-2 mb-3">
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          placeholder="co-author@university.edu"
          className="flex-1 px-3 py-2 rounded-md border border-[var(--color-line)] bg-[var(--color-bg)] text-sm focus:outline-none focus:border-[var(--color-accent)]"
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as Exclude<Role, "owner">)}
          className="px-2 py-2 rounded-md border border-[var(--color-line)] bg-[var(--color-bg)] text-sm focus:outline-none"
        >
          <option value="editor">Editor</option>
          <option value="viewer">Viewer</option>
        </select>
        <button
          type="button"
          onClick={invite}
          disabled={busy || !email.trim()}
          className="px-3 py-2 rounded-md bg-[var(--color-accent)] text-[#f6f2ea] text-sm font-medium hover:bg-[var(--color-accent-2)] disabled:opacity-60 flex items-center gap-2"
        >
          {busy ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />}
          Invite
        </button>
      </div>
      {err && <div className="text-xs text-[var(--color-warm)] mb-3">{err}</div>}

      {invites.length > 0 && (
        <>
          <div className="mono uppercase text-[10px] tracking-wider text-[var(--color-ink-3)] mb-2">
            Pending invites
          </div>
          <ul className="divide-y divide-[var(--color-line)] border border-[var(--color-line)] rounded-md">
            {invites.map((i) => (
              <li key={i.id} className="flex items-center px-3 py-2 gap-3 text-sm">
                <div className="flex-1 min-w-0">
                  <div className="truncate">{i.email}</div>
                  <div className="mono text-[10px] text-[var(--color-ink-3)]">
                    {i.role} · expires {new Date(i.expires_at).toLocaleDateString()}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => copy(i.token)}
                  className="text-[var(--color-ink-3)] hover:text-[var(--color-accent)]"
                  aria-label="Copy invite link"
                >
                  <ClipboardCopy size={14} />
                  {copied === i.token && (
                    <span className="ml-1 text-[10px] text-[var(--color-green)]">
                      copied
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => dropInvite(i.id)}
                  className="text-[var(--color-ink-4)] hover:text-[var(--color-warm)]"
                  aria-label="Revoke invite"
                >
                  <X size={14} />
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
