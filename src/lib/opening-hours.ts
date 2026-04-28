// Opening-hours JSON shape per spec §5.1.
// Keyed by weekday 0 (Sunday) through 6 (Saturday).

export type DayHours =
  | { closed: true }
  | {
      closed?: false;
      open: string; // "HH:MM"
      close: string;
      break?: { start: string; end: string };
    };

export type OpeningHours = Record<"0" | "1" | "2" | "3" | "4" | "5" | "6", DayHours>;

export const WEEKDAYS = ["0", "1", "2", "3", "4", "5", "6"] as const;
export type Weekday = (typeof WEEKDAYS)[number];

export const DEFAULT_OPENING_HOURS: OpeningHours = {
  "0": { closed: true },
  "1": { open: "09:00", close: "19:00" },
  "2": { open: "09:00", close: "19:00" },
  "3": { open: "09:00", close: "19:00" },
  "4": { open: "09:00", close: "19:00" },
  "5": { open: "09:00", close: "19:00" },
  "6": { open: "09:00", close: "18:00" },
};

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

export function isValidTime(t: string): boolean {
  return TIME_RE.test(t);
}

export function isValidOpeningHours(value: unknown): value is OpeningHours {
  if (!value || typeof value !== "object") return false;
  for (const day of WEEKDAYS) {
    const d = (value as Record<string, unknown>)[day];
    if (!d || typeof d !== "object") return false;
    const obj = d as Record<string, unknown>;
    if (obj.closed === true) continue;
    if (typeof obj.open !== "string" || !isValidTime(obj.open)) return false;
    if (typeof obj.close !== "string" || !isValidTime(obj.close)) return false;
    if (obj.open >= obj.close) return false;
    if (obj.break) {
      const br = obj.break as Record<string, unknown>;
      if (typeof br.start !== "string" || !isValidTime(br.start)) return false;
      if (typeof br.end !== "string" || !isValidTime(br.end)) return false;
      if (br.start >= br.end) return false;
      if (br.start < (obj.open as string) || br.end > (obj.close as string)) return false;
    }
  }
  return true;
}
