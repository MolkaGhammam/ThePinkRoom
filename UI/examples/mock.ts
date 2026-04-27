import { Brain, HeartPulse, Stethoscope } from "lucide-react";

export const currentUser = {
  name: "Jonathon",
  avatarInitials: "J",
};

export const nextAppointment = {
  id: "appt-1",
  doctor: {
    name: "Darlene Robertson",
    role: "Neurologist",
    avatarInitials: "DR",
  },
  date: "12th January, Monday",
  time: "4.00 PM",
  durationLabel: "50 min",
};

export const featuredDoctor = {
  id: "doc-olivia",
  name: "Dr. Olivia Bennett",
  credentials: "MBBS, FCPS (Cardiologist)",
  headline: "Heart Health, Screening & treatment",
  price: "$35",
  perLabel: "/per session",
  // Royalty-free placeholder portrait — substitute as needed.
  photoSrc:
    "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&q=80&auto=format&fit=crop",
  icon: HeartPulse,
};

export const specialists = [
  {
    id: "card",
    price: "$35",
    role: "Cardiologist",
    availability: "17 Doctor Available",
    icon: HeartPulse,
    tone: "lavender" as const,
  },
  {
    id: "neuro",
    price: "$45",
    role: "Neurologist",
    availability: "17 Doctor Available",
    icon: Brain,
    tone: "white" as const,
  },
  {
    id: "gp",
    price: "$55",
    role: "General Physician",
    availability: "24 Doctor Available",
    icon: Stethoscope,
    tone: "white" as const,
  },
];

export const days = [
  { key: "2026-01-12", weekday: "Mon", day: 12 },
  { key: "2026-01-13", weekday: "Tue", day: 13 },
  { key: "2026-01-14", weekday: "Wed", day: 14 },
  { key: "2026-01-15", weekday: "Thu", day: 15 },
  { key: "2026-01-16", weekday: "Fri", day: 16 },
  { key: "2026-01-17", weekday: "Sat", day: 17 },
  { key: "2026-01-18", weekday: "Sun", day: 18 },
];

export const slotsPM = [
  "04:00", "04:30", "05:00", "05:30",
  "06:00", "06:30", "07:00", "07:30",
];

export const slotsAM = [
  "08:00", "08:30", "09:00", "09:30",
  "10:00", "10:30", "11:00", "11:30",
];
