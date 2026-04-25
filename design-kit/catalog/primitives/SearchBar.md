# SearchBar

A pill text input with a leading sparkles icon and a trailing dark `IconButton` (mic).

## When to use
- HomePage hero input.

## When not to use
- A plain form text field — use a native `<input>` or a future `TextField` primitive.

## Props
- All native `<input>` props except `size`.
- `onMicClick?: () => void`.
- `micLabel?: string` — defaults to `"Voice search"`.

## States
Idle • focus (input outline removed; ring should come from a parent if needed).

## Accessibility
The mic button is a real `<button>` with `aria-label`. The text input is unlabeled — wrap in a labeled landmark or add a `<label>` if needed in your app.

## Token usage
- `bg-muted` shell, `bg-inverse` mic button.

## Example
```tsx
<SearchBar
  placeholder="Asked anything about your health"
  onMicClick={() => startSpeech()}
/>
```
