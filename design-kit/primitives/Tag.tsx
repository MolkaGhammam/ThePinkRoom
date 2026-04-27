import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../utils/cn";

export interface TagProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  tone?: "white" | "muted" | "pink" | "mint" | "lavender";
}

const TONE = {
  white: "bg-white text-ink",
  muted: "bg-muted text-ink",
  pink: "bg-pink-soft text-pink-fg",
  mint: "bg-mint-soft text-mint-fg",
  lavender: "bg-lavender-soft text-lavender-solid",
} as const;

export function Tag({ children, tone = "white", className, ...rest }: TagProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full px-3 py-1 text-small font-semibold whitespace-nowrap",
        TONE[tone],
        className,
      )}
      {...rest}
    >
      {children}
    </span>
  );
}
