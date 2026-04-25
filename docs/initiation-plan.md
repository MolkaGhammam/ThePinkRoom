# The Pink Room — Initiation Plan

**Companion to:** [the-pink-room-spec.md](./the-pink-room-spec.md)
*Last updated: April 25, 2026*

---

## Purpose

This document covers the **foundational base** of the application — the scaffolding, infrastructure, and conventions that everything else will be built on. It deliberately stops *before* any user-facing feature CRUD (services, staff, clients, appointments, calendar, payments). Those features have their own build order in §7 of the spec and will be planned in a follow-up document once this base is in place.

The goal of the initiation phase is simple: **at the end of it, a developer can log in to the deployed app, see a translated empty shell that knows which salon they belong to, and start adding feature screens with confidence that auth, tenancy, i18n, and observability already work end-to-end.**

No business features. No CRUD screens. No calendar. Just a rock-solid base.

---

## Guiding Principles

1. **Each phase ships independently.** At the end of every phase, the app must build, deploy, and behave correctly. No half-finished phases bleeding into the next.
2. **No premature feature work.** If a task feels like a feature (e.g., "build the client list"), it belongs in a later document, not this one.
3. **Verify before moving on.** Each phase has explicit verification steps. Do not start phase N+1 until phase N's checks pass.
4. **Conventions are decided in the base, not retrofitted.** Naming, folder structure, error handling shape, type generation — all settled here so feature work doesn't relitigate them.
5. **The design kit is referenced, not built.** A separate design kit folder will be added later and will provide UI primitives. This plan only ensures the project is *ready* to consume it (Tailwind configured, shadcn/ui installed, theme tokens in the right place). Actual visual polish is part of feature work.

---

## Phase 0 — Decisions & Prerequisites

Resolve before writing any code. None of these are coding tasks; they are setup and account creation.

- [ ] **Repo & branching.** Confirm the existing git repo is the source of truth. Decide on a default branch name (likely `main`) and whether feature branches will be used from day one.
- [ ] **Supabase project.** Create a new Supabase project for The Pink Room. Note the project URL, anon key, and service role key. Decide on the region (closest to Tunisia — likely `eu-west-2` or `eu-central-1`).
- [ ] **Vercel project.** Create the Vercel project, linked to the git repo. Do not deploy yet.
- [ ] **Sentry project.** Create a Next.js project in Sentry. Note the DSN.
- [ ] **Domain.** Decide whether to use a custom domain on day one or stay on `*.vercel.app` until launch. Either is fine; just decide.
- [ ] **Environment variable inventory.** Make a list of every secret/config the app will need (Supabase URL, Supabase anon key, Supabase service role key, Sentry DSN, default locale). This becomes the `.env.example` later.
- [ ] **Node & package manager.** Pin a Node version (LTS, currently Node 22) and pick a package manager (`pnpm` recommended for speed and disk usage). Document both in the README and `.nvmrc` / `package.json`.

**Done when:** all accounts exist, all keys are in a password manager, and the env var list is written down.

---

## Phase 1 — Project Scaffolding

Stand up the Next.js project with the chosen stack. No auth, no DB calls — just an app that builds and renders a placeholder page.

### Tasks

- [ ] Initialize Next.js 15 with the App Router, TypeScript, and ESLint.
- [ ] Install and configure Tailwind CSS. Add `rtl:` variant support and confirm RTL utilities work with a quick test.
- [ ] Install shadcn/ui CLI and initialize it. Drop in two or three primitive components (`Button`, `Input`) just to confirm the pipeline works.
- [ ] Set up the folder structure:
  - `src/app/` — App Router routes
  - `src/components/` — shared components (will be supplemented by the design kit later)
  - `src/lib/` — utilities, clients (Supabase, Sentry), helpers
  - `src/messages/` — i18n JSON files
  - `src/types/` — generated and hand-written types
- [ ] Add `.env.example` with every key from Phase 0's inventory. Add `.env.local` to `.gitignore`.
- [ ] Configure path aliases (`@/*` → `src/*`).
- [ ] Set up Prettier and a baseline ESLint config. Pick rules and stick with them.
- [ ] Add a minimal placeholder home page that just renders the salon name from a hardcoded constant.

### Verification

- `pnpm dev` runs on `localhost:3000` and renders the placeholder.
- `pnpm build` succeeds with zero errors and zero warnings.
- `pnpm lint` and `pnpm format:check` pass.

---

## Phase 2 — Database Schema & RLS

Build the entire data model from §5 of the spec, with RLS turned on from the first migration. No application code touches the database yet — this phase is pure SQL and Supabase configuration.

### Tasks

