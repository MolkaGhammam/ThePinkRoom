"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import type { Appointment, Client, PaymentBadge, User } from "@/types/domain";
import { weekdayOf } from "@/lib/appointments";
import type { OpeningHours } from "@/lib/opening-hours";

const PX_PER_HOUR = 96;
const PX_PER_MIN = PX_PER_HOUR / 60;

interface Props {
  date: string;
  appointments: Appointment[];
  openingHours: OpeningHours;
  clientById: Map<string, Client>;
  staffById: Map<string, User>;
  badgeByAppt: Map<string, PaymentBadge>;
  showStaff: boolean;
  onAppointmentClick: (a: Appointment) => void;
  onEmptySlotClick: (time: string) => void;
}

const BADGE_DOT: Record<PaymentBadge, string> = {
  unpaid: "bg-ink-muted",
  deposit: "bg-lavender-solid",
  paid: "bg-success",
  refunded: "bg-pink-fg",
};

function hhmmToMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

function minutesSinceTunisMidnight(iso: string): number {
  const d = new Date(iso);
  // Add 1h offset to convert UTC instant → Africa/Tunis local minutes-of-day.
  const tunis = new Date(d.getTime() + 60 * 60 * 1000);
  return tunis.getUTCHours() * 60 + tunis.getUTCMinutes();
}

function formatHH(h: number): string {
  return `${String(h).padStart(2, "0")}:00`;
}

const STATUS_CARD: Record<string, string> = {
  scheduled: "bg-lavender text-ink",
  confirmed: "bg-lavender-solid text-white",
  completed: "bg-mint text-mint-fg",
  no_show: "bg-muted text-ink-muted line-through",
  cancelled: "bg-muted text-ink-muted line-through",
};

