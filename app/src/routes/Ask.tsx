import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { Loader2, Send, Settings as SettingsIcon, Sparkles } from "lucide-react";
import { db, type FileRecord } from "../lib/db";
import { chat, hasAiConfigured, loadAiSettings, type ChatMessage } from "../lib/ai";
import { extractPdfText, truncate } from "../lib/pdfText";

const PER_FILE_MAX = 60_000; // chars of plaintext per PDF, leaves room for ~7 PDFs at Claude 4.5

interface Turn {
  q: string;
  a: string;
  used: string[];
  tokensIn?: number;
  tokensOut?: number;
}

export function Ask() {
  const { id = "" } = useParams();
  const files = useLiveQuery(
    () => db.files.where("project_id").equals(id).toArray(),
    [id],
  );
  const pdfs = useMemo(
    () =>
      (files ?? []).filter(
        (f) =>
          f.mime === "application/pdf" || f.name.toLowerCase().endsWith(".pdf"),
      ),
    [files],
  );
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [question, setQuestion] = useState("");
  const [turns, setTurns] = useState<Turn[]>([]);
  const [status, setStatus] = useState<"idle" | "thinking" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-select all PDFs the first time we see them.
  useEffect(() => {
    if (pdfs.length > 0 && selected.size === 0) {
      setSelected(new Set(pdfs.map((p) => p.id)));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pdfs.length]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [turns.length, status]);

  function toggle(fid: string) {
    setSelected((cur) => {
      const next = new Set(cur);
      if (next.has(fid)) next.delete(fid);
      else next.add(fid);
      return next;
    });
  }

  async function buildContext(selectedFiles: FileRecord[]): Promise<{
    context: string;
    used: string[];
  }> {
    const parts: string[] = [];
    const used: string[] = [];
    for (const f of selectedFiles) {
      const text = await extractPdfText(f.id, f.blob);
      parts.push(`# ${f.name}\n\n${truncate(text, PER_FILE_MAX)}`);
      used.push(f.name);
    }
    return { context: parts.join("\n\n---\n\n"), used };
  }

  async function ask() {
    const q = question.trim();
    if (!q) return;
    if (!hasAiConfigured()) {
      setError("Add an Anthropic or OpenAI key in Settings → AI assistant.");
      setStatus("error");
      return;
    }
    setStatus("thinking");
    setError(null);
    setQuestion("");
    const selectedFiles = pdfs.filter((p) => selected.has(p.id));
    try {
      const { context, used } = await buildContext(selectedFiles);

      const settings = loadAiSettings();
      const system =
        "You are PaperAssistant, helping a researcher reason about their project's papers. " +
        "Quote evidence with the paper name in brackets, e.g. [paper.pdf]. " +
        "If the answer isn't in the provided text, say so plainly. Don't invent citations.";

      const messages: ChatMessage[] = [
        { role: "system", content: system },
      ];
      if (turns.length > 0) {
        // Carry prior Q&A turns as conversation context.
        for (const t of turns) {
          messages.push({ role: "user", content: t.q });
          messages.push({ role: "assistant", content: t.a });
        }
      }
      messages.push({
        role: "user",
        content: context
          ? `Source material:\n\n${context}\n\nQuestion: ${q}`
          : `Question: ${q}\n\n(No PDFs selected — answer from general knowledge but say so.)`,
      });

      const result = await chat(messages, { maxTokens: 1500 });
      setTurns((cur) => [
        ...cur,
        {
          q,
          a: result.text,
          used,
          tokensIn: result.inputTokens,
          tokensOut: result.outputTokens,
        },
      ]);
      setStatus("idle");
      // optional: nudge sync that we used the assistant?
      void settings;
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setStatus("error");
    }
  }

  return (
    <div className="flex h-full">
      <aside className="w-72 shrink-0 border-r border-[var(--color-line)] bg-[var(--color-surface)] flex flex-col">
        <div className="px-4 py-3 border-b border-[var(--color-line)]">
          <div className="serif text-lg">Sources</div>
          <div className="text-[11px] text-[var(--color-ink-3)]">
            {pdfs.length} PDF{pdfs.length === 1 ? "" : "s"} in project
          </div>
        </div>
        <ul className="flex-1 overflow-y-auto">
          {pdfs.length === 0 && (
            <li className="px-4 py-6 text-center text-xs text-[var(--color-ink-3)]">
              Upload PDFs in Files to chat with them.
            </li>
          )}
          {pdfs.map((p) => (
            <li
              key={p.id}
              className="px-4 py-2 border-b border-[var(--color-line)]"
            >
              <label className="flex items-start gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={selected.has(p.id)}
                  onChange={() => toggle(p.id)}
                  className="mt-1 shrink-0"
                />
                <span className="flex-1 min-w-0 truncate">{p.name}</span>
              </label>
            </li>
          ))}
        </ul>
        <div className="px-4 py-2 border-t border-[var(--color-line)] text-[11px] text-[var(--color-ink-3)] flex items-center justify-between">
          <span>
            {selected.size} of {pdfs.length} selected
          </span>
          {!hasAiConfigured() && (
            <Link
              to="/settings"
              className="text-[var(--color-accent)] hover:underline flex items-center gap-1"
            >
              <SettingsIcon size={11} /> set key
            </Link>
          )}
        </div>
      </aside>

      <section className="flex-1 min-w-0 flex flex-col">
        <header className="h-12 shrink-0 border-b border-[var(--color-line)] bg-[var(--color-surface)] px-6 flex items-center gap-2">
          <Sparkles size={16} className="text-[var(--color-warm)]" />
          <span className="serif text-lg">Ask the project</span>
          {!hasAiConfigured() && (
            <span className="mono text-[10px] uppercase text-[var(--color-amber)] ml-auto">
              no key set
            </span>
          )}
        </header>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-8 py-6">
          {turns.length === 0 && status === "idle" && (
            <div className="max-w-2xl text-sm text-[var(--color-ink-3)]">
              <p>
                Ask anything about the PDFs you've selected on the left.
                PaperAssistant strips each PDF down to plain text and stuffs as
                much as the model context allows (~{PER_FILE_MAX.toLocaleString()}{" "}
                chars per PDF).
              </p>
              <p className="mt-2">
                For 200K-token Claude models you can comfortably select 6–8 PDFs;
                for 128K OpenAI models pick 3–4.
              </p>
            </div>
          )}
          {turns.map((t, i) => (
            <article
              key={i}
              className="mb-6 max-w-3xl"
            >
              <div className="mono uppercase text-[10px] tracking-wider text-[var(--color-warm)] mb-1">
                You
              </div>
              <div className="text-sm mb-3 whitespace-pre-wrap">{t.q}</div>
              <div className="mono uppercase text-[10px] tracking-wider text-[var(--color-accent)] mb-1">
                Assistant
              </div>
              <div className="text-sm leading-relaxed whitespace-pre-wrap rounded-[var(--radius-md)] border border-[var(--color-line)] bg-[var(--color-surface)] p-4">
                {t.a}
              </div>
              {(t.used.length > 0 || t.tokensIn) && (
                <div className="mono text-[10px] text-[var(--color-ink-3)] mt-1 flex flex-wrap items-center gap-2">
                  {t.used.map((u) => (
                    <span key={u} className="px-1.5 py-0.5 rounded bg-[var(--color-surface-2)]">
                      {u}
                    </span>
                  ))}
                  {t.tokensIn && (
                    <span>
                      · {t.tokensIn} in / {t.tokensOut ?? "?"} out
                    </span>
                  )}
                </div>
              )}
            </article>
          ))}
          {status === "thinking" && (
            <div className="flex items-center gap-2 text-sm text-[var(--color-ink-3)] mb-6">
              <Loader2 size={14} className="animate-spin" />
              Reading {selected.size} PDF{selected.size === 1 ? "" : "s"}…
            </div>
          )}
          {status === "error" && error && (
            <div className="mb-4 rounded-md border border-[var(--color-warm)] bg-[var(--color-warm-soft)] p-3 text-sm text-[var(--color-warm)] max-w-3xl">
              {error}
            </div>
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void ask();
          }}
          className="border-t border-[var(--color-line)] bg-[var(--color-surface)] px-6 py-3 flex items-end gap-2"
        >
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                void ask();
              }
            }}
            placeholder="Ask the selected PDFs anything. ⌘↵ to send."
            rows={2}
            className="flex-1 px-3 py-2 rounded-md border border-[var(--color-line)] bg-[var(--color-bg)] text-sm focus:outline-none focus:border-[var(--color-accent)] resize-none"
          />
          <button
            type="submit"
            disabled={status === "thinking" || !question.trim()}
            className="px-3 py-2 rounded-md bg-[var(--color-accent)] text-[#f6f2ea] text-sm font-medium hover:bg-[var(--color-accent-2)] disabled:opacity-60 flex items-center gap-2"
          >
            {status === "thinking" ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Send size={14} />
            )}
            Ask
          </button>
        </form>
      </section>
    </div>
  );
}
