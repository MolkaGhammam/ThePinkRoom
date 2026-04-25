import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../utils/cn";

export interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
  children: ReactNode;
  /** Vertical layout (e.g. weekday + day-number) */
  stacked?: boolean;
  /** Force a fixed shape */
  shape?: "pill" | "circle";
  size?: "sm" | "md" | "lg";
}

const SIZE = {
  sm: "h-9 px-3 text-small",
  md: "h-11 px-4 text-body",
  lg: "h-12 px-5 text-body",
} as const;

const CIRCLE_SIZE = {
  sm: "h-12 w-12 text-small",
  md: "h-14 w-14 text-body",
  lg: "h-16 w-16 text-body",
} as const;

export function Chip({
  selected = false,
  children,
  stacked = false,
  shape = "pill",
  size = "md",
  className,
  type = "button",
  ...rest
}: ChipProps) {
  const base =
    "inline-flex shrink-0 items-center justify-center font-medium transition-colors " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lavender-ring focus-visible:ring-offset-1";
  const surface = selected
    ? "bg-lavender-solid text-white"
    : "bg-chip-idle text-chip-idle-fg hover:bg-line-subtle";
  const shapeCls =
    shape === "circle" ? `rounded-full ${CIRCLE_SIZE[size]}` : `rounded-full ${SIZE[size]}`;
  const stackedCls = stacked ? "flex-col gap-0.5 leading-none" : "gap-1.5";

  return (
    <button
      type={type}
      aria-pressed={selected}
      className={cn(base, shapeCls, stackedCls, surface, className)}
      {...rest}
    >
      {children}
    </button>
  );
}
