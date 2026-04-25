# Chip

A selectable pill button — pressed state uses **lavender solid + white text**.

## When to use
- Day cells in `DayStrip`, time cells in `TimeGrid`, segments inside `SegmentedToggle`.
- Any "pick one" or "pick many" pill control.

## When not to use
- Non-interactive label — use `Tag`.
- Primary action — use `Button`.

## Props
- `selected?: boolean` — drives the lavender pressed state.
- `stacked?: boolean` — vertical content (e.g. weekday + day-number).
- `shape?: "pill" | "circle"` — circle is fixed-square (used by `DayStrip`).
- `size?: "sm" | "md" | "lg"`.
- All native `<button>` props.

## States
Idle (`bg-chip-idle`) • selected (`bg-lavender-solid` + white) • hover • focus-visible.

## Accessibility
`aria-pressed` is set automatically.

## Token usage
- `chip.idleBg`, `chip.idleFg`, `chip.selectedBg`, `chip.selectedFg`.

## Example
```tsx
<Chip selected={value === "PM"} onClick={() => setValue("PM")}>PM</Chip>
<Chip shape="circle" stacked selected>
  <span className="text-tiny">Wed</span>
  <span className="text-body font-bold">14</span>
</Chip>
```
