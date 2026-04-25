-- Row Level Security policies.
-- Tenancy and role enforcement happens at the database level (spec §4.1, §4.2).
--
-- Helpers:
--   auth.salon_id()  -> the calling user's salon_id (or NULL)
--   auth.user_role() -> the calling user's role string (or NULL)
--
-- General rule: a row is visible only if salon_id = auth.salon_id() AND deleted_at IS NULL.
-- Per-table policies layer role-based write rules on top.

-- =========================================================================
-- helpers
-- =========================================================================
create or replace function auth.salon_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select salon_id from public.users where id = auth.uid()
$$;

create or replace function auth.user_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.users where id = auth.uid()
$$;

-- =========================================================================
-- enable RLS on every table
-- =========================================================================
alter table public.salons enable row level security;
alter table public.salon_closures enable row level security;
alter table public.users enable row level security;
alter table public.services enable row level security;
alter table public.clients enable row level security;
alter table public.appointments enable row level security;
alter table public.appointment_services enable row level security;
alter table public.payments enable row level security;

-- =========================================================================
-- salons
-- =========================================================================
create policy "salons: read own salon"
  on public.salons for select
  using (id = auth.salon_id() and deleted_at is null);

create policy "salons: admin updates own salon"
  on public.salons for update
  using (id = auth.salon_id() and auth.user_role() = 'admin')
  with check (id = auth.salon_id() and auth.user_role() = 'admin');

-- INSERT and DELETE on salons are intentionally not allowed via RLS.
-- Salon creation happens through the developer / service role at provisioning time.

-- =========================================================================
-- salon_closures
-- =========================================================================
create policy "salon_closures: read own salon"
  on public.salon_closures for select
  using (salon_id = auth.salon_id() and deleted_at is null);

create policy "salon_closures: admin writes"
  on public.salon_closures for all
  using (salon_id = auth.salon_id() and auth.user_role() = 'admin')
  with check (salon_id = auth.salon_id() and auth.user_role() = 'admin');

-- =========================================================================
-- users
-- =========================================================================
create policy "users: read own salon"
  on public.users for select
  using (salon_id = auth.salon_id() and deleted_at is null);

-- Admin can create / deactivate any staff user in their salon.
create policy "users: admin writes"
  on public.users for all
  using (salon_id = auth.salon_id() and auth.user_role() = 'admin')
  with check (salon_id = auth.salon_id() and auth.user_role() = 'admin');

-- A user can update their own row (e.g. profile, locale). Role and salon_id are guarded
-- in application code; RLS only enforces "own row" here.
create policy "users: self update"
  on public.users for update
  using (id = auth.uid())
  with check (id = auth.uid());

-- =========================================================================
-- services
-- =========================================================================
create policy "services: read own salon"
  on public.services for select
  using (salon_id = auth.salon_id() and deleted_at is null);

create policy "services: admin writes"
  on public.services for all
  using (salon_id = auth.salon_id() and auth.user_role() = 'admin')
  with check (salon_id = auth.salon_id() and auth.user_role() = 'admin');

-- =========================================================================
-- clients (admin and staff both have full CRUD per spec §4.2)
-- =========================================================================
create policy "clients: read own salon"
  on public.clients for select
  using (salon_id = auth.salon_id() and deleted_at is null);

create policy "clients: any user writes"
  on public.clients for all
  using (salon_id = auth.salon_id())
  with check (salon_id = auth.salon_id());

-- =========================================================================
-- appointments
-- =========================================================================
create policy "appointments: read own salon"
  on public.appointments for select
  using (salon_id = auth.salon_id() and deleted_at is null);

-- Admin can write any appointment in the salon.
create policy "appointments: admin writes"
  on public.appointments for all
  using (salon_id = auth.salon_id() and auth.user_role() = 'admin')
  with check (salon_id = auth.salon_id() and auth.user_role() = 'admin');

-- Staff can insert appointments for themselves.
create policy "appointments: staff insert own"
  on public.appointments for insert
  with check (
    salon_id = auth.salon_id()
    and staff_user_id = auth.uid()
  );

-- Staff can update / soft-delete their own appointments only.
create policy "appointments: staff update own"
  on public.appointments for update
  using (salon_id = auth.salon_id() and staff_user_id = auth.uid())
  with check (salon_id = auth.salon_id() and staff_user_id = auth.uid());

-- =========================================================================
-- appointment_services
-- Visible / writable iff the parent appointment is. Admin writes always; staff writes
-- when they own the parent appointment.
-- =========================================================================
create policy "appt_services: read own salon"
  on public.appointment_services for select
  using (salon_id = auth.salon_id());

create policy "appt_services: admin writes"
  on public.appointment_services for all
  using (salon_id = auth.salon_id() and auth.user_role() = 'admin')
  with check (salon_id = auth.salon_id() and auth.user_role() = 'admin');

create policy "appt_services: staff writes own appointment"
  on public.appointment_services for all
  using (
    salon_id = auth.salon_id()
    and exists (
      select 1 from public.appointments a
      where a.id = appointment_services.appointment_id
        and a.staff_user_id = auth.uid()
    )
  )
  with check (
    salon_id = auth.salon_id()
    and exists (
      select 1 from public.appointments a
      where a.id = appointment_services.appointment_id
        and a.staff_user_id = auth.uid()
    )
  );

-- =========================================================================
-- payments (per spec §6.8: staff records, admin edits/refunds/deletes)
-- =========================================================================
create policy "payments: read own salon"
  on public.payments for select
  using (salon_id = auth.salon_id() and deleted_at is null);

-- Admin: full CRUD.
create policy "payments: admin writes"
  on public.payments for all
  using (salon_id = auth.salon_id() and auth.user_role() = 'admin')
  with check (salon_id = auth.salon_id() and auth.user_role() = 'admin');

-- Staff: insert only, only against their own appointments.
create policy "payments: staff insert own"
  on public.payments for insert
  with check (
    salon_id = auth.salon_id()
    and exists (
      select 1 from public.appointments a
      where a.id = payments.appointment_id
        and a.staff_user_id = auth.uid()
    )
  );

-- Staff explicitly cannot UPDATE or DELETE payments. Those policies are admin-only above.
