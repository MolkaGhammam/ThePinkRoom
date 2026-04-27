# Calendar

A month grid. Day-of-week labels (S M T W T F S), 6 rows max.
Selected day uses a filled lavender circle by default.

## When to use
- A standalone date picker on a longer flow (not the DatePage day-strip).

## When not to use
- Single-week scrolling — use `DayStrip`.

## Props
- `value?: Date`.
- `month?: Date` — defaults to value or today.
- `onSelect?: (date: Date) => void`.
- `selectedTone?: "lavender" | "success"` — pass `"success"` if you want the green circle from `references/screenshots/Date.png`.
- `density?: "compact" | "regular"`.

## Owns
- Month grid rendering, leading blanks, selected-day circle.
- Date math (`startOfMonth`, `daysInMonth`).

## Does not own
- Date range selection.
- Disabled / unavailable date logic — extend the props.

## Example
```tsx
<Calendar value={new Date()} onSelect={(d) => setDate(d)} />
<Calendar value={d} selectedTone="success" /> {/* alt look */}
```
