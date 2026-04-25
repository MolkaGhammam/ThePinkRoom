# TimeWheel

A vertical scroll-snap picker for hour / minute / AM-PM, with a center selection band.
Pattern from `references/screenshots/TimePicker.png`.

## When to use
- An alternate time-entry surface (e.g. a Check In / Check Out modal).
- When the user picks one specific time rather than from a fixed slot grid.

## When not to use
- Picking a clinic appointment slot — use `TimeGrid`.

## Props
- `value: { hour: 1..12, minute: number, meridiem: "AM" | "PM" }`.
- `onChange?` — fires on scroll snap and on tap.
- `hours?: number[]`, `minutes?: number[]` — defaults: 1..12 and `[0, 15, 30, 45]`.
- `label?: string` — heading rendered above the wheel.

## Owns
- Scroll-snap behavior, padding rows above/below, fade for off-center rows, the muted center band.

## Does not own
- Wheel inertia / momentum animation. First pass is native scroll-snap; if you need iOS-style spring, swap the column impl.
- Time formatting in 24-hour mode — extend with a `format` prop.

## Accessibility
First pass is mouse / touch. Add keyboard handlers (Up/Down to step) before shipping in production.

## Example
```tsx
const [v, setV] = useState({ hour: 1, minute: 0, meridiem: "PM" });
<TimeWheel label="Check In" value={v} onChange={setV} />
```
