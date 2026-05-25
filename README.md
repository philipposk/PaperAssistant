# PaperAssistant

A research-paper workspace webapp. Create projects, upload your own figures, tables, and documents, write markdown notes, browse it all in a clean editorial interface. Works fully offline; signs into the cloud to sync.

## Status

v0.1 — rebuild in progress. The previous static Paper-A portal lives in [`legacy/`](legacy/) for reference; the new app lives in [`app/`](app/).

## Develop

```bash
cd app
npm install
npm run dev
```

App runs at `http://localhost:5173` (or 5174 if 5173 is taken).

Production build:

```bash
npm run build
npm run preview
```

## Stack

- React 19 + Vite 8 + TypeScript
- Tailwind v4
- Dexie (IndexedDB) for local storage
- Supabase (Postgres + auth + storage) for cloud sync — optional
- Zustand for app state
- React Router

## Layout

- `app/` — the v2 webapp
- `examples/paper-a/` — demo research dataset (PHEV / OBFCM analysis)
- `frontend mockup/` — design reference HTML
- `legacy/` — old static site (archived)
- `supabase/` — schema migrations (TBD)

## License

MIT
