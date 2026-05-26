import { useEffect, useRef, useState } from "react";
import { Tag, X } from "lucide-react";

interface Props {
  tags: string[];
  onChange: (next: string[]) => void;
  suggestions?: string[];
  placeholder?: string;
}

export function TagEditor({ tags, onChange, suggestions = [], placeholder }: Props) {
  const [draft, setDraft] = useState("");
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  function add(raw: string) {
    const clean = raw.trim().toLowerCase().replace(/[,\s]+/g, "-");
    if (!clean) return;
    if (tags.includes(clean)) {
      setDraft("");
      return;
    }
    onChange([...tags, clean]);
    setDraft("");
  }
  function remove(t: string) {
    onChange(tags.filter((x) => x !== t));
  }

  const filteredSuggestions = suggestions
    .filter((s) => !tags.includes(s))
    .filter((s) => (draft ? s.includes(draft.toLowerCase()) : true))
    .slice(0, 6);

  return (
    <div ref={wrap} className="relative">
      <div className="flex flex-wrap items-center gap-1 px-2 py-1.5 rounded-md border border-[var(--color-line)] bg-[var(--color-bg)] focus-within:border-[var(--color-accent)]">
        {tags.map((t) => (
          <span
            key={t}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--color-accent-soft)] text-[var(--color-accent)] mono text-[10px] uppercase"
          >
            <Tag size={10} />
            {t}
            <button
              type="button"
              onClick={() => remove(t)}
              aria-label={`Remove ${t}`}
              className="hover:text-[var(--color-warm)]"
            >
              <X size={10} />
            </button>
          </span>
        ))}
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === "," || e.key === " ") {
              e.preventDefault();
              add(draft);
            } else if (e.key === "Backspace" && !draft && tags.length) {
              remove(tags[tags.length - 1]);
            }
          }}
          placeholder={tags.length === 0 ? (placeholder ?? "add tag…") : ""}
          className="flex-1 min-w-[100px] bg-transparent text-sm focus:outline-none mono"
        />
      </div>
      {open && filteredSuggestions.length > 0 && (
        <div className="absolute z-20 mt-1 left-0 right-0 rounded-md border border-[var(--color-line)] bg-[var(--color-surface)] shadow-lg p-1">
          {filteredSuggestions.map((s) => (
            <button
              key={s}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                add(s);
              }}
              className="w-full text-left px-2 py-1 rounded text-xs mono hover:bg-[var(--color-surface-2)]"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
