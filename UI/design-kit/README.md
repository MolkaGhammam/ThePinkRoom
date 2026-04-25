# The Pink Room — Design Kit

A reusable React + TypeScript + Tailwind design kit extracted from the HomePage and DatePage health-app screenshots in `references/screenshots/`, with an editorial serif + soft-pink direction inspired by the Etherea palette/typography reference.

> **Palette**: blush **pink** (identity / cards) + **lavender** (selected & CTA) + small **mint** accent + cream canvas + plum-ink text.
> **Type**: editorial **Fraunces** serif on display headlines, **Plus Jakarta Sans** for body.
> See `CLAUDE.md` for non-negotiable rules.

## Install / use in an existing app

1. **Copy these into your app:**

   ```
   design-kit/
   ```

2. **Install peer dependencies:**

   ```bash
   npm install lucide-react clsx tailwind-merge
   ```

3. **Wire up Tailwind** by adding the preset to your `tailwind.config.ts`:

   ```ts
   import { designKitPreset } from "./design-kit/tokens/tailwind-preset";

   export default {
     content: ["./src/**/*.{ts,tsx}", "./design-kit/**/*.{ts,tsx}"],
     presets: [designKitPreset],
   };
   ```

4. **Import the fonts** (already wired in `index.html` of this playground — copy that `<link>` block into your app's HTML head):

   ```html
   <link
     href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Fraunces:opsz,wght,SOFT@9..144,300..900,0..100&display=swap"
     rel="stylesheet"
   />
   ```

5. **Import components from the root:**

   ```tsx
   import { Card, Chip, TopBar, AppointmentCard } from "./design-kit";
   ```

   Or via the path alias (this repo uses `@kit`).

## Folder map

```
design-kit/
  tokens/                  semantic tokens + Tailwind preset
  utils/                   cn (clsx + twMerge)
  primitives/              Avatar, IconBadge, IconButton, Pill, Chip,
                           Tag, Card, SearchBar, Button
  compounds/               TopBar, BottomTabBar, SegmentedToggle,
                           SectionHeader, MonthSwitcher, DayStrip,
                           TimeGrid, TimeWheel, Calendar,
                           AppointmentCard, SpecialistTile,
                           DoctorProfileCard, BookingCTA
  examples/                small composition demos
  catalog/                 one .md per component
  CLAUDE.md                rules for AI agents
  README.md                this file
  index.ts                 re-exports everything
```

## Quick component reference

```tsx
// Primitives
<Avatar src="/me.jpg" alt="Me" size="md" />
<IconBadge icon={CalendarIcon} tone="lavender" />
<IconButton icon={Bell} label="Notifications" tone="muted" />
<Tag tone="white">50 min</Tag>
<Chip selected>04:30</Chip>
<Card tone="mint" radius="2xl" padding="md">…</Card>
<SearchBar placeholder="Asked anything about your health" />
<Button tone="lavender" size="lg" fullWidth trailingIcon={ChevronsRight}>
  Book Appointment
</Button>

// Compounds
<TopBar variant="title" title="Book Appointment" onBack={back} />
<BottomTabBar tabs={tabs} active={key} onChange={setKey} />
<SegmentedToggle options={[…]} value={v} onChange={setV} />
<SectionHeader eyebrow="Today's" title="Availability" right={…} />
<DayStrip days={days} selectedKey={k} onSelect={setK} />
<TimeGrid slots={slots} selected={s} onSelect={setS} />
<Calendar value={d} onSelect={setD} />
<AppointmentCard … />
<SpecialistTile … />
<DoctorProfileCard … />
<BookingCTA onClick={book} />
```

## Run the playground

```bash
npm install
npm run dev
```

Open `http://localhost:5173` — HomePage by default. Tap the appointment card or any specialist tile to navigate to DatePage. The viewport is constrained to 390px (mobile-first), centered on desktop.

## Build

```bash
npm run build       # tsc + vite build
npm run typecheck   # tsc only
```

## Customize tokens

Edit `design-kit/tokens/index.ts`. Anything you add there flows through `tokens/tailwind-preset.ts` to Tailwind utility classes. **Do not** sprinkle hex values inside components.

## See also

- [`design-kit/CLAUDE.md`](./CLAUDE.md) — visual language rules and component selection guide for AI agents.
- [`design-kit/catalog/`](./catalog/) — per-component docs.
- `src/pages/HomePage.tsx` and `src/pages/DatePage.tsx` — full playground compositions.
