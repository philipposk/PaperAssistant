# PaperAssistant

A tidy workspace for putting together a research paper. You create a project, drop in your charts, tables, and documents, jot down notes, and browse everything in one clean, easy-to-read place. It works even when you're offline, and you can sign in to save a copy in the cloud so your work follows you between devices.

It's for anyone working on a research project who wants their figures, data, and writing organized in one spot instead of scattered across folders.

## What it does
- Lets you create separate projects for different papers
- Lets you upload your own figures, tables, and documents
- Lets you write and keep notes alongside your materials
- Shows everything in a clean, readable layout
- Works offline, and optionally syncs to the cloud when you sign in

## Status
Website / web app, version 0.1 — a rebuild that's still in progress. An older version is kept in the `legacy/` folder for reference.

---
### For developers
React 19 + Vite + TypeScript, Tailwind v4. Local storage via Dexie (IndexedDB); optional cloud sync via Supabase (Postgres + auth + storage). State with Zustand, routing with React Router. Layout: `app/` is the v2 app, `examples/paper-a/` is a demo dataset, `frontend mockup/` is design reference, `legacy/` is the archived static site, `supabase/` holds schema migrations. Run:

```bash
cd app
npm install
npm run dev      # http://localhost:5173
```

See `CHANGELOG.md` and `DEPLOY.md` for more. License: MIT.
