import { cn } from "../utils/cn";

export type AvatarSize = "xs" | "sm" | "md" | "lg";

const SIZE: Record<AvatarSize, string> = {
  xs: "h-7 w-7 text-[10px]",
  sm: "h-9 w-9 text-xs",
  md: "h-11 w-11 text-sm",
  lg: "h-14 w-14 text-base",
};

export interface AvatarProps {
  src?: string;
  alt?: string;
  initials?: string;
  size?: AvatarSize;
  ring?: boolean;
  className?: string;
}

export function Avatar({
  src,
  alt = "",
  initials,
  size = "md",
  ring = false,
  className,
}: AvatarProps) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-ink font-semibold",
        ring && "ring-2 ring-white",
        SIZE[size],
        className,
      )}
    >
      {src ? (
        <img src={src} alt={alt} className="h-full w-full object-cover" />
      ) : (
        <span aria-label={alt || initials}>{initials ?? "·"}</span>
      )}
    </span>
  );
}
