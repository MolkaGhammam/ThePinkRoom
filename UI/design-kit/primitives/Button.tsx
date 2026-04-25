import type { ButtonHTMLAttributes, ComponentType, ReactNode, SVGProps } from "react";
import { cn } from "../utils/cn";
import { IconBadge } from "./IconBadge";

export type ButtonTone = "lavender" | "ink" | "white";
export type ButtonSize = "md" | "lg";

const TONE: Record<ButtonTone, string> = {
  lavender: "bg-lavender-solid text-white hover:bg-lavender-solid-hover",
  ink: "bg-inverse text-white hover:bg-black",
  white: "bg-white text-ink hover:bg-muted",
};

const SIZE: Record<ButtonSize, string> = {
  md: "h-12 text-body",
  lg: "h-14 text-body",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  tone?: ButtonTone;
  size?: ButtonSize;
  fullWidth?: boolean;
  trailingIcon?: ComponentType<SVGProps<SVGSVGElement>>;
}

export function Button({
  children,
  tone = "lavender",
  size = "lg",
  fullWidth = false,
  trailingIcon: TrailingIcon,
  className,
  type = "button",
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-3 rounded-full px-6 font-semibold transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lavender-ring focus-visible:ring-offset-2",
        SIZE[size],
        TONE[tone],
        fullWidth && "w-full",
        TrailingIcon && "pr-1.5",
        className,
      )}
      {...rest}
    >
      <span className="flex-1 text-center">{children}</span>
      {TrailingIcon && (
        <IconBadge icon={TrailingIcon} tone="white" size="md" strokeWidth={2.2} />
      )}
    </button>
  );
}
