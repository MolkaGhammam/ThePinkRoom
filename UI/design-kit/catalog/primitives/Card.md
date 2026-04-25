# Card

A rounded-2xl surface with a tone variant. The base of every grouped block.

## When to use
- Anywhere you'd reach for `<div className="rounded-2xl bg-white p-4">`.
- The mint appointment block, the lavender / white specialist tile, the muted calendar inner panel.

## When not to use
- Page-level layout containers. Cards are content blocks, not layout.

## Props
- `tone?: "white" | "mint" | "lavender" | "muted"`.
- `radius?: "lg" | "xl" | "2xl"` — defaults to `"2xl"`.
- `padding?: "none" | "sm" | "md" | "lg"`.
- `elevated?: boolean` — adds a soft `shadow-card`.

## States
Static. Click handling is opt-in via passed-through `onClick`.

## Token usage
- `bg-white`, `bg-mint`, `bg-lavender`, `bg-muted`.
- `shadow-card`.

## Example
```tsx
<Card tone="mint" radius="2xl" padding="md">…</Card>
```
