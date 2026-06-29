// stripe-webhook — Stripe -> Supabase sync. Verifies the signature, then writes
// the user's plan/status into public.subscriptions (onConflict user_id,app).
// MUST be deployed with verify_jwt=false (Stripe sends no Supabase JWT).
import Stripe from "https://esm.sh/stripe@17.7.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2024-06-20",
  httpClient: Stripe.createFetchHttpClient(),
});
const cryptoProvider = Stripe.createSubtleCryptoProvider();
const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
  auth: { persistSession: false },
});
const WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;
const APP = "paperassistant";

async function upsert(row: Record<string, unknown>) {
  const { error } = await admin.from("subscriptions").upsert(row, { onConflict: "user_id,app" });
  if (error) console.error("subscriptions upsert error:", error.message);
}

function periodEnd(sub: Stripe.Subscription): string | null {
  const t = (sub as unknown as { current_period_end?: number }).current_period_end;
  return t ? new Date(t * 1000).toISOString() : null;
}

Deno.serve(async (req) => {
  const sig = req.headers.get("stripe-signature");
  if (!sig) return new Response("missing signature", { status: 400 });
  const raw = await req.text();

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(raw, sig, WEBHOOK_SECRET, undefined, cryptoProvider);
  } catch (e) {
    console.error("signature verify failed:", e instanceof Error ? e.message : e);
    return new Response("bad signature", { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const s = event.data.object as Stripe.Checkout.Session;
        const userId = s.metadata?.supabase_user_id;
        if (userId && s.subscription) {
          const sub = await stripe.subscriptions.retrieve(s.subscription as string);
          await upsert({
            user_id: userId,
            app: s.metadata?.app ?? APP,
            plan: s.metadata?.plan ?? "plus",
            status: sub.status,
            stripe_customer_id: (s.customer as string) ?? null,
            stripe_subscription_id: sub.id,
            current_period_end: periodEnd(sub),
            updated_at: new Date().toISOString(),
          });
        }
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.supabase_user_id;
        if (userId) {
          await upsert({
            user_id: userId,
            app: sub.metadata?.app ?? APP,
            plan: event.type === "customer.subscription.deleted" ? "free" : (sub.metadata?.plan ?? "plus"),
            status: event.type === "customer.subscription.deleted" ? "canceled" : sub.status,
            stripe_customer_id: sub.customer as string,
            stripe_subscription_id: sub.id,
            current_period_end: periodEnd(sub),
            updated_at: new Date().toISOString(),
          });
        }
        break;
      }
    }
  } catch (e) {
    console.error("webhook handler error:", e instanceof Error ? e.message : e);
    return new Response("handler error", { status: 500 }); // Stripe will retry
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
