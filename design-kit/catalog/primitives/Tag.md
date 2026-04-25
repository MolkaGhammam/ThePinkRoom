# Tag

A small, **non-interactive** pill used as a label or status indicator.

## When to use
- "50 min" duration on `AppointmentCard`.
- "Per Visit" / "Available" labels.

## When not to use
- For interactive selection — use `Chip`.
- For an icon-only indicator — use `IconBadge`.

## Props
- `tone?: "white" | "muted" | "mint" | "lavender"`.

## States
Static.

## Token usage
- `bg-white`, `bg-muted`, `bg-mint-soft`, `bg-lavender-soft`.

## Example
```tsx
<Tag tone="white">50 min</Tag>
```
