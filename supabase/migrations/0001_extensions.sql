-- Extensions and shared helpers.

create extension if not exists "pgcrypto";

-- Auto-update `updated_at` on row update.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
