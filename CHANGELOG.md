# PaperAssistant — v0.1 release notes

Status: pre-release working build. Local-only out of the box; cloud sync + sharing + AI all available once you wire the corresponding keys.

This document covers what landed in the rebuild that started 2026-05-24 and shipped its core feature set on 2026-05-25.

---

## What it is now

A research-paper workspace webapp. Create projects, upload your own figures, tables, PDFs, and other files, write markdown notes, manage citations, read PDFs with highlights, search 200M papers, build a citation graph for your library, share with co-authors, ask AI questions about your project's PDFs, and export the whole thing as a Quarto-ready manuscript bundle.

Stack: React 19 + Vite 8 + TypeScript 6 + Tailwind v4 + Dexie (IndexedDB) + Supabase (Postgres + auth + storage + RLS).

---

## Foundations (commits 9b57487 → 909d825)

- **Rebuild from scratch.** Archived the old ~80-file static Paper-A portal into `legacy/`. Moved demo data to `examples/paper-a/`.
- **Vite + React + TS scaffold** at `app/`. Editorial design tokens ported from the `frontend mockup/`: warm cream + navy + orange palette, Source Serif headlines, IBM Plex Sans/Mono.
- **App shell**: sidebar with WORKSPACE/OUTPUTS/TOOLS sections, topbar with breadcrumb + global search + notifications + settings, theme toggle (light/dark) with localStorage persistence.
- **Local-only MVP**: projects CRUD, file upload (drag-drop), figures gallery with width slider, CSV table viewer (papaparse), markdown notes editor (@uiw/react-md-editor), all in Dexie.
- **Dashboard**: hero card with project description, stats grid, recent activity feed (merges file + note timestamps), quick-access tiles.
- **Project picker** dropdown in sidebar, with check mark on active project + "+ New project" footer.

## Deploy + cloud (5a451ee → dedf716)

- **Vercel deploy config**: `vercel.json` builds from `app/` subdir, SPA fallback rewrites. `DEPLOY.md` step-by-step.
- **Supabase auth**: magic-link email + Google OAuth. Sign-in optional; app works fully offline when no env vars are set.
- **Supabase schema** (`supabase/migrations/0001_init.sql`): projects, files, notes tables with owner-scoped RLS. Storage bucket `files` at path `{user_id}/{project_id}/{file_id}` with per-folder policies.
- **Sidebar AccountWidget** showing sign-in / signed-in state.

## Sync (8ab84a6)

- **Dexie ↔ Supabase last-write-wins sync.** `pushProjectUpsert`, `pushFileUpsert` (including blob to Storage), `pushNoteUpsert`, plus delete variants. `pullAll` pulls anything newer. `reconcile` runs on sign-in: pull first, then push any local row without a `remote_id`.
- **Route mutations push automatically** after each Dexie write. Note edits debounce 800ms.
- **Sidebar SyncBadge** shows live status (idle / syncing / synced / error / offline).

## Code-split + ports (4b30486)

- **Lazy routes**: every route lazy()'d. Main bundle dropped 1.5MB → 436KB. MDEditor (1MB) only loads when /notes is opened.
- **A11y polish**: keyboard-only focus rings, `prefers-reduced-motion` honored.
- **Search** route at `/search?q=…`. Substring match across project names, file names, note titles + bodies. Up to 100 hits, jump-to-target on click.
- **Zip import**: drop a `.zip` on /projects → new project containing every entry, mime guessed from extension.
- **Timeline** at `/projects/:id/timeline`: day-grouped chronological feed of project + file + note activity.

## GitHub (6dcebe6)

- **Push project to GitHub** via Personal Access Token. Octokit Git Data API (createBlob × N → createTree → createCommit → updateRef). Creates a new repo (private by default) if one doesn't exist; updates the default branch otherwise. Token never leaves localStorage. Octokit lazy-imported.

## Dark mode + tests + research (82172f3 → 95cdcbd)

