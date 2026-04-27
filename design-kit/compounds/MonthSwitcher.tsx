import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../utils/cn";

export interface MonthSwitcherProps {
  month: string;
  onPrev?: () => void;
  onNext?: () => void;
  className?: string;
}

export function MonthSwitcher({ month, onPrev, onNext, className }: MonthSwitcherProps) {
  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      <button
        type="button"
        onClick={onPrev}
        aria-label="Previous month"
        className="inline-flex h-7 w-7 items-center justify-center rounded-full text-ink hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lavender-ring"
      >
        <ChevronLeft width={16} height={16} strokeWidth={2} />
      </button>
      <span className="text-small font-semibold text-ink">{month}</span>
      <button
        type="button"
        onClick={onNext}
        aria-label="Next month"
        className="inline-flex h-7 w-7 items-center justify-center rounded-full text-ink hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lavender-ring"
      >
        <ChevronRight width={16} height={16} strokeWidth={2} />
      </button>
    </div>
  );
}
