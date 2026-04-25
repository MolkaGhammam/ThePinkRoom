# Pill

A generic rounded-full container. The shape of the design system.

## When to use
- Building a custom pill (e.g. label + value + icon) that isn't already covered by `Tag`, `Chip`, or `IconButton`.

## When not to use
- For a selectable choice — use `Chip`.
- For a static badge — use `Tag`.

## Props
- `tone?: "white" | "muted" | "mint" | "lavender" | "ink"`.
- `density?: "sm" | "md" | "lg"` — 28 / 36 / 44 px tall.

## States
Static.

## Token usage
Same tone tokens as Card / Tag / Chip.

## Example
```tsx
<Pill tone="mint" density="md">3 active</Pill>
```