- **Dark mode active-nav contrast fix**: `--color-accent` brightened to sky-blue in `[data-theme=dark]` so accent-text-on-accent-soft stays legible.
- **Vitest + jsdom + fake-indexeddb**. 19 tests passing across db helpers, sync push, sync pull. `npm test` ~1.2s.
- **RESEARCH_GAP_ANALYSIS.md**: ~2,100-word competitive landscape survey (Notion, Obsidian, Zotero, ResearchRabbit, Litmaps, Connected Papers, Elicit, SciSpace, Paperlib, etc.) + prioritized roadmap.

## H1 — Citations (3f74c7f)

- **Schema**: `references` table (Dexie v2 + supabase migration 0003). CSL-JSON storage, citation key, DOI, BibTeX original, optional `pdf_file_id` link, tags.
- **citation-js wrappers** (`lib/citations.ts`): DOI lookup → Crossref → CSL-JSON, BibTeX parse, 6 CSL styles (APA / MLA / Chicago / Vancouver / Harvard / IEEE), bibliography render, `.bib` export.
- **Route `/projects/:id/references`**: style picker, paste-DOI form, BibTeX-import textarea, list rendered in chosen style, copy-citation-key button, delete, export-all `.bib`.
- **Inline citation renderer**: `@key` and `[@a; @b]` markdown tokens rewrite to `(Author, Year)` form.
- Verified end-to-end with the AlphaFold DOI.

## H2 — PDF reader + highlights (e5ce324)

- **Schema**: `highlights` table (Dexie v3 + supabase migration 0004).
- **react-pdf-highlighter-extended** on PDF.js, lazy-loaded.
- **Route `/projects/:id/files/:fileId/view`**: left aside with existing highlights (color swatch, snippet, page number, delete); right pane is the PDF.
- **Text selection** pops a 5-color bar → click to commit. **Alt + drag** selects an image region.
- Files page shows an Eye icon on PDF rows linking to the viewer.

## H4 — Semantic Scholar search (b766d73)

- **`lib/semanticScholar.ts`**: `/paper/search` with full metadata fields, `getPaper`, `getPaperReferences`, `getPaperCitations`, `batchGetPapers`, `paperToCsl` adapter into the Reference schema.
- **Route `/projects/:id/find-papers`**: search form, result cards with title, authors, TL;DR / abstract, citation count, DOI + OA-PDF links + Semantic Scholar deep link. "Add" button creates a Reference (disables to "In project" if DOI already there).
- Graceful errors: 429 explains rate limit, 5xx explains outage, network-layer "Failed to fetch" gets a friendlier wrapper.

## H3 — Sharing + RLS (eee56e2)

- **Schema**: `project_members {role: owner|editor|viewer, unique(project_id, user_id)}`, `project_invites {token, email, role, expires_at default now()+7d, accepted_at}` (supabase migration 0005).
- **Trigger**: every new project auto-creates an owner membership for the creator.
- **RLS rewrite** for projects + files + notes + references + highlights: member SELECT, editor INSERT/UPDATE/DELETE, owner-only project DELETE. Helper function builds the four policies per table then drops itself.
- **`lib/sharing.ts`**: listMembers / listInvites / createInvite / revokeInvite / acceptInvite / removeMember. 48-hex-char crypto tokens.
- **`components/ShareSection.tsx`** embedded in ProjectView: members list with role badge, invite form (email + editor/viewer dropdown), pending-invite list with copy-link + revoke buttons.
- **Route `/accept/:token`**: redirects to `/auth` if anonymous; after sign-in fetches the invite + adds the member.

## M5 — Citation graph (302ee6e)

- **`lib/semanticScholar.ts`** gains `getPaperReferences`, `getPaperCitations`, `batchGetPapers`. Soft-fails on 429/5xx.
- **Route `/projects/:id/graph`** with `react-force-graph-2d` (lazy). Seeds = references with DOI. Each seed fetches refs + citations. Seeds rendered in warm orange, connected papers in accent blue. Edges are arrows citer → cited. Click a node to open the Semantic Scholar page.
- Rate-limit aware: ~2 seconds per seed paper; a typical 10-paper project takes ~20s.

