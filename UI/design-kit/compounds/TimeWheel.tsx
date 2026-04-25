import { useEffect, useRef } from "react";
import { cn } from "../utils/cn";

export interface TimeWheelValue {
  hour: number;   // 1..12
  minute: number; // 0..59 (must be in `minutes` array)
  meridiem: "AM" | "PM";
}

export interface TimeWheelProps {
  label?: string;
  value: TimeWheelValue;
  onChange?: (next: TimeWheelValue) => void;
  hours?: number[];
  minutes?: number[];
  className?: string;
}

const DEFAULT_HOURS = Array.from({ length: 12 }, (_, i) => i + 1);
const DEFAULT_MINUTES = [0, 15, 30, 45];
const MERIDIEMS: TimeWheelValue["meridiem"][] = ["AM", "PM"];

const ITEM_H = 44;          // px per row
const VISIBLE = 7;          // rows visible (3 above + center + 3 below)
const PAD_ROWS = 3;         // empty rows above and below the list
const WRAPPER_H = ITEM_H * VISIBLE; // 308

interface ColumnProps<T> {
  items: T[];
  value: T;
  format: (item: T) => string;
  align: "left" | "center" | "right";
  onChange?: (item: T) => void;
}

function Column<T>({ items, value, format, align, onChange }: ColumnProps<T>) {
  const ref = useRef<HTMLDivElement>(null);
  const scrollTimer = useRef<number | null>(null);

  // Sync scroll position when the externally controlled `value` changes.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const idx = items.indexOf(value);
    if (idx >= 0) {
      el.scrollTo({ top: idx * ITEM_H, behavior: "auto" });
    }
  }, [value, items]);

  function handleScroll() {
    const el = ref.current;
    if (!el || !onChange) return;
    if (scrollTimer.current) window.clearTimeout(scrollTimer.current);
    // Debounce — wait for scroll to settle so we read the final snap target.
    scrollTimer.current = window.setTimeout(() => {
      const idx = Math.round(el.scrollTop / ITEM_H);
      const clamped = Math.max(0, Math.min(items.length - 1, idx));
      const next = items[clamped];
      if (next !== undefined && next !== value) onChange(next);
    }, 80);
  }

  const alignCls =
    align === "left"
      ? "justify-start"
      : align === "right"
        ? "justify-end"
        : "justify-center";

  return (
    <div
      ref={ref}
      onScroll={handleScroll}
      className="scrollbar-none snap-y snap-mandatory overflow-y-auto"
      style={{
        height: WRAPPER_H,
        // Reserve PAD_ROWS worth of space above/below so the first and last
        // real items can land in the center band when snapped.
        paddingTop: ITEM_H * PAD_ROWS,
        paddingBottom: ITEM_H * PAD_ROWS,
        scrollPaddingTop: ITEM_H * PAD_ROWS,
        scrollPaddingBottom: ITEM_H * PAD_ROWS,
      }}
    >
      {items.map((item, i) => {
        const isCenter = item === value;
        return (
          <button
            key={i}
            type="button"
            onClick={() => onChange?.(item)}
            className={cn(
              "flex w-full snap-center cursor-pointer items-center px-3 transition-opacity",
              alignCls,
              isCenter ? "opacity-100" : "opacity-30 hover:opacity-60",
            )}
            style={{ height: ITEM_H }}
          >
            <span
              className={cn(
                "tabular-nums leading-none",
                isCenter
                  ? "text-[22px] font-bold text-pink-fg"
                  : "text-[18px] text-ink-secondary",
              )}
            >
              {format(item)}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function TimeWheel({
  label,
  value,
  onChange,
  hours = DEFAULT_HOURS,
  minutes = DEFAULT_MINUTES,
  className,
}: TimeWheelProps) {
  function update(partial: Partial<TimeWheelValue>) {
    onChange?.({ ...value, ...partial });
  }

  // Center band sits at row index 3 (0-indexed) of 7 visible rows.
  const bandTop = ITEM_H * PAD_ROWS;

  return (
    <div className={cn("rounded-2xl bg-white p-4", className)}>
      {label && (
        <div className="mb-2 font-serif text-[20px] font-bold tracking-tight text-ink">
          {label}
        </div>
      )}
      <div className="relative" style={{ height: WRAPPER_H }}>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 rounded-xl bg-pink-soft"
          style={{ top: bandTop, height: ITEM_H }}
        />
        <div className="relative grid grid-cols-3 gap-2">
          <Column
            items={hours}
            value={value.hour}
            format={(h) => String(h)}
            align="right"
            onChange={(hour) => update({ hour })}
          />
          <Column
            items={minutes}
            value={value.minute}
            format={(m) => m.toString().padStart(2, "0")}
            align="center"
            onChange={(minute) => update({ minute })}
          />
          <Column
            items={MERIDIEMS}
            value={value.meridiem}
            format={(m) => m}
            align="left"
            onChange={(meridiem) => update({ meridiem })}
          />
        </div>
      </div>
    </div>
  );
}
