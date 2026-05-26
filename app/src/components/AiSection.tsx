import { useState } from "react";
import { Eye, EyeOff, Sparkles } from "lucide-react";
import {
  DEFAULT_MODEL,
  loadAiSettings,
  saveAiSettings,
  type AiProvider,
} from "../lib/ai";

export function AiSection() {
  const initial = loadAiSettings();
  const [provider, setProvider] = useState<AiProvider>(initial.provider);
  const [anthropicKey, setAnthropicKey] = useState(initial.anthropicKey);
  const [openaiKey, setOpenaiKey] = useState(initial.openaiKey);
  const [model, setModel] = useState(initial.model);
  const [show, setShow] = useState(false);
  const [saved, setSaved] = useState(false);

  function save() {
    saveAiSettings({ provider, anthropicKey, openaiKey, model });
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
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
        Paste your own Anthropic or OpenAI key. The key lives only in this
        browser's localStorage and never touches our servers. Used by the{" "}
        <strong>Ask</strong> route to chat with project PDFs.
      </p>

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

      <button
        type="button"
        onClick={save}
        className="px-3 py-2 rounded-md bg-[var(--color-accent)] text-[#f6f2ea] text-sm font-medium hover:bg-[var(--color-accent-2)]"
      >
        {saved ? "Saved" : "Save"}
      </button>

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
    </section>
  );
}
