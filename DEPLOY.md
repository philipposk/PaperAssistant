# Deploying PaperAssistant to Vercel

## One-time setup

1. Sign in to [vercel.com](https://vercel.com) with your GitHub account.
2. Click **Add New → Project**, pick the `philipposk/PaperAssistant` repo, click **Import**.
3. Configure (Vercel will auto-detect most of this from `vercel.json`):
   - **Framework Preset:** `Other`
   - **Root Directory:** leave as `.` (the repo root)
   - **Build Command:** `cd app && npm install && npm run build` (auto-filled)
   - **Output Directory:** `app/dist` (auto-filled)
4. Click **Deploy**. First deploy takes ~1–2 minutes.

You now have a URL like `paperassistant-xxxxx.vercel.app`. Every push to `main` redeploys automatically.

## Connect the custom domain `paper_assistant.6x7.gr`

1. In Vercel project → **Settings → Domains**, click **Add**, enter `paper_assistant.6x7.gr`.
2. Vercel will show DNS records to add at your domain registrar (6x7.gr provider):
   - Either a `CNAME` record on `paper_assistant` → `cname.vercel-dns.com`
   - Or `A` records to Vercel's IPs
3. Add the records at 6x7.gr's DNS panel. Wait 5–15 minutes for propagation.
4. Vercel auto-issues a Let's Encrypt SSL cert once DNS resolves.

## Disable the old GitHub Pages site

After Vercel is live and the domain points there:

1. Go to repo on GitHub → **Settings → Pages**.
2. Under "Build and deployment" → **Source**, pick **None**.
3. Save. This stops the dead 404 page from serving.

The `CNAME` file in the repo root is harmless once GitHub Pages is off, but you can delete it if you prefer.

## Environment variables (Supabase, later)

When you add cloud sync (Tasks #15 + #18), set these in Vercel → **Settings → Environment Variables**:

- `VITE_SUPABASE_URL` — from your Supabase project's API settings
- `VITE_SUPABASE_ANON_KEY` — same place

After saving, trigger a redeploy (or just push a commit). The app reads these at build time via Vite.

For local dev: copy `app/.env.example` to `app/.env.local` and fill in the same values.

## Local preview of a production build

```bash
cd app
npm run build
npm run preview
```
