import type { ComponentType, ReactNode, SVGProps } from "react";
import { cn } from "../utils/cn";

export type IconBadgeSize = "sm" | "md" | "lg";
export type IconBadgeTone = "white" | "ink" | "lavender" | "pink" | "mint";

const SIZE: Record<IconBadgeSize, string> = {
  sm: "h-7 w-7",
  md: "h-9 w-9",
  lg: "h-11 w-11",
};

const ICON_SIZE: Record<IconBadgeSize, number> = {
  sm: 14,
  md: 18,
  lg: 20,
};

const TONE: Record<IconBadgeTone, string> = {
  white: "bg-white text-ink",
  ink: "bg-inverse text-white",
  lavender: "bg-lavender-solid text-white",
  pink: "bg-pink text-pink-fg",
  mint: "bg-mint text-mint-fg",
};

export interface IconBadgeProps {
  icon?: ComponentType<SVGProps<SVGSVGElement>>;
  children?: ReactNode;
  size?: IconBadgeSize;
  tone?: IconBadgeTone;
  className?: string;
  strokeWidth?: number;
}

export function IconBadge({
  icon: Icon,
  children,
  size = "md",
  tone = "white",
  className,
  strokeWidth = 2,
}: IconBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full",
        SIZE[size],
        TONE[tone],
        className,
      )}
    >
      {Icon ? (
        <Icon width={ICON_SIZE[size]} height={ICON_SIZE[size]} strokeWidth={strokeWidth} />
      ) : (
        children
      )}
    </span>
  );
}
