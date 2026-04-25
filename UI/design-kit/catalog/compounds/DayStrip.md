# DayStrip

A horizontal scroller of 7 (or N) day chips. The selected one is filled lavender.

## When to use
- The DatePage week strip.

## When not to use
- Full month — use `Calendar`.
- Single date trigger — build a simple button instead.

## Props
- `days: { key, weekday, day }[]`.
- `selectedKey`, `onSelect`.

## Owns
Horizontal scroll, gap, and stacked weekday/day-number chip layout.

## Does not own
Date math — pass already-formatted weekday strings and day numbers.

## Example
```tsx
<DayStrip
  days={[{ key: "1", weekday: "Mon", day: 12 }, …]}
  selectedKey={key}
  onSelect={setKey}
/>
```
