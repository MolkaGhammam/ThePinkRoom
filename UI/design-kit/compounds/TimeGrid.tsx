import { Chip } from "../primitives/Chip";
import { cn } from "../utils/cn";

export interface TimeGridProps {
  /** List of slot strings like "04:00", "04:30" */
  slots: string[];
  selected?: string;
  onSelect?: (slot: string) => void;
  /** Slots that should appear disabled (already booked) */
  disabledSlots?: string[];
  className?: string;
  /** Number of columns. Defaults to 4. */
  columns?: 3 | 4;
}

export function TimeGrid({
  slots,
  selected,
  onSelect,
  disabledSlots = [],
  className,
  columns = 4,
}: TimeGridProps) {
  return (
    <div
      className={cn(
        "grid gap-3",
        columns === 4 ? "grid-cols-4" : "grid-cols-3",
        className,
      )}
    >
      {slots.map((slot) => {
        const isDisabled = disabledSlots.includes(slot);
        const isSelected = slot === selected;
        return (
          <Chip
            key={slot}
            size="md"
            selected={isSelected}
            disabled={isDisabled}
            onClick={() => !isDisabled && onSelect?.(slot)}
            className={cn(
              "h-12 px-2 text-small",
              isDisabled && "opacity-40",
            )}
          >
            {slot}
          </Chip>
        );
      })}
    </div>
  );
}
