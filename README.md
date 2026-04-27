# The Pink Room

Appointment management PWA for nail salons. See [`docs/the-pink-room-spec.md`](docs/the-pink-room-spec.md) for the full product spec and [`docs/initiation-plan.md`](docs/initiation-plan.md) for the build plan.

---

## Running locally

**Prerequisites:** Node 20, pnpm 10+

```bash
pnpm install
cp .env.example .env.local   # fill in your values
pnpm dev                     # http://localhost:3000
```

The app opens at `/` and redirects to `/fr` (default locale).

---

## Environment variables

Copy `.env.example` to `.env.local` and fill in:

| Variable | Where to find it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry → Project → Settings → SDK Setup |
| `SENTRY_AUTH_TOKEN` | Sentry → Settings → Auth Tokens |
| `SENTRY_ORG` | Sentry organization slug |
| `SENTRY_PROJECT` | Sentry project slug |
| `NEXT_PUBLIC_SITE_URL` | Your deployed URL (e.g. `https://thepinkroom.vercel.app`) |
| `SUPABASE_ACCESS_TOKEN` | supabase.com/dashboard/account/tokens — for `pnpm db:types` only |

---

## Database

Migrations live in `supabase/migrations/`. See [`supabase/README.md`](supabase/README.md) for how to apply them and provision the first admin user.

**Regenerate TypeScript types after a schema change:**

```bash
SUPABASE_ACCESS_TOKEN=<token> pnpm db:types
```

---

## Scripts

| Command | What it does |
|---|---|
| `pnpm dev` | Start dev server |
| `pnpm build` | Production build |
| `pnpm typecheck` | TypeScript check without emitting |
| `pnpm lint` | ESLint |
| `pnpm format` | Prettier write |
| `pnpm format:check` | Prettier check (used in CI) |
| `pnpm db:types` | Regenerate `src/types/database.ts` from live Supabase schema |

---

## Deploying to Vercel

1. Connect the repo to a Vercel project.
2. Set all environment variables listed above in Vercel → Settings → Environment Variables.
3. Push to `main` — Vercel deploys automatically.
4. Set `NEXT_PUBLIC_SITE_URL` in Vercel to the production URL (needed for password-reset redirect links).

---

## Design system

The UI is built on a custom design kit at `design-kit/`. See `UI/instructions.md` for how to use it and `design-kit/CLAUDE.md` for the non-negotiable visual rules. Import all components via:

```ts
import { Button, TopBar, Card } from "@kit";
```

---

## PWA icons

Placeholder icon slots are in `public/icons/`. Before launch, replace them with:

- `icon-192.png` — 192×192 px
- `icon-512.png` — 512×512 px

Both should use the `maskable` purpose (safe zone: center 80%).
