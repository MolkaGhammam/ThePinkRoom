import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  House,
  CalendarDays,
  Stethoscope,
  User,
  Leaf,
  ArrowUpRight,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import {
  AppointmentCard,
  BottomTabBar,
  IconButton,
  SearchBar,
  SectionHeader,
  SpecialistTile,
  TopBar,
  type BottomTab,
} from "@kit";
import {
  currentUser,
  featuredDoctor,
  nextAppointment,
  specialists,
} from "@/data/mock";

const TABS: BottomTab[] = [
  { key: "home", icon: House, label: "Home" },
  { key: "calendar", icon: CalendarDays, label: "Calendar" },
  { key: "doctors", icon: Stethoscope, label: "Doctors" },
  { key: "profile", icon: User, label: "Profile" },
  { key: "wellness", icon: Leaf, label: "Wellness" },
];

export function HomePage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("home");

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <main className="flex-1 px-5 pb-28 pt-6">
        <TopBar
          variant="greeting"
          avatar={{
            initials: currentUser.avatarInitials,
            alt: currentUser.name,
            src: "https://images.unsplash.com/photo-1463453091185-61582044d556?w=120&q=80&auto=format&fit=crop",
          }}
          greeting={`Hi, ${currentUser.name}`}
          subGreeting="Welcome Back 👋"
          right={
            <>
              <IconButton
                icon={Sparkles}
                label="Open component showcase"
                tone="muted"
                size="md"
                onClick={() => navigate("/showcase")}
              />
              <IconButton icon={Bell} label="Notifications" tone="muted" size="md" />
            </>
          }
        />

        <h1 className="mt-6 font-serif text-[36px] font-bold leading-[1.05] tracking-tight text-ink">
          Let's take the next step for your health!
        </h1>

        <SearchBar className="mt-5" />

        <AppointmentCard
          className="mt-5"
          name={nextAppointment.doctor.name}
          role={nextAppointment.doctor.role}
          date={nextAppointment.date}
          time={nextAppointment.time}
          durationLabel={nextAppointment.durationLabel}
          avatar={{
            initials: nextAppointment.doctor.avatarInitials,
            alt: nextAppointment.doctor.name,
            src: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=160&q=80&auto=format&fit=crop",
          }}
          onClick={() => navigate(`/book/${featuredDoctor.id}`)}
        />

        <SectionHeader
          className="mt-7"
          eyebrow="Pick the"
          title="Right Specialist"
          right={
            <>
              <IconButton
                icon={SlidersHorizontal}
                label="Filter specialists"
                tone="white"
                size="sm"
                className="shadow-soft"
              />
              <IconButton
                icon={ArrowUpRight}
                label="See all"
                tone="white"
                size="sm"
                className="shadow-soft"
              />
            </>
          }
        />

        <div className="mt-4 grid grid-cols-2 gap-3">
          {specialists.map((s) => (
            <SpecialistTile
              key={s.id}
              price={s.price}
              role={s.role}
              availability={s.availability}
              icon={s.icon}
              tone={s.tone}
              onClick={() => navigate(`/book/${featuredDoctor.id}`)}
            />
          ))}
        </div>
      </main>

      <BottomTabBar tabs={TABS} active={tab} onChange={setTab} />
    </div>
  );
}