- [ ] Set up Supabase migrations locally (Supabase CLI). Migrations live in `supabase/migrations/` and are committed to git.
- [ ] Write the initial migration: all tables from §5.1 (`salons`, `salon_closures`, `users`, `services`, `clients`, `appointments`, `appointment_services`, `payments`).
  - UUID primary keys (`gen_random_uuid()`).
  - `created_at`, `updated_at`, `deleted_at` (`timestamptz`) on every table.
  - `salon_id` on every tenant-scoped table including join tables.
  - All temporal columns as `timestamptz`.
- [ ] Add the indexes from §5.2: `(salon_id, start_at)` on appointments, `(staff_user_id, start_at)` on appointments, `(salon_id, phone)` on clients.
- [ ] Add a trigger to auto-update `updated_at` on row update.
- [ ] Enable RLS on every table.
- [ ] Write RLS policies:
  - Helper function `auth.salon_id()` reading the user's `salon_id` from the `users` table.
  - Helper function `auth.role()` reading the user's role.
  - Generic policy: a row is visible only if `salon_id = auth.salon_id()` AND `deleted_at IS NULL`.
  - Per-table policies for INSERT/UPDATE/DELETE matching the permission rules in §4.2 and §6.8 (admin-only payment edits, etc.).
- [ ] Seed The Pink Room: one row in `salons` with `timezone = 'Africa/Tunis'`, sensible default `opening_hours`, default appointment duration.
- [ ] Manually create the first admin user in Supabase Auth and link them to the salon row in the `users` table.

### Verification

- A SQL test (run as the admin role) confirms the admin can read their own salon's rows.
- A SQL test (run as a synthetic second salon) confirms cross-salon reads return zero rows.
- A staff-role user cannot edit a `payments` row created by another user (RLS denial).
- All migrations apply cleanly to a fresh database.

---

## Phase 3 — Supabase Client & Type Generation

Wire the application to the database with full type safety. Still no UI features — just the plumbing.

### Tasks

- [ ] Install `@supabase/supabase-js` and `@supabase/ssr`.
- [ ] Create three client factories in `src/lib/supabase/`:
  - `browser.ts` — for client components.
  - `server.ts` — for server components and route handlers (reads cookies).
  - `service.ts` — service-role client for trusted server-only operations (used sparingly).
- [ ] Generate TypeScript types from the database schema (`supabase gen types typescript`). Commit the generated file to `src/types/database.ts`.
- [ ] Add a `pnpm db:types` script that regenerates types from the linked Supabase project.
- [ ] Create a thin domain-level type layer in `src/types/domain.ts` that re-exports row types with friendlier names (e.g., `Appointment`, `Service`).
- [ ] Add a single placeholder server-component query (e.g., "fetch the salon row") to confirm the client works end-to-end. Delete it before moving on if it's not useful.

### Verification

- A server component can fetch the seeded salon row and render its name.
- Type generation script runs cleanly and produces no diff when the schema is unchanged.
- No `any` types in the Supabase plumbing.

---

## Phase 4 — Authentication

Email-and-password login wired through Supabase Auth, with session handling that survives PWA reloads.

### Tasks

- [ ] Build the login page (`/login`) — email + password form. No styling polish; functional only.
- [ ] Build the password reset flow (request + confirm pages).
- [ ] Build the logout action.
- [ ] Add Next.js middleware that:
  - Refreshes the Supabase session on every request.
  - Redirects unauthenticated users to `/login` for protected routes.
  - Redirects authenticated users away from `/login`.
- [ ] Create a server-side helper `getCurrentUser()` that returns the authenticated user joined with their `users` row (so role and `salon_id` are available everywhere).
- [ ] Build a tiny placeholder authenticated home page (`/`) that shows "Logged in as {name} ({role}) at {salon name}" and a logout button.

### Verification

- Logging in with the seeded admin redirects to `/` and shows the correct name, role, and salon.
- Refreshing the page keeps the session.
- Logging out clears the session and redirects to `/login`.
- Hitting `/` while logged out redirects to `/login`.
- Password reset email is delivered and the new password works.

---

## Phase 5 — Internationalization Shell

French and Arabic with full RTL support, configured before any user-facing copy is written.

### Tasks

- [ ] Install `next-intl` and configure it for the App Router (`[locale]` segment).
- [ ] Create `src/messages/fr.json` and `src/messages/ar.json` with the strings used so far (login form, logout button, placeholder home page). French is the default.
- [ ] Set the `<html lang>` and `<html dir>` attributes from the active locale (`dir="rtl"` for Arabic).
- [ ] Persist locale preference on the `users` row; fall back to `salons.locale_default` for new users.
- [ ] Build a minimal locale switcher in the placeholder header.
- [ ] Verify Tailwind's `rtl:` variants flip layout correctly with a quick visual test (e.g., a button with `rtl:rotate-180` icon).
- [ ] Establish the convention: **no hardcoded user-facing strings anywhere.** Add an ESLint rule or pre-commit check if practical; otherwise enforce by review.

