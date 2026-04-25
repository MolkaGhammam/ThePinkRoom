# Design Kit — AI Usage Guide

This kit is the visual language extracted from the **HomePage** and **DatePage** screenshots in `references/screenshots/`. When you build new screens, first reach for these components — do **not** reinvent buttons, chips, or cards.

## Visual language in one paragraph

Warm cream-pink canvas (`bg-canvas`). **Pink cards** (`bg-pink`) hold "doctor / appointment" identity — this is the brand's primary surface color. **Lavender** (`bg-lavender-solid`) is the **primary action and selection color** — used for CTAs, the selected day, the selected time slot, the active segmented option. **Mint** (`bg-mint`) is a minor secondary accent for badges and small pills only. Pure white cards (`bg-white`) host other content. Pills are everywhere: search bar, segmented toggles, chips, the booking CTA. Icons are line-style, in small white circular `IconBadge`s; the active bottom-tab icon sits inside a near-black filled circle (`bg-inverse`). Typography is **dual-typeface**: an editorial serif (`font-serif`, Fraunces) for **display headlines and big numerals only**, and a geometric sans (Plus Jakarta Sans, the default `font-sans`) for everything else. Text is plum-ink (`text-ink`), never pure black.

## Non-negotiable rules

1. **Pink means "doctor / appointment / brand identity."** Do not use it for actions or generic surfaces.
2. **Lavender means "selected/primary action."** Do not use it as a passive surface color.
3. **Mint is a minor accent only** (small badges, soft tags). Never the primary card surface — that role belongs to pink now.
4. **All interactive control surfaces are pills** (`rounded-full`). Do not use square/rectangle buttons.
5. **No drop shadows** beyond the soft `shadow-soft` / `shadow-card` tokens. The atmosphere is flat, not glassy.
6. **Cards are 2xl-rounded** (`rounded-2xl`) by default. Smaller radii only for chips and pills.
7. **No pure black, no pure white text.** Use `text-ink`, `text-ink-secondary`, `text-ink-muted`, `text-pink-fg`.
8. **Serif is for display only.** Use `font-serif` on H1, big section titles, and large numerals (price). Body, labels, captions, chips, and buttons stay sans (the default).

## Component selection guide

| Need | Use |
|---|---|
| Page header (greeting OR back+title) | `TopBar` |
| Section title with optional right controls | `SectionHeader` |
| 5-icon mobile nav | `BottomTabBar` |
| 2-option pill toggle | `SegmentedToggle` |
| Single icon tap target | `IconButton` |
| Decorative icon plate | `IconBadge` |
| Static label/badge | `Tag` |
| Selectable pill (day, time, segment) | `Chip` |
| Surface block | `Card` (`white`/`mint`/`lavender`/`muted`) |
| Pill text input with mic | `SearchBar` |
| Primary CTA | `Button` (`tone="lavender"`) or `BookingCTA` for sticky |
| Doctor's next appointment block | `AppointmentCard` |
| Doctor profile header | `DoctorProfileCard` |
| Specialty grid tile | `SpecialistTile` |
| Week / weekday strip | `DayStrip` |
| Time slot grid | `TimeGrid` |
| Hour/minute scroll wheel | `TimeWheel` |
| Full month grid | `Calendar` |
| Compact month switcher | `MonthSwitcher` |

## Token usage

- Always import colors via Tailwind classes generated from the preset (`bg-canvas`, `bg-mint`, `text-ink`, etc.) — never hard-code hex values.
- If you need a value outside the system, **add it to `design-kit/tokens/index.ts` first**, then re-export it through the Tailwind preset. Do not use arbitrary `[#abcdef]` Tailwind classes inline.

## Anti-patterns

- A new "primary action" color that isn't lavender.
- A new identity surface that isn't `pink`.
- Promoting `mint` back to a primary surface — it's a minor accent now.
- A new "data card" surface that isn't `white` / `pink` / `lavender` / `mint` / `muted`.
- Square buttons or square selectable cells.
- Adding `rounded-md` or `rounded-xl` to a chip — chips are always `rounded-full`.
- A heavy drop shadow.
- Putting `font-serif` on body, labels, chips, or button text — display headlines and large numerals only.
- Reaching past the kit to do `<button className="bg-purple-500 …">` — extend the kit instead.

## Applying the kit to an existing app

1. Read the existing app's routes/screens.
2. For each screen, list the visual elements on it. Map each one to a primitive or compound from the table above.
3. **Preserve all behavior** (auth, routing, forms, API calls). Only swap presentation classes / components.
4. Convert one screen at a time. After each screen, manually compare to the closest reference screenshot at a 390px viewport width.
5. If a screen needs a pattern not in the kit, **add it to `design-kit/`** (with a catalog doc) rather than building it inline in the page. The kit grows by being used.

## Where things live

- `tokens/` — single source of truth (colors, radii, type, sizing, effects). Tailwind preset bridges to utility classes.
- `primitives/` — atoms (Avatar, Chip, Card, Button, …). Cannot import from `compounds/`.
- `compounds/` — molecules (TopBar, AppointmentCard, …). Compose primitives. Do **not** import other compounds (keep the dependency graph one-way).
- `examples/` — short composition demos for catalog pages. Import from `..` (the kit root).
- `catalog/` — `.md` per component (purpose / when / props / a11y / token usage / examples).
- Playground: `src/pages/HomePage.tsx`, `src/pages/DatePage.tsx`. Page-level layout lives here, not inside the kit.
