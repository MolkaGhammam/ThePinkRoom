import type { ComponentType, SVGProps } from "react";
import { Card } from "../primitives/Card";
import { IconBadge } from "../primitives/IconBadge";
import { cn } from "../utils/cn";

export interface DoctorProfileCardProps {
  name: string;
  credentials: string;
  headline: string;
  startingFromLabel?: string;
  price: string;
  perLabel?: string;
  /** URL of doctor photo */
  photoSrc?: string;
  /** Decorative leading icon shown in the top-left badge */
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  className?: string;
}

export function DoctorProfileCard({
  name,
  credentials,
  headline,
  startingFromLabel = "Starting from",
  price,
  perLabel = "/per session",
  photoSrc,
  icon,
  className,
}: DoctorProfileCardProps) {
  return (
    <Card
      tone="pink"
      radius="2xl"
      padding="md"
      className={cn("relative overflow-hidden", className)}
    >
      <div className="grid grid-cols-[1fr_auto] gap-3">
        <div className="min-w-0">
          <div className="mb-3 flex items-center gap-2">
            <IconBadge icon={icon} tone="white" size="md" strokeWidth={2.2} />
            <div className="min-w-0">
              <div className="truncate text-body font-bold text-pink-fg">{name}</div>
              <div className="truncate text-tiny text-pink-fg/70">{credentials}</div>
            </div>
          </div>

          <div className="mb-4 font-serif text-[22px] font-bold leading-tight tracking-tight text-pink-fg">
            {headline}
          </div>

          <div className="text-tiny text-pink-fg/70">{startingFromLabel}</div>
          <div className="text-pink-fg">
            <span className="font-serif text-[26px] font-bold leading-none">{price}</span>
            <span className="ml-1 text-small font-medium text-pink-fg/70">{perLabel}</span>
          </div>
        </div>

        <div className="self-end -mr-2 -mb-3">
          {photoSrc ? (
            <img
              src={photoSrc}
              alt={name}
              className="h-44 w-32 rounded-2xl object-cover"
            />
          ) : (
            <div className="h-44 w-32 rounded-2xl bg-pink-soft" />
          )}
        </div>
      </div>
    </Card>
  );
}
