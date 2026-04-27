-- Core tables for The Pink Room.
-- All temporal columns are timestamptz (UTC). Salon-local time is rendered from `salons.timezone`.
-- Every tenant-scoped row carries `salon_id` (including join tables) so RLS policies stay simple and fast.

-- =========================================================================
-- salons
-- =========================================================================
create table if not exists public.salons (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  timezone text not null default 'Africa/Tunis',
  locale_default text not null default 'fr',
  -- opening_hours: JSON keyed by weekday "0".."6" (0 = Sunday).
  -- Each entry is either { "closed": true } or
  -- { "open": "09:00", "close": "19:00", "break": { "start": "13:00", "end": "14:00" } }.
  opening_hours jsonb not null default '{}'::jsonb,
  default_appointment_duration_minutes integer not null default 60
    check (default_appointment_duration_minutes > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create trigger salons_set_updated_at
  before update on public.salons
  for each row execute function public.set_updated_at();

-- =========================================================================
-- salon_closures (table exists from day one; UI deferred per spec §2.2)
-- =========================================================================
create table if not exists public.salon_closures (
  id uuid primary key default gen_random_uuid(),
  salon_id uuid not null references public.salons(id) on delete cascade,
  closure_date date not null,
  reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (salon_id, closure_date)
);

create trigger salon_closures_set_updated_at
  before update on public.salon_closures
  for each row execute function public.set_updated_at();

-- =========================================================================
-- users (extends auth.users)
-- The id column matches auth.users.id; one row per Supabase auth user.
-- =========================================================================
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  salon_id uuid not null references public.salons(id) on delete restrict,
  role text not null check (role in ('admin', 'staff')),
  full_name text not null,
  phone text,
  email text,
  locale text not null default 'fr',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists users_salon_idx on public.users (salon_id);

create trigger users_set_updated_at
  before update on public.users
  for each row execute function public.set_updated_at();

-- =========================================================================
-- services
-- =========================================================================
create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  salon_id uuid not null references public.salons(id) on delete cascade,
  name text not null,
  duration_minutes integer not null check (duration_minutes > 0),
  price numeric(10, 2) not null check (price >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists services_salon_idx on public.services (salon_id);

create trigger services_set_updated_at
  before update on public.services
  for each row execute function public.set_updated_at();

-- =========================================================================
-- clients
-- =========================================================================
create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  salon_id uuid not null references public.salons(id) on delete cascade,
  full_name text not null,
  phone text,
  email text,
  instagram_handle text,
  other_socials jsonb not null default '{}'::jsonb,
  acquisition_channel text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

-- Lookup-by-phone is the fastest path during a phone inquiry (spec §5.2).
create index if not exists clients_salon_phone_idx on public.clients (salon_id, phone);

create trigger clients_set_updated_at
  before update on public.clients
  for each row execute function public.set_updated_at();

-- =========================================================================
-- appointments
-- =========================================================================
create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  salon_id uuid not null references public.salons(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete restrict,
  staff_user_id uuid not null references public.users(id) on delete restrict,
  start_at timestamptz not null,
  end_at timestamptz not null check (end_at > start_at),
  status text not null
    check (status in ('scheduled', 'confirmed', 'completed', 'no_show', 'cancelled')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.users(id) on delete set null,
  deleted_at timestamptz
);

-- Calendar query (spec §5.2).
create index if not exists appointments_salon_start_idx on public.appointments (salon_id, start_at);
-- Staff own-calendar query (spec §5.2).
create index if not exists appointments_staff_start_idx on public.appointments (staff_user_id, start_at);

create trigger appointments_set_updated_at
  before update on public.appointments
  for each row execute function public.set_updated_at();

-- =========================================================================
-- appointment_services (join, snapshots price/duration at booking time)
-- =========================================================================
create table if not exists public.appointment_services (
  id uuid primary key default gen_random_uuid(),
  salon_id uuid not null references public.salons(id) on delete cascade,
  appointment_id uuid not null references public.appointments(id) on delete cascade,
  service_id uuid not null references public.services(id) on delete restrict,
  price_at_booking numeric(10, 2) not null check (price_at_booking >= 0),
  duration_at_booking integer not null check (duration_at_booking > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists appt_services_appt_idx on public.appointment_services (appointment_id);

create trigger appointment_services_set_updated_at
  before update on public.appointment_services
  for each row execute function public.set_updated_at();

-- =========================================================================
-- payments (full table from day one; minimal UI in v1)
-- =========================================================================
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  salon_id uuid not null references public.salons(id) on delete cascade,
  appointment_id uuid not null references public.appointments(id) on delete cascade,
  amount numeric(10, 2) not null,
  method text not null check (method in ('cash', 'card', 'transfer', 'other')),
  status text not null check (status in ('paid', 'deposit', 'refunded')),
  paid_at timestamptz not null default now(),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.users(id) on delete set null,
  deleted_at timestamptz
);

create index if not exists payments_appointment_idx on public.payments (appointment_id);

create trigger payments_set_updated_at
  before update on public.payments
  for each row execute function public.set_updated_at();
