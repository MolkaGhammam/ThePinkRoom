import type { ComponentType, SVGProps } from "react";
import { Card } from "../primitives/Card";
import { IconBadge } from "../primitives/IconBadge";
import { cn } from "../utils/cn";

export type SpecialistTileTone = "white" | "lavender";

export interface SpecialistTileProps {
  price: string;          // e.g. "$35"
  pricePeriod?: string;   // e.g. "Per Visit"
  role: string;           // e.g. "Cardiologist"
  availability: string;   // e.g. "17 Doctor Available"
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  tone?: SpecialistTileTone;
  onClick?: () => void;
  className?: string;
}

const TONE: Record<SpecialistTileTone, { card: "white" | "lavender"; iconBadge: "white" | "ink" }> = {
  white: { card: "white", iconBadge: "white" },
  lavender: { card: "lavender", iconBadge: "white" },
};

export function SpecialistTile({
  price,
  pricePeriod = "Per Visit",
  role,
  availability,
  icon,
  tone = "white",
  onClick,
  className,
}: SpecialistTileProps) {
  const t = TONE[tone];
  return (
    <Card
      tone={t.card}
      radius="2xl"
      padding="md"
      onClick={onClick}
      className={cn(
        "relative flex min-h-[150px] cursor-pointer select-none flex-col justify-between",
        tone === "white" && "shadow-soft",
        className,
      )}
    >
      <IconBadge
        icon={icon}
        tone={t.iconBadge}
        size="md"
        className="absolute right-3 top-3"
      />

      <div>
        <div className="font-serif text-[26px] font-bold leading-none text-ink">{price}</div>
        <div className="mt-1 text-tiny text-ink-secondary">{pricePeriod}</div>
      </div>

      <div className="mt-4">
        <div className="text-body font-bold text-ink">{role}</div>
        <div className="text-tiny text-ink-secondary">{availability}</div>
      </div>
    </Card>
  );
}
