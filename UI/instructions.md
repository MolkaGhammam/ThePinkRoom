# UI Design Kit — Agent Instructions

You are working in a fresh Next.js (App Router) + TypeScript project. The user has dropped a `UI/` folder into the repo containing a complete, opinionated design system. **Use it. Do not redesign it. Do not reinvent its components.**

This file is your single source of truth. Read it top to bottom before writing code.

---

## 1. What's in `UI/`

```
UI/
  design-kit/                  ← the actual library
    tokens/                    ← colors, radii, type, spacing (single source of truth)
    primitives/                ← Avatar, Button, Card, Chip, IconBadge, IconButton,
                                 Pill, SearchBar, Tag
    compounds/                 ← TopBar, BottomTabBar, AppointmentCard,
                                 DoctorProfileCard, SpecialistTile, SegmentedToggle,
                                 SectionHeader, MonthSwitcher, DayStrip, TimeGrid,
                                 TimeWheel, Calendar, BookingCTA
    examples/                  ← small composition demos (catalog references)
    catalog/                   ← one .md per component (purpose, props, when not to use)
    utils/cn.ts                ← clsx + tailwind-merge helper
    CLAUDE.md                  ← non-negotiable visual rules — READ THIS NEXT
    README.md                  ← top-level kit overview
    index.ts                   ← public exports — import from here
  examples/                    ← full screen references (HomePage, DatePage, ShowcasePage)
                                 → READ-ONLY. Do NOT copy into the app as-is. Use them
                                   to learn how the kit composes.
  config-templates/            ← copy/merge into the host project
    tailwind.config.ts
    tsconfig.snippet.json
    layout.tsx                 ← Next.js App Router root layout with next/font wiring
    globals.css
    postcss.config.js
    package.deps.json
  instructions.md              ← THIS FILE
```

---

## 2. Integration — first session only

If `design-kit/` is not yet at the project root, do the integration **before** writing any UI. Follow these steps in order. Stop and ask the user if any step fails or conflicts with existing code.

### 2.1 Move the kit to the project root

```bash
# from project root
mv UI/design-kit ./design-kit
```

The kit lives at `<project-root>/design-kit/` from now on. You may keep `UI/examples/`, `UI/config-templates/`, and `UI/instructions.md` where they are (or anywhere) — they are reference material, not runtime code.

### 2.2 Install peer dependencies

```bash
npm install lucide-react clsx tailwind-merge
npm install -D tailwindcss postcss autoprefixer
```

(Skip the dev deps if your Next project already has Tailwind set up.)

### 2.3 Wire Tailwind

- If `tailwind.config.ts` does not exist, copy `UI/config-templates/tailwind.config.ts` to the project root.
- If it does exist, **merge**, don't overwrite:
  - Add `import { designKitPreset } from "./design-kit/tokens/tailwind-preset";` at the top.
  - Add the preset to `presets`.
  - Make sure `content` includes `./design-kit/**/*.{ts,tsx}`.
  - In `theme.extend.fontFamily`, alias `sans` to `var(--font-sans)` and `serif` to `var(--font-serif)`.

If `postcss.config.js` does not exist, copy `UI/config-templates/postcss.config.js`.

### 2.4 Wire fonts (Next.js App Router)

Replace or merge `app/layout.tsx` with `UI/config-templates/layout.tsx`. It uses `next/font/google` to load **Plus Jakarta Sans** (sans body) and **Fraunces** (serif display) and exposes them as CSS variables `--font-sans` and `--font-serif`.

Do **not** add a Google Fonts `<link>` tag. Use `next/font` only.

### 2.5 Wire globals

Replace or merge `app/globals.css` with `UI/config-templates/globals.css`. It contains the `@tailwind` directives, the body background (`bg-canvas`), and the `.scrollbar-none` utility used by `DayStrip` and `TimeWheel`.

### 2.6 Add the `@kit` path alias

Merge `UI/config-templates/tsconfig.snippet.json` into the project's `tsconfig.json` `compilerOptions.paths`:

```jsonc
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@kit": ["./design-kit/index.ts"],
      "@kit/*": ["./design-kit/*"]
    }
  }
}
```

