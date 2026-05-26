import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { Loader2, RefreshCw } from "lucide-react";
import { db } from "../lib/db";
import {
  batchGetPapers,
  getPaperReferences,
  getPaperCitations,
  type CitationEdgePaper,
} from "../lib/semanticScholar";

const ForceGraph2D = lazy(() => import("react-force-graph-2d"));

type Direction = "out" | "in";

interface GraphNode {
  id: string;
  label: string;
  year: number | null;
  inProject: boolean;
}
interface GraphLink {
  source: string;
  target: string;
  kind: Direction;
}

interface BuildResult {
  nodes: GraphNode[];
  links: GraphLink[];
  errored: number;
}

async function buildGraph(seedDois: string[]): Promise<BuildResult> {
  // 1. resolve project's DOIs to SS paperIds + names
  const seeds = await batchGetPapers(seedDois.map((d) => `DOI:${d}`));
  if (seeds.length === 0) return { nodes: [], links: [], errored: seedDois.length };

  const nodes = new Map<string, GraphNode>();
  for (const p of seeds) {
    nodes.set(p.paperId, {
      id: p.paperId,
      label: p.title.slice(0, 80) || "Untitled",
      year: p.year,
      inProject: true,
    });
  }

  const links: GraphLink[] = [];
  let errored = 0;

  for (const p of seeds) {
    const [refs, cits] = await Promise.all([
      getPaperReferences(p.paperId).catch(() => {
        errored++;
        return [] as CitationEdgePaper[];
      }),
      getPaperCitations(p.paperId).catch(() => {
        errored++;
        return [] as CitationEdgePaper[];
      }),
    ]);
    for (const r of refs) {
      if (!nodes.has(r.paperId)) {
        nodes.set(r.paperId, {
          id: r.paperId,
          label: (r.title ?? "Untitled").slice(0, 80),
          year: r.year ?? null,
          inProject: false,
        });
      }
      links.push({ source: p.paperId, target: r.paperId, kind: "out" });
    }
    for (const c of cits) {
      if (!nodes.has(c.paperId)) {
        nodes.set(c.paperId, {
          id: c.paperId,
          label: (c.title ?? "Untitled").slice(0, 80),
          year: c.year ?? null,
          inProject: false,
        });
      }
      links.push({ source: c.paperId, target: p.paperId, kind: "in" });
    }
  }

  // Prune to nodes connected to at least one seed (already true by construction).
  // Optionally: drop nodes with only one connection to compress display.
  return { nodes: Array.from(nodes.values()), links, errored };
}

export function Graph() {
  const { id = "" } = useParams();
  const refs = useLiveQuery(
    () => db.references.where("project_id").equals(id).toArray(),
    [id],
  );
  const doiList = useMemo(
    () => (refs ?? []).map((r) => r.doi).filter((d): d is string => Boolean(d)),
    [refs],
  );

  const [graph, setGraph] = useState<BuildResult | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [containerSize, setContainerSize] = useState<{ w: number; h: number }>(
    { w: 800, h: 600 },
  );

  useEffect(() => {
    function onResize() {
      const el = document.getElementById("graph-canvas");
      if (!el) return;
      setContainerSize({ w: el.clientWidth, h: el.clientHeight });
    }
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [graph]);

  async function build() {
    if (doiList.length === 0) return;
    setStatus("loading");
    setError(null);
    try {
      const result = await buildGraph(doiList);
      setGraph(result);
      setStatus("idle");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setStatus("error");
    }
  }

  const colorFor = (node: GraphNode) =>
    node.inProject ? "#b9532b" : "#6ea8d4";

  return (
    <div className="flex flex-col h-full">
      <header className="px-8 py-6 border-b border-[var(--color-line)] flex items-center justify-between gap-4">
        <div>
          <h1 className="serif text-3xl">Citation graph</h1>
          <p className="text-sm text-[var(--color-ink-3)] mt-1">
            Maps references + citations of this project's papers via Semantic Scholar.
          </p>
        </div>
        <button
          type="button"
          onClick={build}
          disabled={status === "loading" || doiList.length === 0}
          className="px-3 py-2 rounded-md bg-[var(--color-accent)] text-[#f6f2ea] text-sm font-medium hover:bg-[var(--color-accent-2)] disabled:opacity-60 flex items-center gap-2"
        >
          {status === "loading" ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <RefreshCw size={14} />
          )}
          {graph ? "Rebuild" : "Build graph"}
        </button>
      </header>

      {doiList.length === 0 && (
        <div className="m-auto text-center text-sm text-[var(--color-ink-3)]">
          Add references with DOIs first — the graph traces what each paper cites
          and what cites it back.
        </div>
      )}

      {doiList.length > 0 && status === "idle" && !graph && (
        <div className="m-auto text-center text-sm text-[var(--color-ink-3)]">
          Click <strong>Build graph</strong> to fetch references for{" "}
          {doiList.length} paper{doiList.length === 1 ? "" : "s"} in this project.
        </div>
      )}

      {error && (
        <div className="m-8 rounded-md border border-[var(--color-warm)] bg-[var(--color-warm-soft)] p-4 text-sm text-[var(--color-warm)]">
          {error}
        </div>
      )}

      {graph && (
        <>
          <div className="px-8 py-3 mono text-[11px] uppercase text-[var(--color-ink-3)] flex gap-6 border-b border-[var(--color-line)]">
            <span>{graph.nodes.length} nodes</span>
            <span>{graph.links.length} edges</span>
            <span>
              <span className="inline-block w-2 h-2 rounded-full bg-[var(--color-warm)] mr-1 align-middle" />
              In project
            </span>
            <span>
              <span className="inline-block w-2 h-2 rounded-full bg-[var(--color-accent)] mr-1 align-middle" />
              Connected
            </span>
            {graph.errored > 0 && (
              <span className="text-[var(--color-warm)]">
                {graph.errored} fetch(es) failed
              </span>
            )}
          </div>
          <div
            id="graph-canvas"
            className="flex-1 bg-[var(--color-surface-2)] relative"
          >
            <Suspense
              fallback={
                <div className="absolute inset-0 flex items-center justify-center text-sm text-[var(--color-ink-3)]">
                  <Loader2 size={16} className="animate-spin mr-2" /> Loading graph…
                </div>
              }
            >
              <ForceGraph2D
                graphData={{
                  nodes: graph.nodes as never,
                  links: graph.links as never,
                }}
                width={containerSize.w}
                height={containerSize.h}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                nodeColor={(n: any) => colorFor(n as GraphNode)}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                nodeLabel={(n: any) => {
                  const node = n as GraphNode;
                  return `${node.label}${node.year ? ` (${node.year})` : ""}`;
                }}
                linkColor={() => "rgba(120,120,120,0.25)"}
                linkDirectionalArrowLength={3}
                linkDirectionalArrowRelPos={1}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onNodeClick={(n: any) => {
                  const node = n as GraphNode;
                  window.open(
                    `https://www.semanticscholar.org/paper/${node.id}`,
                    "_blank",
                    "noopener",
                  );
                }}
                cooldownTicks={120}
              />
            </Suspense>
          </div>
        </>
      )}
    </div>
  );
}
