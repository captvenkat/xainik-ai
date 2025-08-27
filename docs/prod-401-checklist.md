# Prod 401 Checklist (Vercel vs App)

If **every** route (even `/`) or `/_vercel/...` returns **401**, that's almost always **Vercel Protection** (password/SSO) denying requests **before** our app/middleware runs.

## Quick test
```bash
bash scripts/prod-diagnose.sh https://<your-prod-host>.vercel.app
```
If you see `WWW-Authenticate: Basic realm="Vercel"` or 401 on `/_vercel/insights/script.js`, it's Vercel Protection.

## Fix
Vercel Dashboard → Project → **Settings → Protection**
- Disable Production / Preview **Protection**, or
- Authenticate (basic auth) to get a bypass cookie in your browser.

## After disabling
- `__health` returns 200 JSON
- `__debug/headers` shows request headers
- Our middleware headers (e.g. `x-route-reason`) appear on protected routes

## Sanity envs (prod)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server only)
- `NEXT_PUBLIC_SITE_URL`
- `SUPABASE_REDIRECT_URL=https://<your-domain>/auth/callback`