### Verification

- Switching to Arabic flips the page direction and translates every visible string.
- Switching back to French restores LTR.
- A new user inherits the salon's default locale.
- No hardcoded strings remain in the auth pages.

---

## Phase 6 — Observability & Error Handling

Sentry, structured error responses, and the conventions for error handling everywhere else in the app.

### Tasks

- [ ] Install and configure `@sentry/nextjs`. Add the wizard-generated config files; verify the source map upload works on production builds.
- [ ] Configure Sentry to scrub client PII (names, phone numbers, emails, Instagram handles, free-form notes) using `beforeSend`. Attach the authenticated user's UUID via `Sentry.setUser({ id })`.
- [ ] Add a global error boundary (`error.tsx`) at the root of the app and a `not-found.tsx`.
- [ ] Define a tiny `Result<T>` or discriminated-union convention for server-action / route-handler return shapes (success vs. error). Document it in a one-paragraph note in the README.
- [ ] Throw a deliberate error in dev to confirm Sentry captures it with the right user context and **no client PII in scope/breadcrumbs**.

### Verification

- A test error in production shows up in Sentry within 60 seconds.
- The Sentry event includes the user UUID and does **not** include any client PII fields.
- Triggering a 404 renders the localized not-found page.
- Throwing in a server component renders the localized error boundary.

---

## Phase 7 — PWA Shell

Make the app installable. No service worker logic beyond the basics — true offline is future work.

### Tasks

- [ ] Add `manifest.webmanifest` with name, short name, theme color, background color, icons (placeholder icons are fine for now), and `display: "standalone"`.
- [ ] Add a minimal service worker that caches the app shell and falls through to the network for everything else (Workbox or hand-rolled — keep it tiny).
- [ ] Add an offline indicator component (a small banner) that reads `navigator.onLine` and listens for `online`/`offline` events.
- [ ] Add the iOS-specific meta tags for installation (`apple-touch-icon`, `apple-mobile-web-app-capable`, etc.).
- [ ] Add a placeholder splash-screen-friendly background.

### Verification

- The install prompt appears in Chrome on Android.
- "Add to Home Screen" works on iOS Safari and the icon, name, and standalone display all look correct.
- Killing the network shows the offline banner; restoring it hides it.
- The cached shell loads instantly on a second visit.

---

## Phase 8 — Deployment & Smoke Test

Get the foundation live on Vercel before any feature work starts. Future features deploy on top of a known-good base, not into the unknown.

### Tasks

- [ ] Configure Vercel environment variables for production and preview environments.
- [ ] Wire the Sentry source map upload into the Vercel build.
- [ ] Push to `main`; confirm the production deploy succeeds.
- [ ] Configure preview deploys for pull requests.
- [ ] Smoke-test the deployed app end-to-end (see verification below).
- [ ] Add a short `README.md` with: how to run locally, how to apply migrations, how to regenerate types, env var inventory, and links to Vercel/Supabase/Sentry dashboards.

### Verification

- Production URL serves the app over HTTPS.
- Logging in as the admin works on the deployed app.
- Switching language works on the deployed app.
- A test error from production reaches Sentry.
- The PWA can be installed from the deployed URL.

---

## Out of Scope for This Plan

Listed explicitly so they don't sneak in:

- Service catalog CRUD
- Staff management UI
- Client records UI
- Appointment creation, editing, status lifecycle
- Calendar (daily / weekly views)
- Payment recording UI
- Settings screens (salon hours editor, profile editor)
- Audit log viewer
- Any non-trivial visual design — the design kit will be applied during feature work, not now

These are the subject of the **next** plan, which will be written once this initiation phase is complete.

---

## Design Kit Note

A design kit (separate folder, with components and instructions) will be provided before feature work begins. This initiation plan only needs to ensure the project is **ready to consume it**:

- Tailwind is configured and working.
- shadcn/ui is initialized.
- `src/components/` exists and is ready to host kit components.
- Theme tokens (colors, fonts, spacing) live in `tailwind.config.ts` and `globals.css` so the kit can drop in clean overrides.

When the kit is provided, instructions on how to integrate it will be given at that point. Do not stub it in or guess at its shape now.

---

## Definition of Done for Initiation

The initiation phase is complete when **all** of the following are true:

1. The deployed app at the production URL renders an authenticated placeholder home page.
2. An admin can log in, log out, reset their password, and switch languages.
3. The database has every table, index, and RLS policy from the spec, and a fresh database can be rebuilt from migrations alone.
4. Sentry receives errors from production with user UUIDs and no client PII.
5. The app is installable as a PWA on iOS and Android.
6. A second developer (hypothetical) can clone the repo, run `pnpm install && pnpm dev`, and have a working local app within 15 minutes by following the README.

Once all six are checked, feature work can begin.
