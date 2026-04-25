import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../utils/cn";

export type CardTone = "white" | "pink" | "mint" | "lavender" | "muted";
export type CardRadius = "lg" | "xl" | "2xl";

const TONE: Record<CardTone, string> = {
  white: "bg-white text-ink",
  pink: "bg-pink text-pink-fg",
  mint: "bg-mint text-mint-fg",
  lavender: "bg-lavender text-ink",
  muted: "bg-muted text-ink",
};

const RADIUS: Record<CardRadius, string> = {
  lg: "rounded-lg",
  xl: "rounded-xl",
  "2xl": "rounded-2xl",
};

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  tone?: CardTone;
  radius?: CardRadius;
  padding?: "sm" | "md" | "lg" | "none";
  elevated?: boolean;
}

const PAD = {
  none: "",
  sm: "p-3",
  md: "p-4",
  lg: "p-5",
} as const;

export function Card({
  children,
  tone = "white",
  radius = "2xl",
  padding = "md",
  elevated = false,
  className,
  ...rest
}: CardProps) {
  return (
    <div
      className={cn(
        TONE[tone],
        RADIUS[radius],
        PAD[padding],
        elevated && "shadow-card",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
