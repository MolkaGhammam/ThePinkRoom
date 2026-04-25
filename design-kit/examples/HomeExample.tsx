/**
 * Smaller composition demo for the kit catalog.
 * For the full HomePage, see src/pages/HomePage.tsx in the playground.
 */
import { Bell, HeartPulse } from "lucide-react";
import {
  AppointmentCard,
  IconButton,
  SearchBar,
  SectionHeader,
  SpecialistTile,
  TopBar,
} from "..";

export function HomeExample() {
  return (
    <div className="space-y-5 bg-canvas p-5">
      <TopBar
        variant="greeting"
        avatar={{ initials: "J" }}
        greeting="Hi, Jonathon"
        subGreeting="Welcome Back 👋"
        right={<IconButton icon={Bell} label="Notifications" tone="muted" />}
      />
      <h1 className="text-display-2xl font-extrabold leading-tight text-ink">
        Let's take the next step for your health!
      </h1>
      <SearchBar />
      <AppointmentCard
        name="Darlene Robertson"
        role="Neurologist"
        date="12th January, Monday"
        time="4.00 PM"
        avatar={{ initials: "DR" }}
      />
      <SectionHeader eyebrow="Pick the" title="Right Specialist" />
      <div className="grid grid-cols-2 gap-3">
        <SpecialistTile
          price="$35"
          role="Cardiologist"
          availability="17 Doctor Available"
          icon={HeartPulse}
          tone="lavender"
        />
        <SpecialistTile
          price="$45"
          role="Neurologist"
          availability="17 Doctor Available"
          icon={HeartPulse}
          tone="white"
        />
      </div>
    </div>
  );
}
