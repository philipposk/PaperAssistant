// Sharing: invite-by-email project members + accept-by-token flow.
// All operations no-op gracefully if cloud isn't configured or the user
// is anonymous. RLS in 0005_sharing.sql does the actual gatekeeping.

import { supabase } from "./supabase";
import { useAuthStore } from "./auth";

export type Role = "owner" | "editor" | "viewer";

export interface Member {
  id: string;
  project_id: string;
  user_id: string;
  role: Role;
  created_at: string;
  email?: string;
}

export interface Invite {
  id: string;
  project_id: string;
  email: string;
  role: Role;
  token: string;
  invited_by: string;
  expires_at: string;
  accepted_at: string | null;
  accepted_by: string | null;
  created_at: string;
}

function active(): boolean {
  return Boolean(supabase) && Boolean(useAuthStore.getState().user);
}

function generateToken(): string {
  const arr = new Uint8Array(24);
  crypto.getRandomValues(arr);
  return Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join("");
}

export async function listMembers(projectId: string): Promise<Member[]> {
  if (!active() || !supabase) return [];
  const { data, error } = await supabase
    .from("project_members")
    .select("*")
    .eq("project_id", projectId);
  if (error) {
    console.warn("[sharing] listMembers failed", error.message);
    return [];
  }
  return (data ?? []) as Member[];
}

export async function listInvites(projectId: string): Promise<Invite[]> {
  if (!active() || !supabase) return [];
  const { data, error } = await supabase
    .from("project_invites")
    .select("*")
    .eq("project_id", projectId)
    .is("accepted_at", null);
  if (error) {
    console.warn("[sharing] listInvites failed", error.message);
    return [];
  }
  return (data ?? []) as Invite[];
}

export async function createInvite(
  projectId: string,
  email: string,
  role: Exclude<Role, "owner">,
): Promise<Invite> {
  if (!active() || !supabase) throw new Error("Sign in to share projects.");
  const uid = useAuthStore.getState().user!.id;
  const token = generateToken();
  const { data, error } = await supabase
    .from("project_invites")
    .insert({
      project_id: projectId,
      email: email.toLowerCase().trim(),
      role,
      token,
      invited_by: uid,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Invite;
}

export async function revokeInvite(inviteId: string): Promise<void> {
  if (!active() || !supabase) return;
  const { error } = await supabase
    .from("project_invites")
    .delete()
    .eq("id", inviteId);
  if (error) console.warn("[sharing] revokeInvite failed", error.message);
}

export async function fetchInviteByToken(token: string): Promise<Invite | null> {
  if (!active() || !supabase) return null;
  const { data, error } = await supabase
    .from("project_invites")
    .select("*")
    .eq("token", token)
    .maybeSingle();
  if (error) {
    console.warn("[sharing] fetchInviteByToken failed", error.message);
    return null;
  }
  return (data as Invite | null) ?? null;
}

export async function acceptInvite(
  token: string,
): Promise<{ projectId: string }> {
  if (!active() || !supabase) throw new Error("Sign in to accept invites.");
  const uid = useAuthStore.getState().user!.id;
  const invite = await fetchInviteByToken(token);
  if (!invite) throw new Error("Invite not found or expired.");
  if (invite.accepted_at) throw new Error("Invite already accepted.");
  if (new Date(invite.expires_at).getTime() < Date.now())
    throw new Error("Invite expired.");

  const { error: memErr } = await supabase
    .from("project_members")
    .upsert({
      project_id: invite.project_id,
      user_id: uid,
      role: invite.role,
    });
  if (memErr) throw new Error(memErr.message);

  const { error: invErr } = await supabase
    .from("project_invites")
    .update({
      accepted_at: new Date().toISOString(),
      accepted_by: uid,
    })
    .eq("id", invite.id);
  if (invErr) console.warn("[sharing] mark accepted failed", invErr.message);

  return { projectId: invite.project_id };
}

export async function removeMember(memberId: string): Promise<void> {
  if (!active() || !supabase) return;
  const { error } = await supabase
    .from("project_members")
    .delete()
    .eq("id", memberId);
  if (error) console.warn("[sharing] removeMember failed", error.message);
}

export function inviteUrl(token: string): string {
  return `${window.location.origin}/accept/${token}`;
}
