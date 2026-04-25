/**
 * Smaller composition demo for the kit catalog.
 * For the full DatePage, see src/pages/DatePage.tsx in the playground.
 */
import { useState } from "react";
import { HeartPulse, MapPin, Video } from "lucide-react";
import {
  BookingCTA,
  DayStrip,
  DoctorProfileCard,
  MonthSwitcher,
  SectionHeader,
  SegmentedToggle,
  TimeGrid,
} from "..";

const DAYS = [
  { key: "1", weekday: "Mon", day: 12 },
  { key: "2", weekday: "Tue", day: 13 },
  { key: "3", weekday: "Wed", day: 14 },
  { key: "4", weekday: "Thu", day: 15 },
];

const SLOTS = ["04:00", "04:30", "05:00", "05:30"];

export function DateExample() {
  const [mode, setMode] = useState<"in-clinic" | "virtual">("in-clinic");
  const [day, setDay] = useState("3");
  const [slot, setSlot] = useState("04:30");

  return (
    <div className="space-y-5 bg-canvas p-5">
      <DoctorProfileCard
        name="Dr. Olivia Bennett"
        credentials="MBBS, FCPS (Cardiologist)"
        headline="Heart Health, Screening & treatment"
        price="$35"
        icon={HeartPulse}
      />
      <SectionHeader
        eyebrow="Today's"
        title="Availability"
        right={<MonthSwitcher month="January" />}
      />
      <SegmentedToggle
        options={[
          { value: "in-clinic", label: "In-Clinic", icon: MapPin },
          { value: "virtual", label: "Virtual", icon: Video },
        ]}
        value={mode}
        onChange={setMode}
      />
      <DayStrip days={DAYS} selectedKey={day} onSelect={setDay} />
      <TimeGrid slots={SLOTS} selected={slot} onSelect={setSlot} columns={4} />
      <BookingCTA />
    </div>
  );
}
