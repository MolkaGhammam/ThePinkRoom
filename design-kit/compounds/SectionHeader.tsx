import type { ReactNode } from "react";
import { cn } from "../utils/cn";

export interface SectionHeaderProps {
  /** Small label rendered above the title (e.g. "Pick the"). */
  eyebrow?: ReactNode;
  /** Main title (often bold, larger). */
  title: ReactNode;
  /** Optional right-side controls (filter, arrow, month switcher). */
  right?: ReactNode;
  /** Render the eyebrow on the same line instead of stacked. */
  inline?: boolean;
  className?: string;
}

export function SectionHeader({
  eyebrow,
  title,
  right,
  inline = false,
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn("flex items-end justify-between gap-3", className)}>
      <div className={cn("min-w-0", inline && "flex items-baseline gap-2")}>
        {eyebrow && (
          <div className="text-small font-medium text-ink-secondary">{eyebrow}</div>
        )}
        <div className="font-serif text-[24px] font-bold leading-tight tracking-tight text-ink">{title}</div>
      </div>
      {right && <div className="flex shrink-0 items-center gap-2">{right}</div>}
    </div>
  );
}
