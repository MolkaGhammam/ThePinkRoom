import { Calendar as CalendarIcon, Clock3, Video } from "lucide-react";
import { Card } from "../primitives/Card";
import { Avatar, type AvatarProps } from "../primitives/Avatar";
import { IconBadge } from "../primitives/IconBadge";
import { Tag } from "../primitives/Tag";
import { cn } from "../utils/cn";

export interface AppointmentCardProps {
  name: string;
  role: string;
  date: string;
  time: string;
  durationLabel?: string;
  avatar?: AvatarProps;
  onClick?: () => void;
  className?: string;
}

export function AppointmentCard({
  name,
  role,
  date,
  time,
  durationLabel = "50 min",
  avatar,
  onClick,
  className,
}: AppointmentCardProps) {
  return (
    <Card
      tone="pink"
      radius="2xl"
      padding="md"
      onClick={onClick}
      className={cn(
        "relative cursor-pointer select-none",
        className,
      )}
    >
      <Tag tone="white" className="absolute right-3 top-3">
        {durationLabel}
      </Tag>

      <div className="mb-3 text-small font-semibold text-pink-fg">
        Your Next Appointments (3)
      </div>

      <div className="mb-3 flex items-center gap-3">
        <Avatar {...(avatar ?? {})} size={avatar?.size ?? "md"} ring />
        <div className="min-w-0">
          <div className="truncate text-body font-bold text-pink-fg">{name}</div>
          <div className="truncate text-tiny text-pink-fg/70">{role}</div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <IconBadge icon={CalendarIcon} tone="lavender" size="sm" />
          <span className="text-small font-semibold text-pink-fg">{date}</span>
        </div>
        <div className="flex items-center gap-2">
          <IconBadge icon={Clock3} tone="white" size="sm" />
          <span className="text-small font-semibold text-pink-fg">{time}</span>
        </div>
        <Video className="ml-auto h-5 w-5 text-pink-fg/0" aria-hidden />
      </div>
    </Card>
  );
}
