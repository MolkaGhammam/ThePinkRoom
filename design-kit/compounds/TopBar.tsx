import type { ReactNode } from "react";
import { ChevronLeft } from "lucide-react";
import { Avatar, type AvatarProps } from "../primitives/Avatar";
import { IconButton } from "../primitives/IconButton";
import { cn } from "../utils/cn";

export interface TopBarProps {
  /** Left content variant. */
  variant?: "greeting" | "title";
  /** When variant="greeting" */
  avatar?: AvatarProps;
  greeting?: ReactNode;
  subGreeting?: ReactNode;
  /** When variant="title" */
  title?: ReactNode;
  onBack?: () => void;
  /** Right side actions (icon buttons). */
  right?: ReactNode;
  className?: string;
}

export function TopBar({
  variant = "greeting",
  avatar,
  greeting,
  subGreeting,
  title,
  onBack,
  right,
  className,
}: TopBarProps) {
  return (
    <header className={cn("flex items-center justify-between gap-3", className)}>
      <div className="flex min-w-0 items-center gap-3">
        {variant === "greeting" ? (
          <>
            {avatar && <Avatar {...avatar} size={avatar.size ?? "md"} />}
            <div className="min-w-0">
              {greeting && (
                <div className="truncate text-body font-bold text-ink">{greeting}</div>
              )}
              {subGreeting && (
                <div className="truncate text-tiny text-ink-secondary">{subGreeting}</div>
              )}
            </div>
          </>
        ) : (
          <>
            <IconButton
              icon={ChevronLeft}
              label="Go back"
              tone="muted"
              size="md"
              onClick={onBack}
            />
            <div className="text-body font-bold text-ink">{title}</div>
          </>
        )}
      </div>
      {right && <div className="flex items-center gap-2">{right}</div>}
    </header>
  );
}
