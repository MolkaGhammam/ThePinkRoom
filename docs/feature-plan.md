# The Pink Room — Feature Plan

**Companion to:** [the-pink-room-spec.md](./the-pink-room-spec.md)
*Last updated: April 25, 2026*

---

## Purpose

This document picks up where the initiation plan left off. The foundation is in place: auth, database, i18n, Sentry, PWA shell. This plan covers every user-facing feature in the MVP, in the order they should be built.

Each phase is independently shippable. A phase is done when its verification checks pass and the app builds without errors.

---

## Guiding Principles

1. **Design kit first.** Every screen uses kit components from `@kit`. No one-off styled HTML. If a pattern is missing from the kit, add it there before using it.
2. **i18n from the first keystroke.** Every user-facing string goes through `useTranslations` / `getTranslations`. No hardcoded copy, ever.
3. **Role gates in the UI match the RLS policies in the database.** If admin-only in the DB, hide it from staff in the UI too. Never rely on the UI alone for security.
4. **Soft deletes everywhere.** Never call `.delete()` on a domain record. Set `deleted_at = now()` instead.
5. **No feature branching from the spec.** If something feels out of scope, park it in §2.2 of the spec, don't build it.

---

## App Shell & Navigation (prerequisite for all phases)

Before any feature screen, the app needs a consistent shell: a bottom tab bar for mobile navigation and a layout that all authenticated pages share.

### Tasks

- [ ] Design the navigation structure. Proposed tabs for the bottom bar:
  - **Calendar** (default) — the daily/weekly appointment view
  - **Clients** — client list and search
  - **Services** — service catalog (admin only; staff tab is hidden)
  - **Team** — staff list (admin only; hidden for staff)
  - **Settings** — profile, salon settings
- [ ] Create `src/app/[locale]/(app)/layout.tsx` — the authenticated app shell layout. Uses `BottomTabBar` from `@kit`. Fetches `getCurrentUser()` once here and passes it down via React context.
- [ ] Create `src/components/UserProvider.tsx` — a client context that makes `CurrentUser` available to any client component without prop-drilling.
- [ ] Replace the placeholder home page with a redirect to `/[locale]/calendar`.
- [ ] Add all translation keys for navigation labels to `fr.json` and `ar.json`.

### Verification

- Bottom tab bar renders on all authenticated pages.
- Staff sees Calendar, Clients, Settings. Admin sees all five tabs.
- Active tab is highlighted correctly.
- RTL: tab bar items are mirrored in Arabic.

---

## Phase 1 — Settings: Profile & Salon

The simplest feature screens. Good for establishing the CRUD pattern before tackling the more complex ones.

### 1A — User Profile

- [ ] Profile page at `/[locale]/settings/profile`.
- [ ] Form fields: full name, phone, email (read-only — owned by Supabase Auth), locale (FR/AR selector).
- [ ] On save: `UPDATE public.users SET full_name, phone, locale WHERE id = auth.uid()`.
- [ ] On locale change: switch the active locale immediately (update URL prefix + cookie).
- [ ] Change password form (separate card): calls `supabase.auth.updateUser({ password })`.

### 1B — Salon Settings (admin only)

- [ ] Salon settings page at `/[locale]/settings/salon`.
- [ ] Form fields: salon name, default locale.
- [ ] Opening hours editor: one row per weekday (Mon–Sun), toggle open/closed, open time, close time, optional break start/end.
- [ ] Default appointment duration (minutes).
- [ ] On save: `UPDATE public.salons SET ... WHERE id = <salon_id>`.
- [ ] Staff who visit `/settings/salon` are redirected to their profile.

### Verification

- Admin can update salon name and opening hours; changes persist on refresh.
- User can change their name and locale; the app switches language immediately.
- Password change works; old password no longer logs in.
- Staff cannot access the salon settings page.

---

## Phase 2 — Service Catalog (admin only)

### Tasks

- [ ] Service list page at `/[locale]/services` — shows all active services, card per service with name, duration, price, and an edit button.
- [ ] "Add service" bottom sheet / modal — form: name (FR), name (AR), duration in minutes, price.
- [ ] Edit service — same form pre-filled.
- [ ] Deactivate service — sets `active = false` (soft disable, not delete). Inactive services disappear from this list but remain on historical appointments.
- [ ] All prices displayed in TND.
- [ ] Empty state when no services exist yet.

### Verification

