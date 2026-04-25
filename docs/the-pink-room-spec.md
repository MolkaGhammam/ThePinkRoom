# The Pink Room — Appointment Management PWA

**Project Specification Document**
*Last updated: April 25, 2026*

---

## 1. Project Overview

### 1.1 The Problem

Nail salon owners and beauty professionals face significant operational challenges:

- **Reservations scattered across Instagram DMs and phone calls** — no centralized system
- **Paper-based or Excel record keeping** — prone to errors, hard to search, easy to lose
- **Scheduling conflicts** — double bookings, overlapping appointments
- **No-shows and last-minute cancellations** — a major revenue loss with no mitigation

### 1.2 The Solution

A **Progressive Web App (PWA)** providing a complete internal appointment management system for nail salons and beauty professionals. The app serves two user types:

- **Admin (salon owner)** — full access to everything: services, staff, clients, appointments, payments, reports
- **Staff (employees)** — restricted access: sees only their own schedule, own clients, and own appointments

Clients **do not** have access to the app. This is a deliberate product decision: in-app client booking was researched and rejected as not a good fit for this market.

### 1.3 Target Market

- **Initial target:** The Pink Room, a specific nail salon in Tunisia
- **Long-term vision:** Scalable SaaS product for all beauty salons and similar service-based businesses
- **Primary market:** Tunisia (French + Arabic from day one, additional languages later)

### 1.4 Product Philosophy

**Ship small, build on solid foundations.**

The MVP is deliberately minimal — we will not overwhelm the first client with features they didn't ask for. However, the underlying architecture (database schema, authentication, multi-tenancy, i18n) is built to support the long-term SaaS vision from day one. Features we will build later are noted in this document so they are not forgotten, and architectural decisions that make them cheap to add later are called out explicitly.

---

## 2. Scope

### 2.1 MVP — Build Now

The MVP covers exactly what The Pink Room needs to replace their current Instagram-plus-Excel workflow:

1. **Authentication & roles** — admin and staff login
2. **Salon (tenant) setup** — every record in the system is scoped to a salon
3. **Service catalog** — name, duration, price
4. **Staff management** — admin creates staff accounts and sets their working hours
5. **Client records** — contact info, socials, acquisition channel, notes, auto-tracked visit history
6. **Appointments** — multi-service, assigned to a staff member, with lifecycle status
7. **Calendar view** — daily and weekly views, scoped by role
8. **Payment status** — paid / unpaid / deposit marker per appointment
9. **Languages** — French and Arabic with full RTL support
10. **PWA behavior** — installable, mobile-first, fast loading with cached shell

### 2.2 Future — Mentioned, Not Built

Listed here so we do not forget them. Most can be added later without database or architectural changes. A few require minimal preparation now, which is explicitly called out in the architecture section.

