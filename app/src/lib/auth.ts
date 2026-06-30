import { useEffect } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { create } from "zustand";
import { db } from "./db";
import { isCloudConfigured, supabase } from "./supabase";

const THEME_KEY = "paperassistant.theme";

interface AuthState {
  session: Session | null;
  user: User | null;
  loading: boolean;
  setSession: (s: Session | null) => void;
  setLoading: (b: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  loading: isCloudConfigured,
  setSession: (s) => set({ session: s, user: s?.user ?? null }),
  setLoading: (b) => set({ loading: b }),
}));

let initialized = false;

export function initAuth() {
  if (initialized || !supabase) return;
  initialized = true;
  void supabase.auth.getSession().then(({ data }: { data: { session: Session | null } }) => {
    useAuthStore.getState().setSession(data.session);
    useAuthStore.getState().setLoading(false);
  });
  supabase.auth.onAuthStateChange((_event: string, session: Session | null) => {
    useAuthStore.getState().setSession(session);
  });
}

export function useAuth() {
  const { session, user, loading } = useAuthStore();
  useEffect(initAuth, []);
  return {
    session,
    user,
    loading,
    isSignedIn: Boolean(user),
    isCloudConfigured,
  };
}

export async function sendMagicLink(email: string) {
  if (!supabase) throw new Error("Cloud not configured");
  const redirectTo = `${window.location.origin}/auth/callback`;
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: redirectTo },
  });
  if (error) throw error;
}

export async function signInWithGoogle() {
  if (!supabase) throw new Error("Cloud not configured");
  const redirectTo = `${window.location.origin}/auth/callback`;
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo },
  });
  if (error) throw error;
}

export async function signInWithGitHub() {
  if (!supabase) throw new Error("Cloud not configured");
  const redirectTo = `${window.location.origin}/auth/callback`;
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "github",
    options: { redirectTo },
  });
  if (error) throw error;
}

/** Wipe local project data and auth-adjacent storage on shared machines. */
export async function clearLocalWorkspace(): Promise<void> {
  await db.delete();
  if (typeof localStorage === "undefined") return;
  const theme = localStorage.getItem(THEME_KEY);
  localStorage.clear();
  if (theme) localStorage.setItem(THEME_KEY, theme);
}

export async function signOut() {
  if (supabase) await supabase.auth.signOut();
  await clearLocalWorkspace();
  window.location.assign("/");
}
