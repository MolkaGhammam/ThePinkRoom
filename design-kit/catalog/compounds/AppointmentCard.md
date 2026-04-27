# AppointmentCard

A pink-toned card summarizing the user's next appointment.

## When to use
- HomePage "Your Next Appointments (N)" block.

## When not to use
- A list of past appointments — build a slimmer `AppointmentRow` instead.
- A doctor profile — use `DoctorProfileCard`.

## Props
- `name`, `role` — doctor identifiers.
- `date`, `time` — already-formatted display strings.
- `durationLabel?` — defaults to `"50 min"`.
- `avatar?: AvatarProps`.
- `onClick?` — wraps the whole card.

## Owns
- The pink surface, the white "duration" tag, the lavender calendar `IconBadge` and white clock `IconBadge`.

## Does not own
- Multi-appointment carousel — that's a page-level pattern.

## Token usage
- `bg-pink`, `text-pink-fg`, `bg-lavender-solid`, `bg-white`.

## Example
```tsx
<AppointmentCard
  name="Darlene Robertson"
  role="Neurologist"
  date="12th January, Monday"
  time="4.00 PM"
  avatar={{ src: "/d.jpg", alt: "Dr. Robertson" }}
/>
```
