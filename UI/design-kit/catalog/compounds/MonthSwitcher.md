# MonthSwitcher

A compact "month name + prev/next chevrons" control.

## When to use
- The right-side slot of a `SectionHeader` (e.g. Availability).

## When not to use
- A full month grid — use `Calendar`.

## Props
- `month: string` — display name (e.g. "January").
- `onPrev?`, `onNext?`.

## Owns
Inline 3-element layout (chevron / label / chevron).

## Does not own
Date math — pass formatted month names.

## Example
```tsx
<MonthSwitcher month="January" onPrev={prev} onNext={next} />
```
