# SegmentedToggle

A two-segment pill toggle. Selected segment is **lavender solid + white text**.

## When to use
- In-Clinic / Virtual mode switch.
- AM / PM time switch.

## When not to use
- More than two options — extend the kit or use a different pattern.

## Props
- `options: [SegmentedToggleOption, SegmentedToggleOption]` — exactly two.
- `value`, `onChange` — controlled.
- `density?: "sm" | "md"`.
- `width?: "spread" | "compact"` — full-width vs sized to content.

## Owns
- Two-segment layout, selected color, optional leading icon plate inside each segment.

## Does not own
- Form labels — wrap in your form library.

## Accessibility
- `role="radiogroup"` on container, `role="radio"` + `aria-checked` on each.

## Example
```tsx
<SegmentedToggle
  options={[
    { value: "in-clinic", label: "In-Clinic", icon: MapPin },
    { value: "virtual", label: "Virtual", icon: Video },
  ]}
  value={mode}
  onChange={setMode}
/>
```
