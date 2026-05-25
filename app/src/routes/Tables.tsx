import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import Papa from "papaparse";
import { db, type FileRecord } from "../lib/db";

function TableCard({ file }: { file: FileRecord }) {
  const [rows, setRows] = useState<string[][] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void file.blob.text().then((text) => {
      const parsed = Papa.parse<string[]>(text, { skipEmptyLines: true });
      if (cancelled) return;
      if (parsed.errors.length) setError(parsed.errors[0].message);
      setRows(parsed.data as string[][]);
    });
    return () => {
      cancelled = true;
    };
  }, [file.blob]);

  const head = rows?.[0] ?? [];
  const body = rows?.slice(1, 21) ?? [];

  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-[var(--color-surface)] overflow-hidden">
      <div className="px-5 py-3 border-b border-[var(--color-line)] flex items-center justify-between">
        <div className="serif text-lg">{file.name}</div>
        <div className="mono text-[10px] text-[var(--color-ink-3)] uppercase">
          {(file.size / 1024).toFixed(1)} KB · {rows ? rows.length - 1 : "…"}{" "}
          rows
        </div>
      </div>
      {error && (
        <div className="p-4 text-sm text-[var(--color-warm)]">{error}</div>
      )}
      {rows && (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-[var(--color-surface-2)]">
              <tr>
                {head.map((h, i) => (
                  <th
                    key={i}
                    className="px-3 py-2 text-left mono text-[11px] uppercase text-[var(--color-ink-2)] border-b border-[var(--color-line)]"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {body.map((row, ri) => (
                <tr key={ri} className="border-b border-[var(--color-line)] last:border-0">
                  {row.map((cell, ci) => (
                    <td key={ci} className="px-3 py-2 text-[var(--color-ink-2)]">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {rows && rows.length > 21 && (
        <div className="px-5 py-2 text-xs text-[var(--color-ink-3)] border-t border-[var(--color-line)]">
          Showing first 20 of {rows.length - 1} rows.
        </div>
      )}
    </div>
  );
}

export function Tables() {
  const { id = "" } = useParams();
  const files = useLiveQuery(
    () => db.files.where("project_id").equals(id).toArray(),
    [id],
  );
  const tables = useMemo(
    () =>
      (files ?? []).filter(
        (f) => f.mime === "text/csv" || f.name.toLowerCase().endsWith(".csv"),
      ),
    [files],
  );

  return (
    <div className="px-8 py-8 max-w-6xl mx-auto">
      <h1 className="serif text-3xl mb-6">Tables</h1>
      {tables.length === 0 ? (
        <div className="text-center py-16 text-sm text-[var(--color-ink-3)]">
          No CSV files in this project yet. Upload one from the Files page.
        </div>
      ) : (
        <div className="space-y-6">
          {tables.map((f) => (
            <TableCard key={f.id} file={f} />
          ))}
        </div>
      )}
    </div>
  );
}
