import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../utils/cn";

export interface PillProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  /** Visual surface */
  tone?: "white" | "muted" | "pink" | "mint" | "lavender" | "ink";
  /** Padding density */
  density?: "sm" | "md" | "lg";
}

const TONE = {
  white: "bg-white text-ink",
  muted: "bg-muted text-ink",
  pink: "bg-pink text-pink-fg",
  mint: "bg-mint text-mint-fg",
  lavender: "bg-lavender-solid text-white",
  ink: "bg-inverse text-white",
} as const;

const DENSITY = {
  sm: "h-7 px-2.5 text-tiny",
  md: "h-9 px-3.5 text-small",
  lg: "h-11 px-5 text-body",
} as const;

export function Pill({
  children,
  tone = "muted",
  density = "md",
  className,
  ...rest
}: PillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-full font-medium whitespace-nowrap",
        TONE[tone],
        DENSITY[density],
        className,
      )}
      {...rest}
    >
      {children}
    </span>
  );
}
