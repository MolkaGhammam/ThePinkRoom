"use client";

import { useMemo } from "react";
import type { Appointment, Client, PaymentBadge, User } from "@/types/domain";
import { weekdayOf } from "@/lib/appointments";
import type { OpeningHours, Weekday } from "@/lib/opening-hours";

const PX_PER_HOUR = 64;
const PX_PER_MIN = PX_PER_HOUR / 60;

interface Props {
  weekStartDate: string; // Monday, YYYY-MM-DD
  appointments: Appointment[];
  openingHours: OpeningHours;
  clientById: Map<string, Client>;
  staffById: Map<string, User>;
  badgeByAppt: Map<string, PaymentBadge>;
  showStaff: boolean;
  onAppointmentClick: (a: Appointment) => void;
  onEmptySlotClick: (date: string, time: string) => void;
}

const BADGE_DOT: Record<PaymentBadge, string> = {
  unpaid: "bg-ink-muted",
  deposit: "bg-lavender-solid",
  paid: "bg-success",
  refunded: "bg-pink-fg",
};

const WEEK_LABELS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

function hhmmToMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

function minutesSinceTunisMidnight(iso: string): number {
  const d = new Date(iso);
  const tunis = new Date(d.getTime() + 60 * 60 * 1000);
  return tunis.getUTCHours() * 60 + tunis.getUTCMinutes();
}

function shiftDate(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + days);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
}

function dateOfMonth(dateStr: string): number {
  return Number(dateStr.split("-")[2]);
}

const STATUS_CARD: Record<string, string> = {
  scheduled: "bg-lavender text-ink",
  confirmed: "bg-lavender-solid text-white",
  completed: "bg-mint text-mint-fg",
  no_show: "bg-muted text-ink-muted line-through",
  cancelled: "bg-muted text-ink-muted line-through",
};

