"use client";

import { useMemo } from "react";
import { cn } from "../utils/cn";

export interface CalendarProps {
  /** Currently selected date (YYYY-MM-DD or any Date). */
  value?: Date;
  /** Month/year being displayed. Defaults to value's month, or today. */
  month?: Date;
  onSelect?: (date: Date) => void;
  /** Selected-day fill color. Defaults to lavender. */
  selectedTone?: "lavender" | "success";
  /** Size of each day cell */
  density?: "compact" | "regular";
  className?: string;
}

const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"] as const;

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function daysInMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
}

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function Calendar({
  value,
  month,
  onSelect,
  selectedTone = "lavender",
  density = "regular",
  className,
}: CalendarProps) {
  const view = month ?? value ?? new Date();
  const monthStart = startOfMonth(view);
  const totalDays = daysInMonth(view);
  const leadingBlanks = monthStart.getDay(); // 0 = Sunday

  const cells = useMemo(() => {
    const arr: (Date | null)[] = [];
    for (let i = 0; i < leadingBlanks; i++) arr.push(null);
    for (let i = 1; i <= totalDays; i++) {
      arr.push(new Date(view.getFullYear(), view.getMonth(), i));
    }
    return arr;
  }, [leadingBlanks, totalDays, view]);

  const cellSize = density === "compact" ? "h-9 w-9 text-small" : "h-10 w-10 text-body";
  const selectedColor =
    selectedTone === "lavender" ? "bg-lavender-solid text-white" : "bg-success text-white";

  return (
    <div className={cn("rounded-2xl bg-pink-soft p-5", className)}>
      <div className="mb-4 text-center font-serif text-[20px] font-bold tracking-tight text-pink-fg">
        {view.toLocaleString("en-US", { month: "long", year: "numeric" })}
      </div>

      <div className="grid grid-cols-7 gap-y-2">
        {DAY_LABELS.map((label, i) => (
          <div
            key={`${label}-${i}`}
            className="flex items-center justify-center text-tiny font-semibold text-pink-fg/60"
          >
            {label}
          </div>
        ))}

        {cells.map((d, i) => {
          if (!d) return <div key={`b-${i}`} className={cn(cellSize, "mx-auto")} />;
          const isSelected = value ? sameDay(d, value) : false;
          return (
            <button
              key={d.toISOString()}
              type="button"
              onClick={() => onSelect?.(d)}
              className={cn(
                "mx-auto inline-flex items-center justify-center rounded-full font-semibold transition-colors",
                cellSize,
                isSelected
                  ? selectedColor
                  : "text-pink-fg hover:bg-white",
              )}
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
