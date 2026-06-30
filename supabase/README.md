# PaperAssistant schema on the shared 6x7 platform

PaperAssistant does **not** own a Supabase project of its own. It lives in the `paperassistant` schema of the single shared **6x7** project (project ref `fmrnqepyyjucnfbrqawl`, EU central), alongside every other app on `*.6x7.gr`. See `~/.claude/plans/3-i-think-and-cozy-hejlsberg.md` for the platform-wide plan.

Architecture in one paragraph: one Supabase project holds `auth.users` + `public.profiles` + `public.app_access`, then one **schema per app** (`paperassistant`, `school`, `digestive`, …). Every per-app table has `user_id uuid references auth.users` + RLS scoped through `project_members`. Sign-in lives at `6x7.gr` and writes a JWT cookie scoped to `.6x7.gr` so every sibling subdomain reads the same session — PaperAssistant is just one of those subdomains.

## Apply migrations

The migrations have already been applied via Supabase MCP. The SQL is mirrored in `migrations/` for repeatability / version control. Order:

1. `0001_paperassistant_schema.sql` — schema + 7 tables + triggers
2. `0002_paperassistant_rls.sql` — member-aware RLS policies
3. `0003_paperassistant_storage.sql` — `paperassistant-files` bucket + per-user policies
4. … through `0007_paperassistant_ai_usage.sql`
5. `0008_paperassistant_invite_rls_fix.sql` — drops permissive invite SELECT policy; adds `get_invite_by_token` RPC

To re-apply (e.g. after blowing away and recreating the 6x7 project), paste each into Supabase Dashboard → SQL Editor in order, or run `supabase link` then `supabase db push` from this repo (requires CLI linked to project ref `fmrnqepyyjucnfbrqawl`).

The pre-rebuild migrations that targeted the legacy `public` schema in PaperAssistant's own Supabase project are kept under `legacy-public-schema/` for reference.

## Expose the schema via PostgREST

Postgres allows the table to exist, but the auto-generated REST API only sees schemas listed under **Settings → API → Exposed schemas**. Add `paperassistant` there in the Supabase Dashboard (one-time, per project).

## Auth configuration (one-time, per project)

In the Supabase dashboard → **Authentication**:

- **URL Configuration → Site URL:** `https://6x7.gr`
- **URL Configuration → Redirect URLs:** add `https://*.6x7.gr/**`, `http://localhost:5173`, `http://localhost:5174`
- **Providers → Email:** enable, turn "Confirm email" → OFF so the magic-link flow is one-step
- **Providers → Google:** enable, paste your Google OAuth client ID + secret (see [Supabase Google docs](https://supabase.com/docs/guides/auth/social-login/auth-google))

The PaperAssistant client (`app/src/lib/cookieStorage.ts`) writes the session under cookie name `sb-6x7-auth` on `.6x7.gr` so every sibling subdomain reads the same session.

## Schema overview

- `paperassistant.projects` — top-level project per user
- `paperassistant.files` — file metadata; blobs live in `storage.objects` bucket `paperassistant-files` at `{user_id}/{project_id}/{file_id}`
- `paperassistant.notes` — markdown notes per project
- `paperassistant."references"` — citations (CSL-JSON), with optional `pdf_file_id` link
- `paperassistant.highlights` — PDF highlights anchored to a file
- `paperassistant.project_members` — owner/editor/viewer membership
- `paperassistant.project_invites` — email + token-based invitations

RLS: every member of a project sees all rows; editors + owners write; only owners can delete the project itself.

## Frontend wiring

- `app/.env.local` → `VITE_SUPABASE_URL=https://fmrnqepyyjucnfbrqawl.supabase.co` + the publishable anon key from **Settings → API**.
- On Vercel: the Supabase ↔ Vercel integration auto-injects these on every deploy once the Vercel project is linked to the 6x7 Supabase project. No manual paste.
- `app/src/lib/supabase.ts` passes `db.schema = 'paperassistant'` so every `.from('files')` etc. transparently hits `paperassistant.files`.