## M2 — Tags + filter (bff89ed)

- **`components/TagEditor.tsx`**: pill input. Enter / space / comma commits, Backspace removes last, suggestion dropdown.
- **`lib/tags.ts`**: `projectTagSuggestions` ranks tags by descending count across files + refs.
- **Files page**: tag-filter chip row (multi-select, AND semantics) + per-row Tag button toggling the inline editor. Saved-tag chips visible in the metadata line.
- Reference tagging UI deferred (schema already supports it).

## M1 — Quarto manuscript export (909412f)

- **`lib/manuscriptExport.ts` + JSZip**: builds `index.qmd` (Quarto YAML front matter + notes merged in created-at order + auto-generated figure references + table links), `references.bib` (citation-js), `figures/`, `tables/`, `files/`, `README.md`, `export-manifest.json`.
- **Route `/projects/:id/export`**: live counts of what will be included, download button, render snippet for Quarto.
- Lazy-imported so JSZip stays out of the main bundle.

## M6 — Ask the project (07cccc0)

- **`lib/ai.ts`**: provider-agnostic `chat()` for Anthropic + OpenAI. Settings + keys in localStorage. Anthropic call sets `anthropic-dangerous-direct-browser-access` automatically.
- **`lib/pdfText.ts`**: extract plain text from PDFs via pdfjs-dist with per-fileId in-memory cache.
- **`components/AiSection.tsx`** in Settings: provider toggle, key paste/save/show, model override.
- **Route `/projects/:id/ask`**: left aside lists PDFs (auto-select all on first visit, toggle to control context). Right pane is multi-turn chat. Submit stuffs up to 60k chars per selected PDF into the model context, prepends a system prompt asking for `[paper.pdf]` evidence brackets. Cmd/Ctrl-Enter sends. Token counts shown when API reports them.
- Lazy-loaded; pdfjs + chat UI stay out of the main bundle.
- Stuffing only — no embeddings / pgvector yet. Works well up to a handful of medium PDFs on 200K-token Claude.

---

## Files added by category

- **Routes** (`app/src/routes/`): Auth, AuthCallback, Dashboard, Projects, ProjectView, Files, Figures, Tables, Notes, Search, Timeline, References, PdfViewer, SearchPapers, AcceptInvite, Graph, Export, Ask, Settings, Examples.
- **Lib modules** (`app/src/lib/`): db (Dexie v3), auth, supabase, currentProject, theme, cn, sync/ (push/pull/reconcile/types), github, semanticScholar, citations, sharing, tags, manuscriptExport, ai, pdfText, zipImport.
- **Components** (`app/src/components/`): AppShell, Sidebar, Topbar, ProjectPicker, AccountWidget, GitHubIcon, GitHubSection, PushToGitHubButton, ShareSection, TagEditor, AiSection.
- **SQL migrations** (`supabase/migrations/`): 0001_init, 0002_storage, 0003_references, 0004_highlights, 0005_sharing.

## Numbers

- 26 commits in this rebuild.
- ~9,000 LOC TypeScript added (lib + routes + components + tests).
- 5 SQL migrations.
- 19 vitest tests, all passing.
- Main bundle 436KB gzipped → ~140KB. Heavy deps (citation-js, pdfjs, MDEditor, force-graph, JSZip, Octokit) are all lazy-loaded behind their route.

## What's not done yet

- Live-cursor / CRDT collaboration on notes (Yjs scaffolding deferred to v1.5).
- Per-note revision history.
- ORCID / Zenodo DOI minting.
- Embedding-based RAG (pgvector). Current Ask uses naive stuffing.
- Mobile / responsive polish.
- Citation insert UX in the markdown editor (currently you paste `@key` by hand).
- Reference tag-editor UI (schema present, no UI yet).
- Saved-searches UI (`lib/tags.ts` has the storage helpers).

## How to run / deploy

```bash
cd app
npm install
npm run dev   # http://localhost:5173
```

For deploy + Supabase wiring, see `DEPLOY.md` and `supabase/README.md`.
