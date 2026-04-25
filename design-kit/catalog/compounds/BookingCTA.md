# BookingCTA

A full-width lavender pill button with a trailing white circular arrow `IconBadge`.

## When to use
- The bottom of DatePage (sticky position above the home indicator).

## When not to use
- A non-final action — use a regular `Button`.

## Props
- `label?` — defaults to `"Book Appointment"`.
- `onClick?`, `disabled?`.

## Owns
- Full-width sizing, lavender solid color, the trailing arrow plate.

## Does not own
- Sticky positioning — apply `sticky bottom-0 px-5 pb-6` from the page.

## Example
```tsx
<div className="sticky bottom-0 bg-canvas px-5 pb-6 pt-3">
  <BookingCTA onClick={book} />
</div>
```
