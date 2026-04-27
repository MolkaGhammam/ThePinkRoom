# Button

A pill action button. Optional trailing icon rendered inside a white `IconBadge`.

## When to use
- Primary CTAs (use `tone="lavender"` + `fullWidth`).
- Secondary text-and-icon controls.

## When not to use
- Icon-only — use `IconButton`.
- Full-width sticky booking CTA — wrap in `BookingCTA`.

## Props
- `tone?: "lavender" | "ink" | "white"`.
- `size?: "md" | "lg"`.
- `fullWidth?: boolean`.
- `trailingIcon?: ComponentType` — wraps in a white `IconBadge`.
- All native `<button>` props.

## States
Idle • hover (darker tone) • focus-visible (lavender ring) • disabled.

## Accessibility
Native `<button>` — text content is the accessible name.

## Token usage
- `bg-lavender-solid`, `bg-inverse`, `bg-white`.

## Example
```tsx
<Button tone="lavender" size="lg" fullWidth trailingIcon={ChevronsRight}>
  Book Appointment
</Button>
```