export function WeeklyGrid({
  weekStartDate,
  appointments,
  openingHours,
  clientById,
  staffById,
  badgeByAppt,
  showStaff,
  onAppointmentClick,
  onEmptySlotClick,
}: Props) {
  // Derive the global open/close window across the week so all columns align.
  const days: { dateStr: string; weekday: Weekday }[] = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => {
        const dateStr = shiftDate(weekStartDate, i);
        return { dateStr, weekday: weekdayOf(dateStr) };
      }),
    [weekStartDate],
  );

  const { gridStartMin, gridEndMin } = useMemo(() => {
    let earliest = 24 * 60;
    let latest = 0;
    for (const day of days) {
      const h = openingHours[day.weekday];
      if ("closed" in h && h.closed) continue;
      earliest = Math.min(earliest, hhmmToMinutes(h.open));
      latest = Math.max(latest, hhmmToMinutes(h.close));
    }
    if (earliest >= latest) return { gridStartMin: 9 * 60, gridEndMin: 19 * 60 };
    return { gridStartMin: earliest, gridEndMin: latest };
  }, [days, openingHours]);

  const totalMin = gridEndMin - gridStartMin;
  const totalPx = totalMin * PX_PER_MIN;

  const hourTicks: number[] = [];
  for (let h = Math.ceil(gridStartMin / 60); h <= Math.floor(gridEndMin / 60); h++) {
    hourTicks.push(h);
  }

  // Bucket appointments by date and assign lanes within each day.
  const byDay = useMemo(() => {
    const buckets = new Map<
      string,
      { a: Appointment; top: number; height: number; lane: number }[]
    >();
    for (const day of days) buckets.set(day.dateStr, []);

    for (const a of appointments) {
      const apptDate = new Date(a.start_at);
      const tunis = new Date(apptDate.getTime() + 60 * 60 * 1000);
      const dateStr = `${tunis.getUTCFullYear()}-${String(tunis.getUTCMonth() + 1).padStart(2, "0")}-${String(tunis.getUTCDate()).padStart(2, "0")}`;
      const arr = buckets.get(dateStr);
      if (!arr) continue;

      const sMin = minutesSinceTunisMidnight(a.start_at);
      const eMin = minutesSinceTunisMidnight(a.end_at);
      const top = Math.max(0, sMin - gridStartMin) * PX_PER_MIN;
      const bottom = Math.min(totalMin, eMin - gridStartMin) * PX_PER_MIN;
      const height = Math.max(18, bottom - top);
      arr.push({ a, top, height, lane: 0 });
    }

    // Sort and lane-assign per day.
    for (const [, arr] of buckets) {
      arr.sort(
        (x, y) =>
          minutesSinceTunisMidnight(x.a.start_at) -
          minutesSinceTunisMidnight(y.a.start_at),
      );
      const lanes: number[] = [];
      for (const item of arr) {
        const sMin = minutesSinceTunisMidnight(item.a.start_at);
        const eMin = minutesSinceTunisMidnight(item.a.end_at);
        let lane = lanes.findIndex((laneEnd) => laneEnd <= sMin);
        if (lane === -1) {
          lane = lanes.length;
          lanes.push(eMin);
        } else {
          lanes[lane] = eMin;
        }
        item.lane = lane;
      }
    }

    return buckets;
  }, [appointments, days, gridStartMin, totalMin]);

  return (
    <div className="rounded-2xl bg-white p-3">
      {/* Day header */}
      <div className="flex">
        <div className="w-12 shrink-0" />
        <div className="grid flex-1 grid-cols-7 gap-1">
          {days.map((day, idx) => (
            <div
              key={day.dateStr}
              className="rounded-lg bg-muted/40 py-1 text-center text-xs"
            >
              <div className="font-semibold text-ink">{WEEK_LABELS[idx]}</div>
              <div className="text-ink-secondary">{dateOfMonth(day.dateStr)}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-2 flex">
        {/* Hour gutter */}
        <div className="relative w-12 shrink-0" style={{ height: totalPx }}>
          {hourTicks.map((h) => (
            <span
              key={h}
              className="absolute right-2 -translate-y-1/2 text-right text-xs text-ink-muted"
              style={{ top: (h * 60 - gridStartMin) * PX_PER_MIN }}
            >
              {String(h).padStart(2, "0")}:00
            </span>
          ))}
        </div>

        {/* Day columns */}
        <div className="relative grid flex-1 grid-cols-7 gap-1" style={{ height: totalPx }}>
          {/* Hour grid lines spanning all columns */}
          {hourTicks.map((h) => (
            <div
              key={`line-${h}`}
              aria-hidden
              className="pointer-events-none absolute inset-x-0 -translate-y-px border-t border-line-subtle"
              style={{ top: (h * 60 - gridStartMin) * PX_PER_MIN }}
            />
          ))}

          {days.map((day) => {
            const dayHours = openingHours[day.weekday];
            const closedDay = "closed" in dayHours && dayHours.closed === true;
            const open = closedDay ? null : (dayHours as Exclude<typeof dayHours, { closed: true }>);
            const items = byDay.get(day.dateStr) ?? [];

            const openTop = open ? (hhmmToMinutes(open.open) - gridStartMin) * PX_PER_MIN : 0;
            const openHeight = open
              ? (hhmmToMinutes(open.close) - hhmmToMinutes(open.open)) * PX_PER_MIN
              : 0;

            return (
              <div key={day.dateStr} className="relative">
                {closedDay ? (
                  <div
                    aria-hidden
                    className="absolute inset-0 rounded-lg bg-muted/40"
                  />
                ) : (
                  <>
                    {/* Open band */}
                    <div
                      aria-hidden
                      className="absolute inset-x-0 rounded-lg bg-canvas"
                      style={{ top: openTop, height: openHeight }}
                    />
                    {/* Break band */}
                    {open?.break && (
                      <div
                        aria-hidden
                        className="absolute inset-x-0 rounded bg-pink-soft"
                        style={{
                          top: (hhmmToMinutes(open.break.start) - gridStartMin) * PX_PER_MIN,
                          height:
                            (hhmmToMinutes(open.break.end) -
                              hhmmToMinutes(open.break.start)) *
                            PX_PER_MIN,
                        }}
                      />
                    )}
                    {/* Click-to-create slots, every 30 min within open hours */}
                    {open &&
                      Array.from({
                        length: Math.floor(
                          (hhmmToMinutes(open.close) - hhmmToMinutes(open.open)) / 30,
                        ),
                      }).map((_, i) => {
                        const slotMin = hhmmToMinutes(open.open) + i * 30;
                        const hh = String(Math.floor(slotMin / 60)).padStart(2, "0");
                        const mm = String(slotMin % 60).padStart(2, "0");
                        return (
                          <button
                            key={i}
                            type="button"
                            onClick={() => onEmptySlotClick(day.dateStr, `${hh}:${mm}`)}
                            aria-label={`Créer à ${hh}:${mm}`}
                            className="absolute inset-x-0 cursor-pointer hover:bg-muted/30"
                            style={{
                              top: (slotMin - gridStartMin) * PX_PER_MIN,
                              height: 30 * PX_PER_MIN,
                            }}
                          />
                        );
                      })}
                  </>
                )}

                {/* Appointment cards */}
                {items.map(({ a, top, height, lane }) => {
                  const client = clientById.get(a.client_id);
                  const staff = staffById.get(a.staff_user_id);
                  const badge = badgeByAppt.get(a.id);
                  const lanesInDay = items.reduce(
                    (max, it) => Math.max(max, it.lane + 1),
                    1,
                  );
                  const widthPct = 100 / lanesInDay;
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
                        "absolute z-10 overflow-hidden rounded-md px-1 py-0.5 text-left text-[10px] leading-tight shadow-soft transition hover:shadow-card " +
                        (STATUS_CARD[a.status] ?? "bg-lavender text-ink")
                      }
                      style={{
                        top,
                        height: height - 2,
                        left: `calc(${leftPct}% + 1px)`,
                        width: `calc(${widthPct}% - 2px)`,
                      }}
                    >
                      {badge && (
                        <span
                          aria-hidden
                          className={
                            "absolute right-1 top-1 inline-block h-1.5 w-1.5 rounded-full " +
                            BADGE_DOT[badge]
                          }
                        />
                      )}
                      <div className="truncate pr-2 font-semibold">
                        {client?.full_name?.split(" ")[0] ?? "—"}
                      </div>
                      {height >= 32 && showStaff && staff && (
                        <div className="truncate opacity-70">
                          {staff.full_name.split(" ")[0]}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
