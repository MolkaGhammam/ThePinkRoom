import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Search, Video } from "lucide-react";
import {
  BookingCTA,
  DayStrip,
  DoctorProfileCard,
  IconButton,
  MonthSwitcher,
  SectionHeader,
  SegmentedToggle,
  TimeGrid,
  TopBar,
} from "@kit";
import { days, featuredDoctor, slotsAM, slotsPM } from "@/data/mock";

type Mode = "in-clinic" | "virtual";
type Meridiem = "AM" | "PM";

export function DatePage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("in-clinic");
  const [meridiem, setMeridiem] = useState<Meridiem>("PM");
  const [selectedDay, setSelectedDay] = useState("2026-01-14");
  const [selectedSlot, setSelectedSlot] = useState("04:30");

  const slots = meridiem === "PM" ? slotsPM : slotsAM;

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <main className="flex-1 px-5 pb-32 pt-6">
        <TopBar
          variant="title"
          title="Book Appointment"
          onBack={() => navigate(-1)}
          right={<IconButton icon={Search} label="Search" tone="muted" size="md" />}
        />

        <DoctorProfileCard
          className="mt-5"
          name={featuredDoctor.name}
          credentials={featuredDoctor.credentials}
          headline={featuredDoctor.headline}
          price={featuredDoctor.price}
          perLabel={featuredDoctor.perLabel}
          photoSrc={featuredDoctor.photoSrc}
          icon={featuredDoctor.icon}
        />

        <SectionHeader
          className="mt-7"
          eyebrow="Today's"
          title="Availability"
          right={<MonthSwitcher month="January" />}
        />

        <SegmentedToggle<Mode>
          className="mt-4"
          options={[
            { value: "in-clinic", label: "In-Clinic", icon: MapPin },
            { value: "virtual", label: "Virtual", icon: Video },
          ]}
          value={mode}
          onChange={setMode}
        />

        <DayStrip
          className="mt-5"
          days={days}
          selectedKey={selectedDay}
          onSelect={setSelectedDay}
        />

        <div className="mt-7 flex items-center justify-between gap-3">
          <div className="font-serif text-[24px] font-bold leading-tight tracking-tight text-ink">Schedule</div>
          <SegmentedToggle<Meridiem>
            density="sm"
            width="compact"
            options={[
              { value: "AM", label: "AM" },
              { value: "PM", label: "Pm" },
            ]}
            value={meridiem}
            onChange={setMeridiem}
          />
        </div>

        <TimeGrid
          className="mt-4"
          slots={slots}
          selected={selectedSlot}
          onSelect={setSelectedSlot}
        />
      </main>

      <div className="sticky bottom-0 bg-canvas px-5 pb-6 pt-3">
        <BookingCTA onClick={() => alert("Appointment booked")} />
      </div>
    </div>
  );
}
