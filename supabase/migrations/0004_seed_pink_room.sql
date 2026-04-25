-- Seed The Pink Room as the first salon.
-- Idempotent: skipped if a salon with this name already exists.

insert into public.salons (name, timezone, locale_default, opening_hours, default_appointment_duration_minutes)
select
  'The Pink Room',
  'Africa/Tunis',
  'fr',
  jsonb_build_object(
    -- 0 = Sunday, 1 = Monday, ... 6 = Saturday
    '0', jsonb_build_object('closed', true),
    '1', jsonb_build_object('open', '09:00', 'close', '19:00', 'break', jsonb_build_object('start', '13:00', 'end', '14:00')),
    '2', jsonb_build_object('open', '09:00', 'close', '19:00', 'break', jsonb_build_object('start', '13:00', 'end', '14:00')),
    '3', jsonb_build_object('open', '09:00', 'close', '19:00', 'break', jsonb_build_object('start', '13:00', 'end', '14:00')),
    '4', jsonb_build_object('open', '09:00', 'close', '19:00', 'break', jsonb_build_object('start', '13:00', 'end', '14:00')),
    '5', jsonb_build_object('open', '09:00', 'close', '19:00', 'break', jsonb_build_object('start', '13:00', 'end', '14:00')),
    '6', jsonb_build_object('open', '09:00', 'close', '19:00', 'break', jsonb_build_object('start', '13:00', 'end', '14:00'))
  ),
  60
where not exists (select 1 from public.salons where name = 'The Pink Room');