- Admin can create, edit, and deactivate a service.
- Deactivated service disappears from the list.
- Both FR and AR names are stored and display correctly in each locale.
- Staff cannot access the services page (tab hidden, direct URL redirects away).

---

## Phase 3 — Staff Management (admin only)

### Tasks

- [ ] Staff list page at `/[locale]/team` — card per staff member with name, phone, active status.
- [ ] "Add staff member" bottom sheet — form: full name, email, phone, temporary password.
  - Under the hood: `supabase.auth.admin.createUser()` via the service-role client, then insert into `public.users`.
- [ ] Edit staff member — admin can update name and phone.
- [ ] Deactivate staff — sets `active = false`. Deactivated staff cannot log in (enforced by checking `active` in `getCurrentUser`). Their historical appointments remain.
- [ ] Empty state when no staff exist.

### Verification

- Admin can create a staff account; the new staff member can log in.
- Admin can deactivate staff; deactivated staff are blocked at login.
- Staff cannot access the team page.

---

## Phase 4 — Client Records

### Tasks

- [ ] Client list page at `/[locale]/clients` — searchable list, search by name or phone. Card per client: name, phone, last visit date (computed).
- [ ] Client detail page at `/[locale]/clients/[id]` — all fields, visit history (list of past appointments with date, services, total, staff), computed stats (visit count, total spent, no-show count).
- [ ] "Add client" bottom sheet — form: full name, phone (with duplicate detection on blur), email, Instagram handle, acquisition channel.
  - Duplicate detection: if a client with the same phone already exists in the salon, show a warning with a link to the existing record. Allow override.
- [ ] Edit client — same form pre-filled.
- [ ] Soft-delete client — sets `deleted_at`. Only admin.
- [ ] Visit history is a query against `appointments` joined with `appointment_services` and `payments` — computed on read, not stored.
- [ ] Empty state.

### Verification

- Any user can create and edit a client.
- Duplicate phone number triggers a visible warning.
- Client detail shows correct visit count and total spent.
- Soft-deleted client disappears from the list.
- Search by name and phone both work.

---

## Phase 5 — Appointments: Create & Edit

The most complex phase. Split into sub-steps.

### 5A — Appointment Creation

- [ ] "New appointment" entry point: a `+` button on the calendar and on the client detail page.
- [ ] Creation flow (bottom sheet or full-screen on mobile):
  1. **Pick a client** — search existing clients or quick-create inline.
  2. **Pick staff member** — dropdown (admin sees all staff; staff sees only themselves pre-selected and locked).
  3. **Pick date and time** — date picker + time picker using kit's `Calendar` and `TimeWheel` components. Time slots are bounded by salon opening hours.
  4. **Pick services** — multi-select from the active service catalog. Running total of duration and price shown at the bottom.
  5. **Notes** — optional free-text field.
  6. **Confirm** — summary screen before saving.
- [ ] On save:
  - Insert `appointments` row with `status = 'scheduled'`.
  - Insert one `appointment_services` row per selected service (snapshotting `price_at_booking` and `duration_at_booking`).
  - `end_at` = `start_at` + sum of selected service durations.
- [ ] **Overlap warning**: before saving, query for any non-cancelled appointment for the same `staff_user_id` that overlaps `[start_at, end_at)`. If found, show a warning. Admin can override and save anyway. Staff cannot override.

### 5B — Appointment Edit & Status

- [ ] Edit appointment — same form pre-filled. Allowed: change services, notes, start time. Staff can only edit their own appointments.
- [ ] Status change — a segmented control or action buttons on the appointment detail:
  - `scheduled` → `confirmed`, `cancelled`
  - `confirmed` → `completed`, `no_show`, `cancelled`
  - `completed` / `no_show` / `cancelled` — terminal, no further transitions
- [ ] Cancellations: status is set to `cancelled`. The row is NOT soft-deleted. It remains visible in the client history.

### Verification

- Full appointment creation flow works end-to-end.
- `end_at` is correctly calculated from service durations.
- Overlap warning fires and blocks staff but allows admin override.
- Status lifecycle transitions work; terminal states cannot be changed.
- Staff cannot edit or change status of another staff member's appointment.

---

## Phase 6 — Calendar Views

### Tasks

