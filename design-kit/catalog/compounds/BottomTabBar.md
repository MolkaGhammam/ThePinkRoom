# BottomTabBar

A **floating** 5-icon bottom navigation pill. Pinned to the viewport, centered, with side margin and a soft shadow.

## When to use
- Primary mobile navigation across the app.

## When not to use
- For desktop / wide layouts — design a side-rail instead.
- Inside a card or section — the bar is intentionally page-level.

## Props
- `tabs: BottomTab[]` — `{ key, icon, label }`.
- `active: string` — the currently active key.
- `onChange?: (key: string) => void`.

## Owns
- Fixed positioning (`fixed bottom-5`), max-width tied to `max-w-viewport`, `mx-auto` centering, side gutters (`px-5`).
- The white pill surface, the rounded-full shape, the `shadow-card` elevation.
- The active "black circle behind the icon" treatment.

## Does not own
- Routing or navigation — pass `onChange` to wire to your router.
- Safe-area bottom inset — pages can wrap in their own safe-area container if needed.

## Page-level requirement
Because the bar is `fixed`, the page's scroll container should reserve `pb-28` (112 px) so the last item of content does not hide behind the bar.

```tsx
<main className="flex-1 px-5 pb-28 pt-6">
  {/* page content */}
</main>
<BottomTabBar tabs={tabs} active={key} onChange={setKey} />
```

## Accessibility
- `<nav aria-label="Primary">` wrapper.
- Each tab is an `aria-current="page"` button when active.

## Example
```tsx
<BottomTabBar
  tabs={[
    { key: "home", icon: House, label: "Home" },
    { key: "calendar", icon: CalendarDays, label: "Calendar" },
    /* … */
  ]}
  active={activeKey}
  onChange={setActiveKey}
/>
```
