// stripe-portal — open the Stripe billing portal (manage card / cancel / invoices).
// Auth: Supabase JWT. Returns { url }.
import Stripe from "https://esm.sh/stripe@17.7.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2024-06-20",
  httpClient: Stripe.createFetchHttpClient(),
});
const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
  auth: { persistSession: false },
});
const APP_URL = Deno.env.get("PA_APP_URL") ?? "https://paperassistant.6x7.gr";
const APP = "paperassistant";

function cors(o: string | null) {
  return {
    "Access-Control-Allow-Origin": o ?? "*",
    "Access-Control-Allow-Headers": "authorization, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}
const json = (s: number, b: unknown, o: string | null) =>
  new Response(JSON.stringify(b), { status: s, headers: { "Content-Type": "application/json", ...cors(o) } });

Deno.serve(async (req) => {
  const origin = req.headers.get("Origin");
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors(origin) });
  if (req.method !== "POST") return json(405, { error: "POST only" }, origin);

  const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
  const { data: { user } } = await admin.auth.getUser(token);
  if (!user) return json(401, { error: "Sign in first." }, origin);

  const { data: sub } = await admin
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", user.id).eq("app", APP).maybeSingle();
  if (!sub?.stripe_customer_id) return json(400, { error: "No billing account yet." }, origin);

  const session = await stripe.billingPortal.sessions.create({
    customer: sub.stripe_customer_id,
    return_url: `${APP_URL}/settings`,
  });
  return json(200, { url: session.url }, origin);
});
