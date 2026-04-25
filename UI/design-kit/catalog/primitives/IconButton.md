# IconButton

A circular tap target with a single icon. **Always interactive.**

## When to use
- Bell / notifications, search, back, mic, "see all", filter.

## When not to use
- If non-interactive, use `IconBadge`.
- If you also need a text label, use `Button`.

## Props
- `icon: ComponentType` — required.
- `label: string` — required, used as `aria-label`.
- `size?: "sm" | "md" | "lg"` — 36 / 44 / 48 px.
- `tone?: "muted" | "white" | "ink" | "lavender"`.

## States
Hover (slightly darker surface) • focus-visible (lavender ring) • disabled inherited from `<button>`.

## Accessibility
`aria-label` is required via the `label` prop. Focus ring is visible; do not remove.

## Token usage
- Tones map to `bg-muted`, `bg-white`, `bg-inverse`, `bg-lavender-solid`.
- Focus ring uses `lavender-ring`.

## Example
```tsx
<IconButton icon={Bell} label="Notifications" tone="muted" />
<IconButton icon={ChevronLeft} label="Back" tone="muted" onClick={() => nav(-1)} />
```
