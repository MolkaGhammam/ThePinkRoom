# SectionHeader

A two-line title (eyebrow + title) with an optional right-side controls slot.

## When to use
- "Pick the / Right Specialist", "Today's / Availability".
- Anywhere you want a labeled section block on a page.

## When not to use
- The page header — use `TopBar`.

## Props
- `eyebrow?: ReactNode` — small label rendered above the title.
- `title: ReactNode`.
- `right?: ReactNode` — typically `IconButton`s or `MonthSwitcher`.
- `inline?: boolean` — render eyebrow + title on the same line.

## Owns
- Stack of eyebrow + title + bottom alignment of right slot.

## Example
```tsx
<SectionHeader
  eyebrow="Today's"
  title="Availability"
  right={<MonthSwitcher month="January" />}
/>
```
