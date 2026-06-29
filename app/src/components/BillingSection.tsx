import { useEffect, useState } from "react";
import { CreditCard, Loader2 } from "lucide-react";
import { supabase } from "../lib/supabase";
import { TIER_LIMITS } from "../lib/aiPlans";

type Plan = "free" | "plus";

// Read the Stripe-return marker once, on first render, so a redirect back from
// Checkout shows the right note even before the subscriptions row has caught up.
function initialReturn(): "success" | "cancel" | null {
  if (typeof window === "undefined") return null;
  const sub = new URLSearchParams(window.location.search).get("sub");
  if (sub === "success") return "success";
  if (sub === "cancel") return "cancel";
  return null;
}

export function BillingSection() {
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [plan, setPlan] = useState<Plan>("free");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stripeReturn] = useState<"success" | "cancel" | null>(initialReturn);

  // Strip the ?sub=… param so a refresh doesn't re-show the note.
  useEffect(() => {
    if (!stripeReturn) return;
    try {
      const u = new URL(window.location.href);
      u.searchParams.delete("sub");
      window.history.replaceState({}, "", u.pathname + u.search + u.hash);
    } catch {
      // best-effort
    }
  }, [stripeReturn]);

  // Best-effort: figure out whether the user is signed in and on Plus.
  // Any failure (offline, null client, RLS) falls back to the free/upgrade
  // state — never crash the Settings page.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!supabase) {
        if (!cancelled) setSignedIn(false);
        return;
      }
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (cancelled) return;
        if (!user) {
          setSignedIn(false);
          return;
        }
        setSignedIn(true);
        try {
          const { data } = await supabase
            .schema("public")
            .from("subscriptions")
            .select("plan,status")
            .eq("user_id", user.id)
            .eq("app", "paperassistant")
            .maybeSingle();
          if (cancelled) return;
          const status = data?.status as string | undefined;
          const p = data?.plan as string | undefined;
          if (p && p !== "free" && (status === "active" || status === "trialing")) {
            setPlan("plus");
          }
        } catch {
          // subscriptions read failed — leave as free
        }
      } catch {
        if (!cancelled) setSignedIn(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // Re-check after a Stripe return so a fresh Plus row is picked up.
  }, [stripeReturn]);

  async function callFunction(fn: "stripe-checkout" | "stripe-portal") {
    setError(null);
    if (!supabase) {
      setError("Sign in first.");
      return;
    }
    setBusy(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        setError("Sign in first.");
        setBusy(false);
        return;
      }
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${fn}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.url) {
        throw new Error(data.error || `Billing error ${res.status}`);
      }
      window.location.href = data.url as string;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setBusy(false);
    }
  }

  return (
    <section className="rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-[var(--color-surface)] p-5 mb-5">
      <div className="flex items-center gap-2 mb-1">
        <CreditCard size={16} className="text-[var(--color-warm)]" />
        <div className="serif text-lg">Billing</div>
      </div>
      <p className="text-sm text-[var(--color-ink-3)] mb-3">
        Upgrade to Plus for more AI questions per day on the free shared tier.
      </p>

      {stripeReturn === "success" && (
        <div className="mb-3 rounded-md border border-[var(--color-line)] bg-[var(--color-surface-2)] px-3 py-2 text-sm text-[var(--color-green)]">
          You're on Plus 🎉 — it may take a few seconds to activate.
        </div>
      )}
      {stripeReturn === "cancel" && (
        <div className="mb-3 text-sm text-[var(--color-ink-3)]">
          Checkout canceled.
        </div>
      )}

      {signedIn === false ? (
        <p className="text-sm text-[var(--color-ink-3)]">
          Sign in to manage your plan.
        </p>
      ) : signedIn === null ? (
        <p className="text-sm text-[var(--color-ink-3)]">…</p>
      ) : plan === "plus" ? (
        <>
          <p className="text-sm text-[var(--color-ink-3)] mb-3">
            Plan: <strong>Plus</strong> — {TIER_LIMITS.plus} AI questions/day
          </p>
          <button
            type="button"
            onClick={() => void callFunction("stripe-portal")}
            disabled={busy}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-[var(--color-line)] text-sm hover:bg-[var(--color-surface-2)] disabled:opacity-60"
          >
            {busy && <Loader2 size={14} className="animate-spin" />}
            Manage billing
          </button>
        </>
      ) : (
        <>
          <p className="text-sm text-[var(--color-ink-3)] mb-3">
            Plan: <strong>Free</strong> — {TIER_LIMITS.free} AI questions/day
          </p>
          <button
            type="button"
            onClick={() => void callFunction("stripe-checkout")}
            disabled={busy}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-[var(--color-accent)] text-[#f6f2ea] text-sm font-medium hover:bg-[var(--color-accent-2)] disabled:opacity-60"
          >
            {busy && <Loader2 size={14} className="animate-spin" />}
            Upgrade to Plus — €5/mo ({TIER_LIMITS.plus}/day)
          </button>
        </>
      )}

      {error && (
        <div className="mt-3 text-sm text-[var(--color-amber)]">{error}</div>
      )}
    </section>
  );
}
