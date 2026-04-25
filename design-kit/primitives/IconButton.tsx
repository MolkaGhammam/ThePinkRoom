import type { ButtonHTMLAttributes, ComponentType, SVGProps } from "react";
import { cn } from "../utils/cn";

export type IconButtonSize = "sm" | "md" | "lg";
export type IconButtonTone = "muted" | "white" | "ink" | "lavender";

const SIZE: Record<IconButtonSize, string> = {
  sm: "h-9 w-9",
  md: "h-11 w-11",
  lg: "h-12 w-12",
};

const ICON_SIZE: Record<IconButtonSize, number> = {
  sm: 18,
  md: 20,
  lg: 22,
};

const TONE: Record<IconButtonTone, string> = {
  muted: "bg-muted text-ink hover:bg-line-subtle",
  white: "bg-white text-ink hover:bg-muted",
  ink: "bg-inverse text-white hover:bg-black",
  lavender: "bg-lavender-solid text-white hover:bg-lavender-solid-hover",
};

export interface IconButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  size?: IconButtonSize;
  tone?: IconButtonTone;
  label: string;
  strokeWidth?: number;
}

export function IconButton({
  icon: Icon,
  size = "md",
  tone = "muted",
  label,
  className,
  strokeWidth = 2,
  ...rest
}: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lavender-ring focus-visible:ring-offset-1",
        SIZE[size],
        TONE[tone],
        className,
      )}
      {...rest}
    >
      <Icon width={ICON_SIZE[size]} height={ICON_SIZE[size]} strokeWidth={strokeWidth} />
    </button>
  );
}
