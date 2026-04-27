# IconBadge

A small circular plate that holds an icon. **Non-interactive.**

## When to use
- Decorative leading mark on a card (heart on doctor card, calendar inside an appointment row).
- Trailing arrow on a CTA button (white circle inside lavender bar).

## When not to use
- If it is clickable, use `IconButton` instead.

## Props
- `icon: ComponentType` — Lucide icon component.
- `size?: "sm" | "md" | "lg"` — 28 / 36 / 44 px.
- `tone?: "white" | "ink" | "lavender" | "mint"`.
- `strokeWidth?: number` — passed through to the icon.

## States
Static.

## Accessibility
Decorative — wrap meaningful information in surrounding text rather than relying on the icon.

## Token usage
- `bg-white`, `bg-inverse`, `bg-lavender-solid`, `bg-mint`.

## Example
```tsx
<IconBadge icon={CalendarIcon} tone="lavender" size="sm" />
<IconBadge icon={ChevronsRight} tone="white" size="md" />
```
