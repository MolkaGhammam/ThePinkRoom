# Avatar

Circular image / initials placeholder for a person.

## When to use
- Greeting in TopBar.
- Doctor / patient identifier on a card row.

## When not to use
- Decorative imagery — use a plain `<img>` inside a `Card`.
- Brand logos — use a dedicated `Logo` element.

## Anatomy
Circular container • optional `<img>` • initials fallback • optional white ring.

## Props
- `src?: string` — image url.
- `alt?: string` — accessible label, also alt for the image.
- `initials?: string` — fallback when no `src`.
- `size?: "xs" | "sm" | "md" | "lg"` — 28 / 36 / 44 / 56 px.
- `ring?: boolean` — adds a 2px white ring (used on mint cards).

## States
Static. Hover/focus is owned by the surrounding interactive element.

## Accessibility
Provide `alt` (or `initials` doubles as label) so screen readers announce the avatar.

## Token usage
- `bg-muted` background fallback.
- `text-ink` initials color.

## Example
```tsx
<Avatar size="md" src="/me.jpg" alt="Jonathon" />
<Avatar size="md" initials="DR" alt="Darlene Robertson" />
```
