# TimeGrid

A grid of selectable time slots. Default 4 columns, lavender selected.

## When to use
- DatePage time slot picker.

## When not to use
- Free-form time entry — use `TimeWheel` or a native `<input type="time">`.

## Props
- `slots: string[]`.
- `selected?: string`, `onSelect?: (slot) => void`.
- `disabledSlots?: string[]` — already booked.
- `columns?: 3 | 4` — defaults to 4.

## Owns
Grid layout, chip sizing, disabled treatment (`opacity-40`).

## Does not own
- Time formatting / timezone math.
- Server data fetching.

## Example
```tsx
<TimeGrid
  slots={["04:00","04:30","05:00","05:30"]}
  selected={value}
  onSelect={setValue}
/>
```
