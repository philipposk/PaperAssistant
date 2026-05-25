# PaperAssistant — Competitive Research & Gap Analysis

Date: 2026-05-25
Scope: where PaperAssistant sits in the researcher-tool landscape today, and what to build next to be genuinely useful to a public researcher audience.

---

## 1. Landscape survey

PaperAssistant currently bundles: project workspace, file upload, figure gallery, CSV table viewer, markdown notes, search, day-grouped timeline, .zip import, themes, magic-link/Google auth, Dexie-Supabase last-write-wins sync, push-to-GitHub via Octokit.

Below: products and OSS repos researchers actually use that overlap meaningfully with that surface area.

### Generic note-taking / PKM (researchers heavily adopt these)

| Tool | URL | Killer feature(s) | One-liner |
|---|---|---|---|
| Obsidian | https://obsidian.md | Local markdown vault + 2k+ community plugins (ZotLit, PDF++, Citations, Dataview, Omnisearch) | Markdown notes app that has become the de-facto PhD workbench through its plugin ecosystem. |
| Notion | https://notion.so | Databases + relations + real-time multiplayer | All-purpose docs/databases workspace; weak for offline and reference handling but strong for collaboration. |
| Logseq | https://logseq.com | Outliner with block-level bidirectional links, open source, free | Roam-style outliner for connected notes; popular with researchers who want Roam ergonomics without the $15/mo. |
| Roam Research | https://roamresearch.com | Bidirectional block links, daily-notes-first | The original block-linked outliner. Premium-priced; declining momentum. |
| Anytype | https://anytype.io | Local-first encrypted P2P, object-oriented model | Privacy-first PKM with object types; community is active but tooling for research is thin. |
| Capacities | https://capacities.io | Typed objects (Book, Paper, Person) with structured properties | Object-oriented notes; recently added Readwise integration and kanban views. |
| Tana | https://tana.inc | Supertags + AI agents (GPT-5 in product) | AI-native outliner with structured tags; explosive PKM adoption in 2024–25 but invite/paid. |

### Reference managers

| Tool | URL | Killer feature(s) | One-liner |
|---|---|---|---|
| Zotero | https://zotero.org | Free, 1-click browser capture, built-in PDF reader with annotations, 7000+ CSL styles, open Web API + new local HTTP API in Zotero 7 | The dominant open-source reference manager; basically the floor every researcher tool integrates with. |
| Mendeley | https://mendeley.com | Free, social discovery, Elsevier-owned | Declining; many features removed in recent years; users migrating to Zotero. |
| Paperpile | https://paperpile.com | Cloud-native, Google Docs/Drive integration, AI tagging | Subscription cloud reference manager popular with Google-stack users. |
| EndNote / Citavi | https://endnote.com | Word integration, institutional licensing | Legacy enterprise reference managers. |

### Citation graph / literature discovery

| Tool | URL | Killer feature(s) | One-liner |
|---|---|---|---|
| Connected Papers | https://connectedpapers.com | Single-seed similarity graph | 5-minute "what's around this paper" map. |
| ResearchRabbit | https://researchrabbit.ai | Iterative collection-based citation chaining; Zotero import | Acquired by Litmaps; now freemium. Best for multi-week lit-review building. |
| Litmaps | https://litmaps.com | 2D citation-vs-recency visualization, monitoring/alerts | Strongest visualization and "tell me when something new cites my set" workflow. |
| Inciteful | https://inciteful.xyz | Free network analysis over Open Citations | Free, fast, no account needed; lighter graph than Litmaps. |
| Semantic Scholar | https://semanticscholar.org | Free REST API (200M+ papers, no key, TLDRs) | The free corpus underneath nearly every modern lit-review tool. |
| Elicit | https://elicit.com | Systematic-review pipeline (PRISMA-style screening up to 40k papers) | $12/mo; rigorous evidence synthesis. |
| SciSpace | https://scispace.com | Multi-source search (280M papers), Deep Review synthesis | $20/mo; broader exploratory discovery. |
| Undermind | https://undermind.ai | Agentic adaptive search across full-text + citations | Narrower but high-precision deep search. |
| Scite | https://scite.ai | Classifies citing sentences as supporting / contrasting / mentioning | "Smart citation" context — unique value, hard to replicate without their NLP pipeline. |

### Lab notebooks / open science / scholarly publishing