- [ ] **Daily view** (default on mobile): vertical timeline for a single day, one column. Each appointment is a card positioned by `start_at` and sized by duration. Shows client name, services, staff (if admin view), payment badge.
- [ ] **Weekly view**: 7 columns (Mon–Sun), same card style compressed. Default on larger screens.
- [ ] Toggle between daily and weekly — `SegmentedToggle` from `@kit`.
- [ ] Date navigation — previous/next day (or week), tap a day to jump to it. Use `DayStrip` and `MonthSwitcher` from `@kit`.
- [ ] **Role scoping**:
  - Admin: sees all staff's appointments by default. Staff filter dropdown to view one staff member at a time.
  - Staff: sees only their own appointments. No filter.
- [ ] **Cancelled toggle**: a filter button to show/hide cancelled appointments. Default hidden.
- [ ] Tap an appointment card → appointment detail bottom sheet (status, payment badge, client name, services, notes, edit and status-change actions).
- [ ] Calendar grid hours driven by `salons.opening_hours` — don't render rows outside open hours.
- [ ] "New appointment" FAB on the calendar, pre-filling the tapped time slot if the user taps an empty slot.

### Verification

- Daily and weekly views render correctly with real data.
- Appointment cards are positioned and sized correctly by time.
- Admin staff filter works; shows all / one staff member.
- Cancelled appointments are hidden by default, shown when toggled.
- Tapping an appointment opens the detail sheet.
- Opening hours correctly bound the visible time range.

---

## Phase 7 — Payment Status

### Tasks

- [ ] Payment badge (`unpaid` / `deposit` / `paid` / `refunded`) computed from `payments` rows and shown on:
  - Appointment cards in the calendar.
  - Appointment detail sheet.
  - Client visit history.
- [ ] **Record a payment** (staff + admin): action button on the appointment detail sheet → bottom sheet with fields: amount (TND), method (cash / card / transfer / other). On save: insert a `payments` row.
- [ ] **Edit / refund / delete a payment** (admin only): from the appointment detail sheet, admin can tap an existing payment row to edit amount/method, mark as refunded, or delete.
- [ ] Payment badge re-computes automatically after any change (revalidate the appointment query).
- [ ] Display the running payment summary on the appointment detail: total due, total paid, balance remaining.

### Verification

- Recording a payment updates the badge immediately.
- Deposit badge shows when partial payment recorded; upgrades to paid when balance settled.
- Staff cannot edit or delete an existing payment record (UI action hidden; RLS also blocks it).
- Refunded badge shows correctly.

---

## Phase 8 — Arabic Translation & RTL Pass

(this phase was ditched as a request from the developer)

Done last so all strings are known before translating.

### Tasks

- [ ] Audit `fr.json` — every key used in the app must be present.
- [ ] Translate all keys into `ar.json`.
- [ ] Walk every screen in Arabic locale and verify:
  - Text is translated (no French fallbacks visible).
  - Layout flips correctly (flex row reverses, text aligns right, icons mirror where needed).
  - The calendar grid reads right-to-left.
  - Forms and inputs align correctly.
  - The `BottomTabBar` item order is mirrored.
- [ ] Fix any layout issues using Tailwind's `rtl:` variants.

### Verification

- Every visible string in the app is translated in Arabic.
- No layout breaks at 390 px viewport in Arabic.
- Switching between FR and AR mid-session works without a full reload.

---

## Cross-Cutting Tasks (apply throughout all phases)

These are not phases — they are standards to maintain as each phase is built:

- **Every new route added to the app shell gets a navigation entry.** No orphan pages.
- **Every new user-facing string added to `fr.json` gets added to `ar.json` at the same time** (use a placeholder if the translation isn't ready yet — never leave a key missing).
- **Every server action returns `Result<T>`** (from `src/lib/result.ts`). No naked throws reaching the client.
- **Every page that is role-restricted** gets both a UI guard (tab hidden / button hidden) and a server-side check (redirect if wrong role).
- **`pnpm typecheck` and `pnpm build` pass after every phase** before moving on.

---

## Definition of Done for Features

The feature phase is complete when:

1. An admin can manage the full workflow end-to-end: create services → add staff → add clients → book appointments → view the calendar → record payment.
2. A staff member can log in, see only their own calendar, create and update appointments, and record payments.
3. Switching to Arabic at any point in the workflow shows fully translated, correctly RTL-flipped screens.
4. The app builds, typechecks, and deploys without errors.
5. The Pink Room owner can use the app as their primary scheduling tool, replacing Instagram DMs and Excel.
