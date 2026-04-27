# TopBar

The page header strip: left-side identity / navigation, right-side icon actions.

## Variants
- `variant="greeting"` — Avatar + greeting + sub-greeting (HomePage).
- `variant="title"` — back arrow + title (DatePage).

## When not to use
- For a section title inside the page — use `SectionHeader`.

## Props
- `variant: "greeting" | "title"`.
- Greeting variant: `avatar`, `greeting`, `subGreeting`.
- Title variant: `title`, `onBack`.
- `right?: ReactNode` — typically one or two `IconButton`s.

## Owns
The 1-row header layout, spacing, truncation behavior.

## Does not own
- Status bars / safe-area inset (handled by the page or playground container).
- Page background — the container sets it.

## Example
```tsx
<TopBar
  variant="title"
  title="Book Appointment"
  onBack={() => nav(-1)}
  right={<IconButton icon={Search} label="Search" />}
/>
```
