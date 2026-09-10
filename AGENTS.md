<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

# Base44 Dev Environment

## Stack
- **Framework**: TanStack Start (SSR) + Vite 8 + React 19 + TypeScript
- **Package manager**: Bun (bun.lock), but the Base44 compose uses npm (node:22-slim)
- **Backend**: Supabase (remote — credentials in `.env`, publishable keys only)
- **Styling**: Tailwind CSS 4 + shadcn/ui (new-york style)

## Running
```sh
docker compose -f docker-compose.base44.yml up -d --build
```
The app is served on port 3000. Vite dev server runs with `--host 0.0.0.0 --port 3000 --strictPort`.

## Environment
- `.env` contains Supabase publishable keys (`SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `VITE_*` variants). These are public client-side keys, committed to the repo.
- `SUPABASE_SERVICE_ROLE_KEY` is NOT needed — `client.server.ts` is not imported by the main app flow.
- `__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS` is passed bare from the platform so Vite accepts the preview hostname.

## App overview
"Nimbus" — a personal dashboard with notes, habits (streak tracking), and daily stats. Single route (`/`) in `src/routes/index.tsx`. Data access via `src/lib/dashboard.ts` using the client-side Supabase client.

## Notes
- `vite.config.ts` uses `@lovable.dev/vite-tanstack-config` wrapper which bundles TanStack devtools, React plugin, Tailwind, Nitro, and sandbox detection.
- `allowedHosts: true` in vite config allows the rotating preview hostname.
- Supabase migration in `supabase/migrations/` creates notes, habits, and habit_checks tables with permissive RLS policies.
