"use client";

import { useTranslations } from "next-intl";
import { Card, TimeField } from "@kit";
import {
  WEEKDAYS,
  type DayHours,
  type OpeningHours,
  type Weekday,
} from "@/lib/opening-hours";

interface Props {
  value: OpeningHours;
  onChange: (next: OpeningHours) => void;
}

export function OpeningHoursEditor({ value, onChange }: Props) {
  const t = useTranslations("settings.salon");

  function update(day: Weekday, next: DayHours) {
    onChange({ ...value, [day]: next });
  }

  function toggleClosed(day: Weekday, closed: boolean) {
    if (closed) {
      update(day, { closed: true });
    } else {
      update(day, { open: "09:00", close: "19:00" });
    }
  }

  function setTime(day: Weekday, field: "open" | "close", v: string) {
    const current = value[day];
    if ("closed" in current && current.closed) return;
    update(day, { ...current, [field]: v });
  }

  function toggleBreak(day: Weekday, has: boolean) {
    const current = value[day];
    if ("closed" in current && current.closed) return;
    if (has) {
      update(day, { ...current, break: { start: "13:00", end: "14:00" } });
    } else {
      const { break: _omit, ...rest } = current;
      update(day, rest);
    }
  }

  function setBreak(day: Weekday, field: "start" | "end", v: string) {
    const current = value[day];
    if ("closed" in current && current.closed) return;
    if (!current.break) return;
    update(day, { ...current, break: { ...current.break, [field]: v } });
  }

  return (
    <Card tone="white" padding="lg" elevated>
      <h2 className="font-serif text-2xl text-ink">{t("openingHours")}</h2>
      <ul className="mt-4 flex flex-col gap-3">
        {WEEKDAYS.map((day) => {
          const d = value[day];
          const closed = "closed" in d && d.closed === true;
          const dayLabel = t(`weekdays.${day}`);

          return (
            <li
              key={day}
              className="flex flex-col gap-3 rounded-2xl border border-line-subtle p-3"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-ink">{dayLabel}</span>
                <label className="flex items-center gap-2 text-xs text-ink-secondary">
                  <input
                    type="checkbox"
                    checked={!closed}
                    onChange={(e) => toggleClosed(day, !e.target.checked)}
                    className="h-4 w-4 accent-lavender-solid"
                  />
                  {closed ? t("closed") : t("open")}
                </label>
              </div>

              {!closed && !("closed" in d && d.closed) && (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <TimeField
                      label={t("openTime")}
                      value={d.open}
                      onChange={(e) => setTime(day, "open", e.target.value)}
                    />
                    <TimeField
                      label={t("closeTime")}
                      value={d.close}
                      onChange={(e) => setTime(day, "close", e.target.value)}
                    />
                  </div>

                  {d.break ? (
                    <>
                      <div className="grid grid-cols-2 gap-2">
                        <TimeField
                          label={t("breakStart")}
                          value={d.break.start}
                          onChange={(e) => setBreak(day, "start", e.target.value)}
                        />
                        <TimeField
                          label={t("breakEnd")}
                          value={d.break.end}
                          onChange={(e) => setBreak(day, "end", e.target.value)}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleBreak(day, false)}
                        className="self-start text-xs text-ink-muted underline-offset-2 hover:underline"
                      >
                        {t("removeBreak")}
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => toggleBreak(day, true)}
                      className="self-start text-xs text-ink-secondary underline-offset-2 hover:underline"
                    >
                      {t("addBreak")}
                    </button>
                  )}
                </>
              )}
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
