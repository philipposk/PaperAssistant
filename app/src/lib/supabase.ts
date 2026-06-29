import { createClient } from "@supabase/supabase-js";
import { sharedCookieStorage } from "./cookieStorage";

// Vite injects these at build time. On Vercel they come from the
// Supabase ↔ Vercel integration that auto-links the shared 6x7 project's
// anon key + URL to every linked Vercel project.
//
// Convention across all 6x7.gr apps: the JS client targets the app's own
// Postgres schema (here, `paperassistant`) so tables can't collide with
// sibling apps, and the auth session lives in a cookie scoped to `.6x7.gr`
// so a single sign-in at 6x7.gr is visible to every subdomain.

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

function build() {
  if (!url || !anonKey) return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return createClient<any, "paperassistant">(url, anonKey, {
    db: { schema: "paperassistant" },
    auth: {
      storage: sharedCookieStorage,
      storageKey: "sb-6x7-auth",
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
}

// Cast to a permissive client type. Without an explicit Database
// generic, the schema-narrowed return type from createClient() collides
// with the `SupabaseClient<any, "public", "public">` default everywhere
// it's consumed. Treat it as a generic client.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const supabase = build() as any;

export const isCloudConfigured = Boolean(supabase);