export function DailyGrid({
  date,
  appointments,
  openingHours,
  clientById,
  staffById,
  badgeByAppt,
  showStaff,
  onAppointmentClick,
  onEmptySlotClick,
}: Props) {
  const t = useTranslations("calendar");

  const dayHours = openingHours[weekdayOf(date)];
  const closed = "closed" in dayHours && dayHours.closed === true;

  if (closed) {
    return (
      <div className="rounded-2xl bg-white p-8 text-center text-sm text-ink-secondary">
        {t("closedToday")}
      </div>
    );
  }

  const openHours = dayHours as Exclude<typeof dayHours, { closed: true }>;
  const startMin = hhmmToMinutes(openHours.open);
  const endMin = hhmmToMinutes(openHours.close);
  const totalMin = endMin - startMin;
  const totalPx = totalMin * PX_PER_MIN;

  const hourTicks: number[] = [];
  const firstHour = Math.ceil(startMin / 60);
  const lastHour = Math.floor(endMin / 60);
  for (let h = firstHour; h <= lastHour; h++) hourTicks.push(h);

  const breakBand = openHours.break
    ? {
        topPx: (hhmmToMinutes(openHours.break.start) - startMin) * PX_PER_MIN,
        heightPx:
          (hhmmToMinutes(openHours.break.end) - hhmmToMinutes(openHours.break.start)) *
          PX_PER_MIN,
      }
    : null;

  // Compute per-appointment positioning + lane assignment for overlaps.
  const positioned = useMemo(() => {
    const items = appointments
      .map((a) => {
        const sMin = minutesSinceTunisMidnight(a.start_at);
        const eMin = minutesSinceTunisMidnight(a.end_at);
        // Clip to visible window so the card has a positive height.
        const top = Math.max(0, sMin - startMin) * PX_PER_MIN;
        const bottom = Math.min(totalMin, eMin - startMin) * PX_PER_MIN;
        const height = Math.max(20, bottom - top);
        return { a, sMin, eMin, top, height };
      })
      .filter((it) => it.eMin > startMin && it.sMin < endMin)
      .sort((x, y) => x.sMin - y.sMin);

    // Greedy lane assignment for overlapping cards.
    const lanes: number[] = []; // lanes[i] = end-min of the last appt in that lane
    const result = items.map((it) => {
      let lane = lanes.findIndex((endMinOfLane) => endMinOfLane <= it.sMin);
      if (lane === -1) {
        lane = lanes.length;
        lanes.push(it.eMin);
      } else {
        lanes[lane] = it.eMin;
      }
      return { ...it, lane };
    });

    const totalLanes = Math.max(1, lanes.length);
    return { items: result, totalLanes };
  }, [appointments, startMin, endMin, totalMin]);

  return (
    <div className="rounded-2xl bg-white p-3">
      <div className="relative" style={{ height: totalPx }}>
        {/* Hour tick lines + labels */}
        {hourTicks.map((h) => {
          const top = (h * 60 - startMin) * PX_PER_MIN;
          return (
            <div
              key={h}
              className="absolute inset-x-0 flex items-start gap-2"
              style={{ top }}
            >
              <span className="w-12 shrink-0 -translate-y-1/2 text-right text-xs text-ink-muted">
                {formatHH(h)}
              </span>
              <span className="flex-1 -translate-y-px border-t border-line-subtle" />
            </div>
          );
        })}

        {/* Break band */}
        {breakBand && (
          <div
            aria-hidden
            className="absolute left-14 right-0 rounded-xl bg-pink-soft"
            style={{ top: breakBand.topPx, height: breakBand.heightPx }}
          />
        )}

        {/* Click-to-create overlay (each 30-min slot). */}
        {Array.from({ length: Math.floor(totalMin / 30) }).map((_, i) => {
          const slotMinFromStart = i * 30;
          const totalAbs = startMin + slotMinFromStart;
          const hh = String(Math.floor(totalAbs / 60)).padStart(2, "0");
          const mm = String(totalAbs % 60).padStart(2, "0");
          const time = `${hh}:${mm}`;
          return (
            <button
              key={i}
              type="button"
              onClick={() => onEmptySlotClick(time)}
              aria-label={`Créer à ${time}`}
              className="absolute left-14 right-0 cursor-pointer hover:bg-muted/30"
              style={{ top: slotMinFromStart * PX_PER_MIN, height: 30 * PX_PER_MIN }}
            />
          );
        })}

        {/* Appointment cards */}
        {positioned.items.map(({ a, top, height, lane }) => {
          const client = clientById.get(a.client_id);
          const staff = staffById.get(a.staff_user_id);
          const badge = badgeByAppt.get(a.id);
          const widthPct = 100 / positioned.totalLanes;
          const leftPct = lane * widthPct;
          return (
            <button
              key={a.id}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onAppointmentClick(a);
              }}
              className={
                "absolute z-10 overflow-hidden rounded-xl px-2 py-1 text-left text-xs shadow-soft transition hover:shadow-card " +
                (STATUS_CARD[a.status] ?? "bg-lavender text-ink")
              }
              style={{
                top,
                height: height - 2,
                left: `calc(3.5rem + ${leftPct}% + 2px)`,
                width: `calc(${widthPct}% - 4px)`,
              }}
            >
              {badge && (
                <span
                  aria-hidden
                  className={
                    "absolute right-1.5 top-1.5 inline-block h-1.5 w-1.5 rounded-full " +
                    BADGE_DOT[badge]
                  }
                />
              )}
              <div className="truncate pr-3 font-semibold leading-tight">
                {client?.full_name ?? "—"}
              </div>
              {height >= 36 && (
                <div className="truncate text-[10px] opacity-80">
                  {formatTime(a.start_at)} – {formatTime(a.end_at)}
                </div>
              )}
              {height >= 56 && showStaff && staff && (
                <div className="truncate text-[10px] opacity-70">
                  {staff.full_name.split(" ")[0]}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {appointments.length === 0 && (
        <p className="mt-4 text-center text-sm text-ink-secondary">
          {t("noAppointments")}
        </p>
      )}
    </div>
  );
}

function formatTime(iso: string): string {
  return new Intl.DateTimeFormat("fr-TN", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Africa/Tunis",
  }).format(new Date(iso));
}
