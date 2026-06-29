import { useEffect, useState } from "react";
import { Eye, EyeOff, Sparkles } from "lucide-react";
import {
  DEFAULT_MODEL,
  loadAiSettings,
  saveAiSettings,
  type AiMode,
  type AiProvider,
} from "../lib/ai";
import { supabase } from "../lib/supabase";

export function AiSection() {
  const initial = loadAiSettings();
  const [mode, setMode] = useState<AiMode>(initial.mode);
  const [provider, setProvider] = useState<AiProvider>(initial.provider);
  const [anthropicKey, setAnthropicKey] = useState(initial.anthropicKey);
  const [openaiKey, setOpenaiKey] = useState(initial.openaiKey);
  const [model, setModel] = useState(initial.model);
  const [show, setShow] = useState(false);
  const [saved, setSaved] = useState(false);
  const [quota, setQuota] = useState<{ remaining: number; limit: number } | null>(
    null,
  );

  // Best-effort: read today's usage row directly so we can show the user how
  // many free questions they have left. Failures are silent (offline, not
  // signed in, RLS, etc.) — the UI just falls back to the generic line.
  useEffect(() => {
    if (mode !== "free" || !supabase) return;
    let cancelled = false;
    (async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;
        const day = new Date().toISOString().slice(0, 10);
        const { data } = await supabase
          .from("usage")
          .select("requests")
          .eq("user_id", user.id)
          .eq("day", day)
          .maybeSingle();
        if (cancelled) return;
        const requests = (data?.requests as number | undefined) ?? 0;
        setQuota({ remaining: Math.max(0, 50 - requests), limit: 50 });
      } catch {
        // best-effort; ignore
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [mode]);

  function save() {
    saveAiSettings({ mode, provider, anthropicKey, openaiKey, model });
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  function switchMode(m: AiMode) {
    setMode(m);
    saveAiSettings({ mode: m });
  }

  function switchProvider(p: AiProvider) {
    setProvider(p);
    setModel(DEFAULT_MODEL[p]);
  }

  const activeKey = provider === "anthropic" ? anthropicKey : openaiKey;
  const setActiveKey =
    provider === "anthropic" ? setAnthropicKey : setOpenaiKey;
  const placeholder =
    provider === "anthropic" ? "sk-ant-…" : "sk-…";

  return (
    <section className="rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-[var(--color-surface)] p-5 mb-5">
      <div className="flex items-center gap-2 mb-1">
        <Sparkles size={16} className="text-[var(--color-warm)]" />
        <div className="serif text-lg">AI assistant</div>
      </div>
      <p className="text-sm text-[var(--color-ink-3)] mb-3">
        Used by the <strong>Ask</strong> route to chat with your project's
        PDFs. Use the free shared tier, or bring your own key for unlimited use.
      </p>

      <div className="flex flex-col gap-2 mb-4">
        <label className="flex items-start gap-2 text-sm cursor-pointer">
          <input
            type="radio"
            name="ai-mode"
            checked={mode === "free"}
            onChange={() => switchMode("free")}
            className="mt-1 shrink-0"
          />
          <span>Free — no key needed (50 questions/day)</span>
        </label>
        <label className="flex items-start gap-2 text-sm cursor-pointer">
          <input
            type="radio"
            name="ai-mode"
            checked={mode === "byok"}
            onChange={() => switchMode("byok")}
            className="mt-1 shrink-0"
          />
          <span>Use my own API key — unlimited</span>
        </label>
      </div>

      {mode === "free" ? (
        <p className="text-sm text-[var(--color-ink-3)]">
          {quota
            ? `${quota.remaining} of ${quota.limit} free questions left today (resets 00:00 UTC)`
            : "Powered by a fast open model — sign in required."}
        </p>
      ) : (
        <>
          <div className="flex gap-2 mb-3">
            {(["anthropic", "openai"] as const).map((p) => (
              <button
                type="button"
                key={p}
                onClick={() => switchProvider(p)}
                className={
                  "px-3 py-1.5 rounded-md border text-sm capitalize " +
                  (provider === p
                    ? "border-[var(--color-accent)] bg-[var(--color-accent-soft)] text-[var(--color-accent)]"
                    : "border-[var(--color-line)] hover:bg-[var(--color-surface-2)]")
                }
              >
                {p}
              </button>
            ))}
          </div>

          <label className="mono uppercase text-[10px] tracking-wider text-[var(--color-ink-3)] block mb-1">
            API key
          </label>
          <div className="relative mb-3">
            <input
              type={show ? "text" : "password"}
              value={activeKey}
              onChange={(e) => setActiveKey(e.target.value)}
              placeholder={placeholder}
              className="w-full px-3 py-2 pr-10 rounded-md border border-[var(--color-line)] bg-[var(--color-bg)] text-sm mono focus:outline-none focus:border-[var(--color-accent)]"
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              aria-label={show ? "Hide key" : "Show key"}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[var(--color-ink-3)] hover:text-[var(--color-ink)]"
            >
              {show ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>

          <label className="mono uppercase text-[10px] tracking-wider text-[var(--color-ink-3)] block mb-1">
            Model
          </label>
          <input
            value={model}
            onChange={(e) => setModel(e.target.value)}
            placeholder={DEFAULT_MODEL[provider]}
            className="w-full px-3 py-2 rounded-md border border-[var(--color-line)] bg-[var(--color-bg)] text-sm mono focus:outline-none focus:border-[var(--color-accent)] mb-3"
          />
        </>
      )}

      <div className="mt-3">
        <button
          type="button"
          onClick={save}
          className="px-3 py-2 rounded-md bg-[var(--color-accent)] text-[#f6f2ea] text-sm font-medium hover:bg-[var(--color-accent-2)]"
        >
          {saved ? "Saved" : "Save"}
        </button>
      </div>

      {mode === "byok" && (
        <div className="mt-3 mono text-[11px] uppercase text-[var(--color-ink-3)]">
          Status:{" "}
          <span
            className={
              activeKey
                ? "text-[var(--color-green)]"
                : "text-[var(--color-amber)]"
            }
          >
            {activeKey ? `${provider} key set` : "no key"}
          </span>
        </div>
      )}
    </section>
  );
}