Next.js resolves `tsconfig.json` paths automatically — no `next.config.ts` change is needed.

### 2.7 Smoke-test

Run `npm run dev`. Open a page, drop `<TopBar variant="title" title="Hello" />` from `@kit`, and confirm:

- Plus Jakarta Sans is the default body font.
- `bg-canvas` (a soft blush) is the page background.
- The kit imports resolve.

If any of those fail, stop and surface the failure to the user before writing more code.

---

## 3. The visual language — non-negotiable

Read **`design-kit/CLAUDE.md`** in full now. It contains the canonical rules. The TL;DR:

- **Pink** (`bg-pink`) = identity / brand surfaces (cards holding doctor or appointment context).
- **Lavender** (`bg-lavender-solid`) = selected / primary action color (CTAs, selected day, selected slot, active toggle).
- **Mint** = minor accent only. Never a primary surface.
- **All controls are pills** (`rounded-full`).
- **Cards are `rounded-2xl`** by default.
- **Serif (`font-serif`) is for display only**: H1 hero, big section titles, large numerals (price). Never on body, labels, chips, or button text.
- **No pure black / pure white text.** Use `text-ink`, `text-ink-secondary`, `text-ink-muted`, `text-pink-fg`.
- **No drop shadows** beyond `shadow-soft` and `shadow-card`.
- **No arbitrary hex** (`bg-[#abc123]`). All colors come from token-driven Tailwind classes.

---

## 4. How to build a screen — the loop

Every time the user asks for a new screen, panel, or feature, follow this loop:

1. **Read the user's request.** Identify the visual elements: header, buttons, cards, lists, inputs, etc.
2. **Map each element to an existing kit component.** Use the table in `design-kit/CLAUDE.md` ("Component selection guide"). Open `design-kit/catalog/` and read the relevant `.md` files for props and when-not-to-use rules.
3. **List your choices to the user before coding.** A short message like:

   > "I'll build the doctor profile screen with: `TopBar` (variant="title"), `DoctorProfileCard`, `SectionHeader`, `Calendar`, `BookingCTA`. No new components needed. Sound right?"

   Wait for confirmation, then code.
4. **Import from `@kit`.** Always:

   ```tsx
   import { TopBar, DoctorProfileCard, BookingCTA } from "@kit";
   ```

   Never import individual files (`@kit/compounds/TopBar`) unless you have a real reason — `@kit` is the public surface.
5. **Use Tailwind classes from the token system only.** Never `bg-[#abc]`, `text-[16px]`, or hardcoded hex. If the value you need does not exist:
   - **Stop. Add it to `design-kit/tokens/index.ts` first.** Re-export through `tokens/tailwind-preset.ts`. Then use the new class.
6. **Page-level layout is your job.** The page file owns the outer `<main>`, the column container, and the bottom padding (`pb-28` if the page uses `BottomTabBar`). The kit components do not own page layout.
7. **Read the example screens for composition patterns.** `UI/examples/HomePage.tsx`, `DatePage.tsx`, and `ShowcasePage.tsx` show how the kit composes. They are reference, not boilerplate — adapt; do not paste.

---

## 5. When the kit is missing a pattern

If a screen needs a visual pattern that is not in the kit:

1. **Confirm it is missing.** Search `design-kit/primitives/` and `design-kit/compounds/` first.
2. **Decide where it lives.** Atom-level (button, chip, input) → `primitives/`. Molecule-level (header, card with multiple slots, repeated row) → `compounds/`.
3. **Add the new file** under the correct folder. Match the API style of neighboring components: typed props, `cn` utility, token-driven classes, `aria-*` attributes where relevant.
4. **Export it** from the matching `index.ts`.
5. **Write a catalog doc** in `design-kit/catalog/primitives/` or `compounds/` matching the existing format (purpose, when to use, when not to use, props, owns / does not own, example).
6. **Now use it.**

The kit grows by being used. Do **not** write one-off styled components inside the page — that is how design drift starts.

---

## 6. What you must not do

