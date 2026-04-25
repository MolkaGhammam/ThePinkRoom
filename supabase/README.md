# Supabase migrations

Run the files in `migrations/` against your Supabase project **in order**:

1. `0001_extensions.sql` — `pgcrypto` and the shared `set_updated_at` trigger function.
2. `0002_tables.sql` — all tables, indexes, and timestamp triggers.
3. `0003_rls.sql` — `auth.salon_id()` / `auth.user_role()` helpers, RLS enable, all policies.
4. `0004_seed_pink_room.sql` — seeds The Pink Room salon row (idempotent).

## How to run them

**Option A — Supabase Dashboard (simplest):**
SQL Editor → paste each file's contents → run, in order.

**Option B — Supabase CLI:**

```bash
supabase link --project-ref <ref>
supabase db push
```

## After the migrations: provision the first admin user

The `users` table is keyed off `auth.users.id`, so the auth user must exist first.

1. **Authentication → Users → Add user → Create new user.** Email + password. Confirm the email.
2. Get the new auth user's `id` (UUID) from the Users list.
3. Get the salon `id`:
   ```sql
   select id from public.salons where name = 'The Pink Room';
   ```
4. Insert the matching `public.users` row:
   ```sql
   insert into public.users (id, salon_id, role, full_name, email, locale)
   values (
     '<auth-user-uuid>',
     '<salon-uuid>',
     'admin',
     'Owner Name',
     'owner@example.com',
     'fr'
   );
   ```

Once that row exists, RLS will let the user read their salon's data.

## Verifying isolation (optional but recommended)

Create a second test salon, second auth user, second `public.users` row pointing to that other salon, then confirm via the SQL Editor (set the role to `authenticated` with `set role authenticated; set request.jwt.claim.sub = '<other-user-uuid>';`) that cross-salon queries return zero rows.
