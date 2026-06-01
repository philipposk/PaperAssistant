# Supabase schema for PaperAssistant

Migrations run in order against your Supabase Postgres. They define the cloud-sync schema, row-level security, and the file storage bucket.

## Apply

Two options:

**A. Supabase Dashboard (easiest)**
1. Create a project at [supabase.com](https://supabase.com) (free tier is fine).
2. Open **SQL Editor → New query**.
3. Paste `migrations/0001_init.sql`, click **Run**. Then `0002_storage.sql`.
4. Open **Settings → API**, copy:
   - `Project URL` → `VITE_SUPABASE_URL`
   - `anon public` key → `VITE_SUPABASE_ANON_KEY`
5. Paste those into Vercel → Settings → Environment Variables. Redeploy.

**B. Supabase CLI**
```bash
supabase link --project-ref <your-ref>
supabase db push   # applies migrations in order
```

## Enable auth providers

In Supabase dashboard → **Authentication → Providers**:

- **Email**: enable, turn ON "Confirm email" → "Disabled" so magic-link is one-step.
- **Google**: enable, paste your Google OAuth client ID + secret (see [Supabase Google docs](https://supabase.com/docs/guides/auth/social-login/auth-google)).

Set **Authentication → URL Configuration → Site URL** to your Vercel URL (e.g. `https://paperassistant.6x7.gr`). Add `http://localhost:5173` and `http://localhost:5174` to **Redirect URLs** for local dev.

## Schema overview

- `projects (id, user_id, name, description, color, created_at, updated_at)`
- `files (id, project_id, user_id, name, mime, size_bytes, storage_path, tags[], created_at, updated_at)` — bytes in Storage bucket `files`
- `notes (id, project_id, user_id, title, markdown, created_at, updated_at)`

RLS: every row is scoped to `auth.uid() = user_id`. Anonymous users see nothing in the cloud — they keep using the local-only Dexie store.
