import { Chip } from "../primitives/Chip";
import { cn } from "../utils/cn";

export interface DayStripItem {
  /** ISO date or any unique key */
  key: string;
  /** Short weekday e.g. "Mon" */
  weekday: string;
  /** Day-of-month number e.g. 14 */
  day: number;
}

export interface DayStripProps {
  days: DayStripItem[];
  selectedKey: string;
  onSelect?: (key: string) => void;
  className?: string;
}

export function DayStrip({ days, selectedKey, onSelect, className }: DayStripProps) {
  return (
    <div
      className={cn(
        "scrollbar-none flex gap-2 overflow-x-auto",
        className,
      )}
    >
      {days.map((d) => {
        const isSelected = d.key === selectedKey;
        return (
          <Chip
            key={d.key}
            shape="circle"
            size="md"
            stacked
            selected={isSelected}
            onClick={() => onSelect?.(d.key)}
            className="min-w-14"
          >
            <span
              className={cn(
                "text-tiny font-medium",
                isSelected ? "text-white/90" : "text-ink-secondary",
              )}
            >
              {d.weekday}
            </span>
            <span className={cn("text-body font-bold", isSelected && "text-white")}>
              {d.day}
            </span>
          </Chip>
        );
      })}
    </div>
  );
}
