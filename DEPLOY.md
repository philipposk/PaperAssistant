# Deploying PaperAssistant to Vercel

PaperAssistant is one of the 13 apps on the shared `6x7.gr` platform. It uses the single shared Supabase project (`6x7`, ref `fmrnqepyyjucnfbrqawl`) — see `~/.claude/plans/3-i-think-and-cozy-hejlsberg.md` and `supabase/README.md`.

## 1. Create the Vercel project (one-time)

1. Sign in to [vercel.com](https://vercel.com) with your GitHub account.
2. Click **Add New → Project**, pick the `philipposk/PaperAssistant` repo, click **Import**.
3. Vercel auto-detects `vercel.json`:
   - **Framework Preset:** `Other`
   - **Root Directory:** `.` (repo root)
   - **Build Command:** `cd app && npm install && npm run build`
   - **Output Directory:** `app/dist`
4. Click **Deploy**.

You get a temporary URL like `paperassistant-xxxxx.vercel.app`. Every push to `main` redeploys.

## 2. Link to the shared 6x7 Supabase project

In the Vercel project → **Settings → Integrations → Supabase** (or the Vercel ↔ Supabase integration installed at the account level):

- Pick the **6x7** Supabase project (ref `fmrnqepyyjucnfbrqawl`).
- Pick **Apply to: Production, Preview, Development**.

Vercel auto-injects on every deploy:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server-side only — PaperAssistant doesn't use it)
- `POSTGRES_URL`, `POSTGRES_PRISMA_URL`, `POSTGRES_URL_NON_POOLING`

Vite needs the `VITE_*` prefix, not `NEXT_PUBLIC_*`. Add two mirrors in **Settings → Environment Variables** (Production + Preview + Development):

- `VITE_SUPABASE_URL` = `https://fmrnqepyyjucnfbrqawl.supabase.co`
- `VITE_SUPABASE_ANON_KEY` = the publishable anon key from **Supabase dashboard → Settings → API**

(These can also be hard-coded since the anon key is public — see `app/.env.example`. Redeploy after setting.)

## 3. Connect the custom domain `paperassistant.6x7.gr`

1. Vercel project → **Settings → Domains** → add `paperassistant.6x7.gr`.
2. Vercel shows the CNAME record:
   - **Type:** `CNAME`
   - **Name:** `paperassistant`
   - **Value:** `cname.vercel-dns.com`
3. Add that record at the 6x7.gr DNS panel. TTL 300 or Auto.
4. Wait 5–15 min for propagation. Vercel auto-issues a Let's Encrypt SSL cert.

## 4. Disable the old GitHub Pages site

Once Vercel + domain are live:

1. https://github.com/philipposk/PaperAssistant → **Settings → Pages**.
2. **Source** → **None** → **Save**.

## 5. Configure Supabase auth (one-time, per shared project)

In Supabase dashboard → **Authentication**:

- **URL Configuration → Site URL:** `https://6x7.gr`
- **Redirect URLs:** add `https://*.6x7.gr/**`, `http://localhost:5173`, `http://localhost:5174`
- **Providers → Email:** enable, "Confirm email" OFF
- **Providers → Google:** enable + paste OAuth client credentials

In **Settings → API → Exposed schemas:** add `paperassistant` so the JS client can `.from('files')` against `paperassistant.files`.

## 6. Local dev

```bash
cd app
npm install
cp .env.example .env.local   # already filled with the shared 6x7 keys
npm run dev                  # http://localhost:5173
```

On localhost the session is stored in `localStorage` (cookie-domain `.6x7.gr` doesn't apply). On `paperassistant.6x7.gr` it switches to a cookie that every sibling app on `*.6x7.gr` reads as the same session.

## Local preview of a production build

```bash
cd app
npm run build
npm run preview
```
