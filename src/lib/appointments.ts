import type { TimeWheelValue } from "@kit";
import type { AppointmentStatus } from "@/types/domain";
import type { OpeningHours, Weekday } from "./opening-hours";

// Status lifecycle per spec §6.6.
//   scheduled → confirmed | cancelled
//   confirmed → completed | no_show | cancelled
//   completed | no_show | cancelled → terminal
const TRANSITIONS: Record<AppointmentStatus, AppointmentStatus[]> = {
  scheduled: ["confirmed", "cancelled"],
  confirmed: ["completed", "no_show", "cancelled"],
  completed: [],
  no_show: [],
  cancelled: [],
};

export function isTerminal(status: AppointmentStatus): boolean {
  return TRANSITIONS[status].length === 0;
}

export function canTransitionTo(
  from: AppointmentStatus,
  to: AppointmentStatus,
): boolean {
  return TRANSITIONS[from].includes(to);
}

export function nextStatuses(from: AppointmentStatus): AppointmentStatus[] {
  return TRANSITIONS[from];
}

// 12-hour TimeWheelValue ↔ "HH:MM" 24-hour string conversions.
export function wheelToHHMM(v: TimeWheelValue): string {
  let h = v.hour % 12;
  if (v.meridiem === "PM") h += 12;
  return `${String(h).padStart(2, "0")}:${String(v.minute).padStart(2, "0")}`;
}

export function hhmmToWheel(hhmm: string, allowedMinutes: number[]): TimeWheelValue {
  const [hStr, mStr] = hhmm.split(":");
  const h24 = Number(hStr);
  const minute = Number(mStr);
  const meridiem: TimeWheelValue["meridiem"] = h24 >= 12 ? "PM" : "AM";
  const hour12 = h24 % 12 === 0 ? 12 : h24 % 12;
  // Snap to nearest allowed minute slot.
  const snapped =
    allowedMinutes.find((m) => m === minute) ??
    allowedMinutes.reduce((best, m) =>
      Math.abs(m - minute) < Math.abs(best - minute) ? m : best,
    );
  return { hour: hour12, minute: snapped, meridiem };
}

// Build a UTC ISO string from a "YYYY-MM-DD" date and "HH:MM" 24-hour time
// interpreted in the salon's local timezone. We rely on the browser/runtime's
// ability to handle the salon timezone for now (Africa/Tunis).
export function combineDateTimeISO(date: string, hhmm: string): string {
  // For Africa/Tunis the offset is fixed at +01:00 (no DST since 2009).
  // Hard-coding here keeps the helper deterministic and avoids needing a
  // tz library on the client.
  return new Date(`${date}T${hhmm}:00+01:00`).toISOString();
}

export function addMinutesISO(iso: string, minutes: number): string {
  const d = new Date(iso);
  d.setMinutes(d.getMinutes() + minutes);
  return d.toISOString();
}

// True if [aStart, aEnd) and [bStart, bEnd) overlap (half-open intervals).
export function intervalsOverlap(
  aStart: string,
  aEnd: string,
  bStart: string,
  bEnd: string,
): boolean {
  return aStart < bEnd && bStart < aEnd;
}

// Compute weekday from a "YYYY-MM-DD" date in the salon timezone.
// Africa/Tunis is +01:00 year-round so we can use UTC math safely.
export function weekdayOf(date: string): Weekday {
  const d = new Date(`${date}T12:00:00+01:00`);
  const dow = d.getUTCDay(); // 0..6 (Sun..Sat) at noon UTC ≈ 1pm Tunis
  return String(dow) as Weekday;
}

// True if [hhmmStart, hhmmEnd) fits within the day's open hours
// (and doesn't fall inside the lunch break, if defined).
export function fitsInOpeningHours(
  hours: OpeningHours,
  date: string,
  hhmmStart: string,
  hhmmEnd: string,
): boolean {
  const day = hours[weekdayOf(date)];
  if ("closed" in day && day.closed) return false;
  if (hhmmStart < day.open || hhmmEnd > day.close) return false;
  if (day.break) {
    // Reject if the appointment overlaps the break window.
    if (hhmmStart < day.break.end && day.break.start < hhmmEnd) return false;
  }
  return true;
}