- **Client-facing read-only public view** — clients see available slots, salon info, and announcements without login. No interactions, no bookings.
- **Notification & reminder system** — SMS, WhatsApp, Instagram DM, email. Each channel is its own integration. Manual WhatsApp deep links (`wa.me/...`) may be added earlier as a cheap stopgap.
- **No-show mitigation tooling** — no-show rate per client, automated flagging, deposit requirements.
- **Advanced reports** — most popular service, no-show rate, revenue per staff, month-over-month trends, cohort analysis.
- **Self-serve salon signup & onboarding** — admins create their own accounts and provision their salon without developer involvement.
- **Tiered SaaS plans & billing** — different salons pay for different feature tiers; integrated billing.
- **Staff working hours & availability** — modeling who works when, used to drive overlap warnings and an "available staff" view. Deliberately deferred for MVP simplicity (the owner already knows the team's schedule).
- **Staff time off and vacation management** — one-off closures, multi-day absences.
- **Salon closures UI** — surfacing the `salon_closures` table to admins so they can mark public holidays and one-off closed days. The table exists from day one (see §5.1) so adding the UI later is purely frontend work.
- **True offline mode** — write queueing and conflict resolution when multiple staff edit offline.
- **Additional languages** — English and beyond.
- **Additional roles** — manager, receptionist, etc.
- **Audit log UI** — viewing who changed what and when. Data is recorded from day one; only the UI is future work.

---

## 3. Tech Stack

### 3.1 Chosen Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js 15 (App Router)** | Fullstack in one codebase, strong PWA support, server components reduce mobile JS payload |
| Language | **TypeScript** | Type safety is essential for a solo developer maintaining this long-term |
| Database & Backend | **Supabase** (Postgres + Auth + Storage + Realtime) | Row-level security makes multi-tenancy safe by default; free tier is enough for The Pink Room indefinitely |
| Styling | **Tailwind CSS** | `rtl:` variants make Arabic support straightforward |
| Components | **shadcn/ui** | Own the code, no library lock-in, composable |
| Hosting | **Vercel** | First-class Next.js support, free tier covers this use case |
| i18n | **next-intl** | App Router-friendly, handles RTL cleanly |

### 3.2 Why Not Alternatives

- **Firebase instead of Supabase** — great DX but NoSQL is a poor fit for this relational domain (appointments ↔ services ↔ staff ↔ clients ↔ payments). Postgres + RLS wins here.
- **Remix or SvelteKit** — both good, but Next.js has the largest ecosystem and the most solo-friendly resources.
- **Custom backend (Express/Nest)** — too much boilerplate for a solo developer; Supabase removes weeks of work.

---

## 4. Architecture

### 4.1 Multi-Tenancy

**Strategy: shared database, shared schema, `salon_id` on every tenant-scoped row.**

Every domain table (services, staff, clients, appointments, payments) has a non-nullable `salon_id` foreign key pointing to the `salons` table. Supabase Row-Level Security (RLS) policies enforce that users can only ever read or write rows matching their own `salon_id`. This means data isolation is enforced at the database level, not in application code — it is impossible to accidentally leak data across salons.

When a salon grows large enough to demand physical isolation (rare, years away), it can be migrated to a dedicated database. Do not over-engineer this now.

### 4.2 Roles & Permissions

Two roles at launch: `admin` and `staff`. The `role` column and RLS policies are designed so that adding `manager`, `receptionist`, or custom roles later is a data change, not a code change.

**Permission rules:**

- **Admin** — full CRUD on everything within their salon.
- **Staff** — read/write only appointments assigned to themselves; read-only access to services; full read/write access to all clients in the salon (creating walk-ins is part of the daily flow). Per-client metrics like "served by" are derived from appointments, not from access scoping.
- **Payments** — staff can record a payment against their own appointments; only admin can edit, refund, or delete payment records. Rationale: keep the counter flow fast without giving staff a footgun for corrections and refunds.

### 4.3 Conventions Baked In From Day One

These are cheap to add now, painful or impossible to add later:

- **`created_at`, `updated_at`, `created_by`** on every table — automatic audit trail.
- **Soft deletes via `deleted_at`** — nothing is ever hard-deleted from the database. All queries filter on `deleted_at IS NULL`.
- **UUID primary keys** — avoids enumerable IDs and eases future data migrations.
- **No hardcoded strings in UI code** — all user-facing text goes through the i18n layer from the first commit.
- **Separate `payments` table** — even though v1 only surfaces paid/unpaid/deposit on the appointment, the underlying table supports multiple payment records per appointment, partial payments, and refunds. Retrofitting from a single status field is expensive; starting with the table is cheap.
- **All timestamps stored as `timestamptz` (UTC).** The salon's local timezone (`Africa/Tunis` for The Pink Room) is on the `salons` row and applied at render time. Never store naive local times.
- **`salon_id` denormalized onto join tables** (e.g. `appointment_services`, `payments`) — makes RLS policies trivial and fast on those tables instead of forcing every query to join through the parent. Cheap to maintain, painful to add later.

### 4.4 Authentication

- Email and password login via Supabase Auth.
- The developer provisions admin accounts manually (one per salon at launch).
- Admins create staff accounts from within the app.
- Clients do not have accounts.

### 4.5 PWA Behavior

- Installable on iOS and Android home screens.
- App shell cached for instant open.
- Clear "you are offline" indicator when the network is unreachable.
- **Not** true offline — writes require a connection. Offline writes with sync are future work.

### 4.6 Internationalization

- French and Arabic at launch.
- RTL layout for Arabic, handled by Tailwind's `rtl:` variants.
- Translation strings live in JSON files under `/messages/{locale}.json`.
- Locale persists per user.

### 4.7 Observability & Error Tracking

Two distinct concerns, often conflated:

- **Audit log** — *who did what* inside the business domain (covered in §4.3: `created_at`, `updated_at`, `created_by` captured on every row from day one; viewer UI is future work).
- **Application logging** — *what is the app doing and where is it breaking* at the technical level. This is non-negotiable for a production app run by a solo developer.

**Stack for MVP:**

- **Sentry** — error tracking. Captures uncaught exceptions, stack traces, user context, and release information on both server and client. Free tier is sufficient for one salon and comfortably for several. Integrates with Next.js in minutes.
- **Vercel built-in logs** — request-level logs, API route logs, build logs. No setup required; included with hosting.
- **Supabase logs** — database query logs, auth events, RLS policy denials. No setup required; included with Supabase.

**What gets logged:**

- All uncaught exceptions, client and server.
- Failed authentication attempts and permission denials.
- Failed external calls (if any are added later, e.g., SMS provider).
- Slow queries flagged by Supabase.

**What does not:**

- No custom logging infrastructure, no log aggregator, no APM beyond what the above three provide. Revisit if the app grows past a handful of salons.
- Personally identifiable information about **clients** (names, phone numbers, emails, Instagram handles, notes) is scrubbed from error reports before being sent to Sentry. The authenticated **user's** stable UUID is attached to errors so the developer can correlate a bug report to a session without leaking PII.

---

## 5. Data Model

High-level entities. Exact schema decisions (indexes, constraints, enums vs lookup tables) will be finalized during implementation.

### 5.1 Core Tables

**`salons`** — the tenant
`id, name, timezone (default 'Africa/Tunis'), locale_default, opening_hours (jsonb), default_appointment_duration_minutes, created_at, updated_at, deleted_at`

`opening_hours` is a JSON document keyed by weekday (0–6) with one of:
- `{ closed: true }` — salon is closed that weekday
- `{ open: "09:00", close: "19:00", break: { start: "13:00", end: "14:00" } }` — single shift with optional lunch break

This shape covers The Pink Room and is straightforward to extend to multiple shifts later without a schema migration.

**`salon_closures`** — one-off closed days (public holidays, owner away)
`id, salon_id, date, reason, created_at, updated_at, deleted_at`

The table exists from day one so closure logic and indexes are in place; the admin-facing UI is future work (see §2.2).

**`users`** — extends Supabase `auth.users`
`id, salon_id, role (admin|staff), full_name, phone, email, locale, active, created_at, updated_at, deleted_at`

Staff working hours are intentionally not modeled in MVP. The owner already knows the team's schedule; the calendar grid is driven by `salons.opening_hours` only.

**`services`** — the service catalog
`id, salon_id, name, duration_minutes, price, active, created_at, updated_at, deleted_at`

**`clients`** — the salon's customer records
`id, salon_id, full_name, phone, email, instagram_handle, other_socials (jsonb), acquisition_channel, created_at, updated_at, deleted_at`

Derived fields (computed on read, not stored): `visit_count`, `total_spent`, `last_visit_at`, `no_show_count`.

**`appointments`** — the core booking entity
`id, salon_id, client_id, staff_user_id, start_at, end_at, status (scheduled|confirmed|completed|no_show|cancelled), notes, created_at, updated_at, deleted_at`

**`appointment_services`** — join table, supports multi-service appointments
`id, salon_id, appointment_id, service_id, price_at_booking, duration_at_booking`

Prices and durations are snapshotted at booking time so historical records don't change when the service catalog is updated.

**`payments`** — normalized from day one, minimal UI in v1
`id, salon_id, appointment_id, amount, method (cash|card|transfer|other), status (paid|deposit|refunded), paid_at, notes, created_at, updated_at, deleted_at`

### 5.2 Indexes That Matter

- `appointments (salon_id, start_at)` — the calendar query, runs constantly.
- `appointments (staff_user_id, start_at)` — staff's own-calendar query.
- `clients (salon_id, phone)` — fastest way to look up a client during a phone inquiry.

---

## 6. Feature Breakdown — MVP

### 6.1 Authentication

- Email + password login.
- Password reset via email.
- Session persists across PWA launches.
- Logout button.

### 6.2 Salon Setup

- Single salon at launch (The Pink Room), created manually by the developer.
- Admin can edit salon name, timezone (default `Africa/Tunis`), default locale, and opening hours.
- **Opening hours** are configured per weekday: open time, close time, optional lunch break, or marked closed. The calendar grid only shows hours within this range. A sensible default is seeded at salon creation; the admin can adjust it any time from settings.
- **Default appointment duration** is also a salon setting, used as a starting value when creating an appointment before any service is selected. The actual duration is always the sum of selected service durations.

### 6.3 Service Catalog

- Admin creates, edits, soft-deletes services.
- Each service has name (FR + AR), duration in minutes, price.
- Inactive services are hidden from new-appointment dropdowns but preserved in historical appointments.

### 6.4 Staff Management

- Admin creates staff accounts (name, email, phone).
- Admin can deactivate staff without deleting them.
- Staff can edit their own profile and password but nothing else.
- Staff working hours are not modeled in MVP — see §2.2 future work.

### 6.5 Client Records

- Admin and staff both have full CRUD on all clients within the salon. "Served by" is a metric derived from appointments, not an access boundary.
- Fields: full name, phone, email, Instagram handle, other socials, acquisition channel.
- Visit history and total spent are computed from the appointments and payments tables, not stored.
- Duplicate detection on phone number when creating a client.

### 6.6 Appointments

- Multi-service: one appointment, multiple services, all performed by the same staff member in one sitting.
- Total duration = sum of service durations; total price = sum of service prices at booking time.
- Assigned to exactly one staff member.
- Status lifecycle: `scheduled` → `confirmed` (optional) → `completed` | `no_show` | `cancelled`.
- Staff can change status of their own appointments; admin can change any.
- **Cancellations are kept visible**, not soft-deleted. The appointment row stays with status `cancelled` so the slot is freed up but the history (and per-client cancellation/no-show counts) is preserved.
- **Calendar toggle** to show or hide cancelled appointments. Default: hidden on the calendar to reduce clutter, shown in a client's individual history.
- **No-show metrics:** the `no_show` status on appointments is the single source of truth for per-client no-show counts and rates. No separate counter table.
- **Double-booking prevention:** the app warns when a new appointment overlaps a non-cancelled appointment for the same staff member, but allows the admin to override. There is no warning based on staff working hours (not modeled in MVP) or salon closures (UI deferred), so the owner can freely book outside normal hours when needed.

### 6.7 Calendar View

- **Daily view** — default on mobile, shows appointments as time-stacked cards.
- **Weekly view** — columns per day, optional on mobile and default on desktop.
- Admin can filter by staff or see all staff.
- Staff sees only their own calendar, no filter.
- Tap an appointment → detail sheet with edit, status change, and payment status.

### 6.8 Payment Status

- Each appointment shows a single payment badge at a glance, computed from the sum of its `payments` rows (not stored on the appointment):
  - **unpaid** — no payment rows, or net sum is 0.
  - **deposit** — net sum is greater than 0 but less than the appointment total.
  - **paid** — net sum is greater than or equal to the appointment total.
  - **refunded** — at least one refund row exists and net sum is back to 0.
- This means a deposit automatically rolls up to **paid** once the balance is settled — no manual flag flip required.
- **Permissions:**
  - Staff can record a new payment against their own appointments (e.g., "100 TND in cash").
  - Only admin can edit, refund, or delete existing payment records.
- Behind the scenes, every action creates or modifies a row in the `payments` table even though the UI surface is minimal.

### 6.9 Languages & RTL

- Language switcher in the user profile.
- All UI text translated to French and Arabic at launch.
- Layout flips correctly in Arabic.

### 6.10 PWA

- Installable via browser prompt on supported devices.
- Home screen icon and splash screen.
- App shell loads instantly from cache; data fetched fresh.
- Visible offline indicator when disconnected; interactions that require the network are disabled.

---

## 7. Build Order

A suggested order for a solo developer. Each step should be independently shippable and testable.

1. **Project setup** — Next.js, TypeScript, Tailwind, shadcn/ui, Supabase client, next-intl scaffolding.
2. **Database schema** — all tables with `salon_id`, RLS policies, timestamps, soft deletes.
3. **Authentication** — login, logout, session, password reset. Seed the first admin manually.
4. **Salon and user profile** — admin edits salon, users edit their own profile.
5. **Service catalog** — CRUD, i18n for service names.
6. **Staff management** — admin creates staff, sets working hours.
7. **Client records** — CRUD, duplicate detection on phone.
8. **Appointments** — create, edit, status lifecycle, multi-service, overlap warning.
9. **Calendar views** — daily and weekly, role-scoped.
10. **Payment status** — minimal UI, full `payments` table under the hood.
11. **Arabic translation + RTL pass** — translate all strings, verify every screen flips correctly.
12. **PWA polish** — manifest, service worker, offline indicator, install prompt, icons.
13. **Deploy and onboard The Pink Room.**

---

## 8. Open Questions and Decisions To Revisit

Things we have not decided but that are not blockers for starting:

- Whether to lock the service catalog to the admin only, or let staff suggest/request new services.
- Whether admin should be able to log in as staff for support purposes.
- Exact UX of the cancelled-appointments calendar toggle (per-user preference vs. session toggle vs. salon-wide setting).

These can be decided during implementation without significant rework.

**Resolved during spec review (Apr 25, 2026):**

- Staff have full CRUD on all clients in the salon (not scoped by "served by"). Per-client metrics like served-by are derived from appointments.
- Both admin and staff can set payment status; only admin can edit, refund, or delete existing payment records.
- Cancellations are kept visible with a calendar toggle to hide them; not soft-deleted.
- Salon timezone defaults to `Africa/Tunis`. All timestamps stored as `timestamptz` (UTC).
- Salon working hours are configurable per weekday (open/close + optional break), with closed-day support. A `salon_closures` table for one-off closures exists from day one; UI deferred.
- Staff working hours are not modeled in MVP — deferred to future work.
- Appointment payment badge (unpaid/deposit/paid/refunded) is derived from the sum of `payments` rows, not a stored field.

---

## 9. Success Criteria for MVP

The MVP is successful when:

1. The Pink Room stops using Instagram DMs, phone notes, and Excel for reservations.
2. All staff can see their daily schedule on their phone without asking the owner.
3. The owner can look up any client's full visit history in under 10 seconds.
4. Zero double-bookings in the first month of use.
5. The owner reports, qualitatively, that managing the salon is easier than before.

Everything else — reports, notifications, client-facing views, multi-salon onboarding — is validation for version 2.
