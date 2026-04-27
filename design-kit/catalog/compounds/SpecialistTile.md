# SpecialistTile

A square-ish tile representing a medical specialty: price, role, availability, and a top-right `IconBadge`.

## Variants
- `tone="white"` — bordered/white surface.
- `tone="lavender"` — lavender bg.

## When to use
- HomePage "Pick the Right Specialist" 2-up grid.

## When not to use
- Inline list of specialties — use `Pill`s.
- Doctor profile preview — use `DoctorProfileCard`.

## Props
- `price`, `pricePeriod?`, `role`, `availability`.
- `icon: ComponentType` — Lucide icon shown in the corner badge.
- `tone?: "white" | "lavender"`.
- `onClick?`.

## Owns
- Vertical 2-region layout: top (price), bottom (role + availability), top-right `IconBadge`.

## Does not own
- Filtering / sorting logic — that's page-level.

## Example
```tsx
<SpecialistTile
  price="$35"
  role="Cardiologist"
  availability="17 Doctor Available"
  icon={HeartPulse}
  tone="lavender"
/>
```
