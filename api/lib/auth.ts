import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;

export interface AuthResult {
  userId: string;
  email?: string;
}

/** Verify Supabase JWT from Authorization: Bearer (same pattern as pa-chat). */
export async function requireUser(req: Request): Promise<AuthResult | Response> {
  const origin = req.headers.get("Origin");
  const authHeader = req.headers.get("Authorization") ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  if (!token) {
    return new Response(JSON.stringify({ error: "Sign in to use the assistant." }), {
      status: 401,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": origin ?? "*" },
    });
  }
  if (!SUPABASE_URL || !SERVICE_ROLE) {
    return new Response(JSON.stringify({ error: "Auth not configured on server." }), {
      status: 503,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": origin ?? "*" },
    });
  }
  const admin = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });
  const { data, error } = await admin.auth.getUser(token);
  if (error || !data.user) {
    return new Response(JSON.stringify({ error: "Invalid or expired session." }), {
      status: 401,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": origin ?? "*" },
    });
  }
  return { userId: data.user.id, email: data.user.email };
}