| Tool | URL | Killer feature(s) | One-liner |
|---|---|---|---|
| OSF (Open Science Framework) | https://osf.io | Free preregistration + DOI minting + Dropbox/GitHub/Drive add-ons | The neutral open-science workspace + archival store. |
| eLabFTW | https://elabftw.net | Self-hostable ELN with inventory, GPL, ~2.7k GH stars, active | Open-source electronic lab notebook for wet labs. |
| Benchling | https://benchling.com | Molecular biology-aware ELN | Commercial bio-focused ELN; not relevant for general research. |
| Quarto | https://quarto.org | Pandoc-based reproducible publishing (HTML/PDF/Word/EPUB) from .qmd | Polished scientific publishing toolchain; successor to R Markdown. |
| Jupyter Book / MyST | https://jupyterbook.org | Notebook → book, MyST markdown | Reproducible computational books. |
| Manubot | https://manubot.org | Git-based collaborative manuscript writing with auto-citations from DOI | Niche but powerful for open manuscripts written in markdown on GitHub. |

### Open-source GitHub repos in our exact space

Verified directly; star/license counts as of search-time 2025–2026:

| Repo | Stars | License | Last commit | Notes |
|---|---|---|---|---|
| Future-Scholars/paperlib | ~2.2k | GPL-3.0 | active (release Sep 2025) | Closest direct competitor — Electron + Vue paper-management app with scrapers, fulltext search, RSS, sync, LLM extensions. GPL means we cannot fork into MIT, but the architecture is a useful blueprint. |
| citation-js/citation-js | (active, used widely) | MIT | active (latest 0.7.x, ~4mo ago) | THE format conversion library: BibTeX/RIS/DOI/Wikidata ↔ CSL-JSON ↔ APA/Vancouver/etc. Drop-in for us. |
| agentcooper/react-pdf-highlighter | popular | MIT | active (forks like -extended, -plus) | React components for PDF highlight + note overlays on PDF.js. |
| wojtekmaj/react-pdf | popular | MIT | active | PDF.js wrapper; the de-facto React PDF renderer. |
| emptymalei/awesome-research | curated | CC | deprecated repo, moved to tools.kausalflow.com | Useful inventory of what researchers reach for. |
| Srujan-rai/Research_paper_repository_management_system | small | mixed | low activity | Student project; mostly a reference for what NOT to build. |

Note: I searched GitHub for ">100 star" repos that explicitly target "research workspace" / "thesis writing" / "academic webapp" as full web apps with project + notes + files. **Paperlib is the only mature one.** Most >100-star results are AI-prompt collections, "awesome" lists, or single-feature tools (graph viewers, scrapers). This is unusual — it suggests the niche of "Notion-but-for-research, web-based, open" is genuinely underserved.

---

## 2. Missing features — prioritized

For each item: what it is, why researchers need it (which competitor proves it), build vs integrate, effort.

### HIGH — blocks majority of researchers from adopting

**H1. Reference / citation management**
- *What:* Add papers to a project (paste DOI / drop BibTeX / Zotero import); store CSL-JSON metadata; insert citations in markdown notes; generate a bibliography in a chosen style.
- *Why:* Every reference-manager survey (Zotero/Mendeley/Paperpile/Endnote) shows this is the table-stakes researcher workflow. A research webapp without citations is a glorified Notion clone.
- *Integrate:* `citation-js` (MIT, mature) for parsing + formatting + 7000+ CSL styles. Crossref REST API (free, no key) for DOI → metadata. Optional Zotero Web API import.
- *Effort:* ~1 week. Schema additions in Dexie + Supabase, paste-DOI flow, BibTeX import, render `@citekey` in markdown.

**H2. PDF viewer with highlights and notes that link back to the note**
- *What:* Click a PDF in a project → open in-app PDF reader → highlight passages → highlights appear as anchored quotes in the project's markdown notes.
- *Why:* Zotero 7's built-in PDF reader is the single most cited reason researchers stopped switching tools (multiple 2025 reviews). Glasp, PDF++, Hypothes.is all confirm demand.
- *Integrate:* `react-pdf` (MIT) + `react-pdf-highlighter` (MIT) on top of PDF.js. Store highlight rects + selected text + page in Dexie/Supabase keyed by file_id.
- *Effort:* ~1 week for v1 (highlights + notes pane). Add image-region highlights later.

**H3. Real collaboration (not just last-write-wins)**
- *What:* At minimum: invite a co-author to a project by email; they get read or write access; presence indicator; notes don't silently overwrite each other.
- *Why:* Notion, Paperpile, Overleaf, OSF, Benchling — every researcher tool that succeeded with groups has this. The user mentioned "a few co-authors initially" — they will hit overwrite-loss inside a week with current LWW sync.
- *Build + integrate:* Supabase RLS row-level rules for shared projects + invites table; for live editing of notes, Yjs (MIT) + y-supabase or `yjs` over Supabase realtime channels. Without CRDT, at least use Supabase realtime to lock-or-warn on concurrent edits.
- *Effort:* 1 week for share/invite/permissions; +1 week for CRDT live notes (defer).

