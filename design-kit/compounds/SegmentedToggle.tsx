import type { ComponentType, ReactNode, SVGProps } from "react";
import { cn } from "../utils/cn";

export interface SegmentedToggleOption<TValue extends string = string> {
  value: TValue;
  label: ReactNode;
  icon?: ComponentType<SVGProps<SVGSVGElement>>;
}

export interface SegmentedToggleProps<TValue extends string = string> {
  options: [SegmentedToggleOption<TValue>, SegmentedToggleOption<TValue>];
  value: TValue;
  onChange: (value: TValue) => void;
  /** Visual density */
  density?: "sm" | "md";
  /** "spread" = full-width, two equal segments. "compact" = inline, sized to content. */
  width?: "spread" | "compact";
  className?: string;
}

const HEIGHT = {
  sm: "h-9",
  md: "h-12",
} as const;

export function SegmentedToggle<TValue extends string = string>({
  options,
  value,
  onChange,
  density = "md",
  width = "spread",
  className,
}: SegmentedToggleProps<TValue>) {
  return (
    <div
      role="radiogroup"
      className={cn(
        "inline-flex items-center rounded-full bg-muted p-1",
        width === "spread" ? "w-full" : "",
        HEIGHT[density],
        className,
      )}
    >
      {options.map((opt) => {
        const isActive = opt.value === value;
        const Icon = opt.icon;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => onChange(opt.value)}
            className={cn(
              "inline-flex h-full items-center justify-center gap-2 rounded-full px-4 text-small font-semibold transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lavender-ring",
              width === "spread" ? "flex-1" : "",
              isActive
                ? "bg-lavender-solid text-white shadow-soft"
                : "bg-transparent text-ink",
            )}
          >
            {Icon && (
              <span
                className={cn(
                  "inline-flex h-6 w-6 items-center justify-center rounded-full",
                  isActive ? "bg-white/20" : "bg-white",
                )}
              >
                <Icon width={14} height={14} strokeWidth={2.2} />
              </span>
            )}
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