- ❌ Do not use arbitrary Tailwind values: `bg-[#abc123]`, `text-[15px]`, `rounded-[14px]`. **Tokens or nothing.**
- ❌ Do not introduce a new typeface. Plus Jakarta Sans for body, Fraunces for display, full stop.
- ❌ Do not put `font-serif` on body, labels, chips, or button text.
- ❌ Do not invent a new "primary" color. Lavender is primary. Pink is identity. Mint is a minor accent.
- ❌ Do not use square / right-angled buttons or cells. All controls are pills.
- ❌ Do not add drop shadows beyond `shadow-soft` and `shadow-card`.
- ❌ Do not bypass `@kit` to write a one-off `<button className="bg-purple-500 …">`. Extend the kit instead.
- ❌ Do not modify `design-kit/tokens/index.ts` to add ad-hoc values for a single screen. If you need a new token, propose it to the user first and explain why the existing tokens fall short.
- ❌ Do not edit example files in `UI/examples/`. They are read-only reference.
- ❌ Do not delete catalog `.md` docs.

---

## 7. What you should do

- ✅ Read `design-kit/CLAUDE.md` and `design-kit/catalog/<component>.md` whenever you reach for a component you have not used in this session.
- ✅ Prefer composing kit components over styling raw HTML.
- ✅ List the components you plan to use **before** writing JSX and wait for user confirmation on non-trivial screens.
- ✅ Preserve the user's existing routing, data fetching, auth, forms, API calls, and business logic. Change presentation only unless the user explicitly asked for a structural change.
- ✅ When a screen needs responsive behavior beyond the 390 px mobile viewport, ask before assuming.
- ✅ Run `npx tsc --noEmit` after changes to catch import / type issues early.
- ✅ When something in the kit feels wrong for the user's case, **say so** and propose adding to the kit, rather than working around it inline.

---

## 8. Canonical agent prompt template

When you are asked to convert or build a screen, your first response should follow this shape:

```
I read UI/instructions.md and design-kit/CLAUDE.md. Here's my plan for <SCREEN>:

Components I'll use (all from @kit):
- TopBar (variant="…")
- <Compound>
- <Primitive>
…

Tokens I'll use:
- bg-pink, bg-lavender-solid, text-ink, font-serif on H1, …

New kit components needed: none / [list]

Existing logic I'll preserve: routing, auth, the <X> data hook, …

Page-level layout: <main> with px-5 pb-28 pt-6, etc.

Confirm and I'll code.
```

This proves you read the rules, gives the user a checkpoint, and prevents 80% of the rework loops.

---

## 9. Quick component cheat-sheet

| Need | Component |
|---|---|
| Page header (greeting OR back+title) | `TopBar` |
| Section title with optional right controls | `SectionHeader` |
| 5-icon mobile nav (floating pill) | `BottomTabBar` |
| 2-option pill toggle | `SegmentedToggle` |
| Single icon tap target | `IconButton` |
| Decorative icon plate | `IconBadge` |
| Static label / badge | `Tag` |
| Selectable pill (day, time, segment) | `Chip` |
| Surface block | `Card` (`white` / `pink` / `lavender` / `mint` / `muted`) |
| Pill text input with mic | `SearchBar` |
| Primary CTA | `Button` (`tone="lavender"`) or `BookingCTA` for sticky-bottom |
| Doctor's next appointment block | `AppointmentCard` |
| Doctor profile header | `DoctorProfileCard` |
| Specialty grid tile | `SpecialistTile` |
| Week / weekday strip | `DayStrip` |
| Time slot grid | `TimeGrid` |
| Hour / minute scroll wheel | `TimeWheel` |
| Full month grid | `Calendar` |
| Compact month switcher | `MonthSwitcher` |

For full props and when-not-to-use rules, open the matching `.md` in `design-kit/catalog/`.

---

## 10. If you're stuck

- The component you need is missing → see §5 (add it to the kit).
- A token value you need doesn't exist → propose it to the user before adding.
- A rule in `CLAUDE.md` conflicts with the user's request → quote the rule, explain the conflict, ask the user how to resolve.
- An example screen does it differently than CLAUDE.md says → CLAUDE.md wins. The example may have been written before a rule was tightened.
- Anything else → ask the user. Do not guess on visual decisions.