**H4. Literature search inside the app (don't make users tab-switch)**
- *What:* In a project, "Find papers about X" → query Semantic Scholar → results card → "Add to project" → metadata + (if open access) PDF saved.
- *Why:* SciSpace/Elicit/ResearchRabbit all win on this exact loop. Tab-switching to Google Scholar / Zotero / browser → drag back is the #1 friction point in qualitative researcher reviews.
- *Integrate:* Semantic Scholar Graph API (free, no key, 200M papers, TLDR summaries included). Open-access PDF link comes back in the response.
- *Effort:* 2–3 days for v1 (search + add). +days for save-search-as-feed.

### MED — significant friction, will block some users

**M1. Export a project as Quarto / LaTeX / Word manuscript**
- *Why:* Quarto and Manubot prove that researchers want their notes → manuscript path. Without an export, PaperAssistant feels like a dead end.
- *Build:* Generate `index.qmd` + `references.bib` + figures folder from project. Optionally a `pandoc` server-side step on Vercel for PDF/DOCX.
- *Effort:* 3–5 days for Quarto/LaTeX/MD bundle export. Pandoc-on-Vercel adds 1–2 days.

**M2. Tags + saved-search "smart folders" across the whole library**
- *Why:* Paperlib, Zotero, Capacities all rely on this for finding "all 2024 figures tagged 'baseline'." Search is in PaperAssistant; tags + filters aren't.
- *Build:* In-house, on existing Dexie schema. Cheap.
- *Effort:* 2 days.

**M3. Versioning / snapshots of notes & files**
- *Why:* OSF and Git-based tools (Manubot, Quarto+GitHub) prove this is expected once researchers trust the tool with primary work. Currently PaperAssistant's LWW sync can lose work.
- *Build + integrate:* Lightweight per-note revision history table (immutable rows on each save). Use the existing GitHub push as the deeper archival path — every push tagged.
- *Effort:* 3–4 days.

**M4. ORCID + DOI minting via Zenodo for "publish a project snapshot"**
- *Why:* OSF made its name on this — researchers want a citable archived snapshot. Zenodo's API is free.
- *Integrate:* Zenodo REST API; ORCID OAuth.
- *Effort:* 3 days.

**M5. Connected Papers / citation graph for the project's reference list**
- *Why:* ResearchRabbit/Litmaps users explicitly want this view. Cheap to do once H4 is in place.
- *Integrate:* Semantic Scholar `/paper/{id}/references` and `/citations`; render with `react-force-graph` (MIT) or `cytoscape.js` (MIT).
- *Effort:* 3–4 days.

**M6. AI-assisted summary / "ask this PDF"**
- *Why:* Every 2025 tool review puts this in the top 3 features. SciSpace, Elicit, Paperpile AI, paperlib LLM extensions.
- *Integrate:* Anthropic / OpenAI API with the user's own key (bring-your-own-key avoids us paying for everyone). Embedding store with `pgvector` on Supabase.
- *Effort:* 1 week to do well (chunking PDFs, embeddings, RAG over a project).

### LOW — polish

- **L1. Mobile PWA polish + offline-first install prompt** — 2 days.
- **L2. Templates** (lit-review, experiment log, thesis chapter) — 1 day.
- **L3. Slash-command quick capture** like Tana/Capacities — 2–3 days.
- **L4. Backlinks / bidirectional links in markdown** like Obsidian — 3–4 days (parse `[[wikilinks]]`, store an index).
- **L5. Pomodoro / focus timer** — 1 day. (Many "academic productivity" tools bundle this.)
- **L6. Citation count + Open-Access badge on each paper** — half a day via Semantic Scholar.

---

## 3. Top 8 by impact / effort — proposed build order

Ordering is sequenced so each step unlocks or reinforces the next; not strictly impact-descending.

1. **H1 Citations (citation-js + Crossref)** — 1 wk. Foundation everything else depends on. Without a `Reference` entity in the data model, H2, H4, M1, M4, M5 are all blocked.
2. **H2 PDF reader + highlights** — 1 wk. Highest single-feature ROI per user testimony in 2025 reviews. Once references exist, attaching a PDF to a reference is natural.
3. **H4 In-app Semantic Scholar search** — 2–3 days. Trivially cheap given H1's reference schema; massive UX win.
4. **M5 Citation graph view** — 3–4 days. Free byproduct of H1 + H4 + Semantic Scholar's references endpoint.
5. **H3 Sharing + permissions (no CRDT yet)** — 1 wk. Before pushing to public users, multi-author projects must not lose data. Skip live-cursor CRDT for v1; just RLS + warn-on-conflict.
6. **M2 Tags + saved searches** — 2 days. Quality-of-life multiplier once libraries get big.
7. **M1 Quarto/LaTeX export** — 3–5 days. Once a project has references, figures, notes — this turns PaperAssistant into a manuscript-producing tool, not just a parking lot.
8. **M6 Ask-this-PDF (BYO-key)** — 1 wk. With H1+H2 in place, RAG over a project's PDFs is the unique-vs-Obsidian move. Don't try to compete with Elicit/SciSpace on corpus — compete on *your own corpus, in your project*.

Why this order: a researcher who shows up should be able to, in week 1, **paste a DOI, read the PDF with highlights, search Semantic Scholar to find related papers**. That's the smallest loop that beats "just use Zotero + Obsidian." Steps 5–8 then unlock co-authors, manuscript export, and AI — the things that pull a user from "interesting tool" to "I'd recommend this."

Deferred: H3-CRDT, M3 versioning, M4 Zenodo/ORCID, L1–L6.

---

## 4. Where to NOT rebuild — deep-link instead

- **Full reference manager UI** — Zotero already does this perfectly with a free local app + free 300MB sync + Web API + browser connector. Recommendation: **import from Zotero** (Web API + BibTeX) and **export back to Zotero**, but do not try to be a Zotero replacement. We are the "project workspace that knows about citations," not the "library of every paper I've ever read."
- **PDF storage at terabyte scale** — Supabase storage gets expensive fast. For heavy users, allow "link to Zotero file" or "link to Google Drive / Dropbox URL" instead of always uploading.
- **Citation graph visualization at scale** — Connected Papers and Litmaps are dedicated tools with caching infra we can't match. Deep-link out for the heavy-duty 500-node view; only render local project-scope graphs (≤50 nodes) in-app.
- **Manuscript writing engine** — Don't try to be Overleaf/Quarto. Export to those tools.
- **Systematic review screening** — Elicit's PRISMA pipeline is a year of work. Out of scope.
- **Wet-lab inventory** — eLabFTW already serves that audience well. Stay in dry/computational research.

---

## 5. OSS components to integrate (license-verified)

All MIT or equivalent permissive unless noted:

- **citation-js** (MIT) — BibTeX/RIS/DOI/Wikidata ↔ CSL-JSON ↔ 7000+ output styles. Active. https://github.com/citation-js/citation-js
- **react-pdf** (MIT) — PDF.js React wrapper. Active. https://github.com/wojtekmaj/react-pdf
- **react-pdf-highlighter** (MIT) — Highlight + note components on PDF.js. Active forks exist (-extended, -plus). https://github.com/agentcooper/react-pdf-highlighter
- **Yjs** (MIT) — CRDT for future live-collab phase. https://github.com/yjs/yjs
- **cytoscape.js** (MIT) or **react-force-graph** (MIT) — citation graph rendering.
- **pdf.js** (Apache-2.0, compatible with MIT distribution) — underlying PDF engine.
- **Semantic Scholar API** (no SDK needed; free, no key) — corpus + TLDRs + citation graph.
- **Crossref REST API** (free, no key) — DOI metadata.
- **Zotero Web API v3** + new **Zotero 7 local HTTP API** — for import/sync.

Repos to study but NOT fork (license-incompatible or too tightly coupled):
- **Paperlib** — GPL-3.0, Electron + Vue. We can read the architecture (scraper pipeline, RSS, smart filters) but cannot copy code into our MIT/permissive web app.

---

## 6. Key uncertainties & caveats

- ResearchRabbit's freemium pivot in late 2025 (acquired by Litmaps) is widely reported but the pricing tiers were still moving when last checked — verify before deep-linking.
- Zotero 7 local HTTP API was in beta in 2024; assumed stable but worth a smoke test before promising integration.
- Semantic Scholar API has historically had rate limits without a key (1 req/sec); fine for a personal app, may need a partner key if usage grows.
- Paperpile AI's collaboration / real-time-edit claims come from their marketing copy — I did not find independent verified user reports of conflict-free multi-user note editing.
- Tana, Capacities, Anytype are all moving fast; specific features cited (label properties, GPT-5, supertags) are 2025-current but the products are pre-1.0 in user experience.

---

## TL;DR

PaperAssistant has the chassis (projects, files, notes, sync, GitHub push). It is missing the four things every researcher tool of the last decade has proven indispensable: **citations, PDF highlights, in-app paper search, and safe co-authoring**. Build those four in 3–4 weeks (H1 → H2 → H4 → H3) using `citation-js`, `react-pdf-highlighter`, Semantic Scholar API, and Supabase RLS. After that, manuscript export (Quarto) and per-project RAG ("ask this PDF") differentiate from Obsidian+Zotero stacks. Do not try to replace Zotero, Connected Papers, or Elicit — deep-link to them instead.
