import { ChevronsRight } from "lucide-react";
import { Button } from "../primitives/Button";
import { cn } from "../utils/cn";

export interface BookingCTAProps {
  label?: string;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

export function BookingCTA({
  label = "Book Appointment",
  onClick,
  disabled = false,
  className,
}: BookingCTAProps) {
  return (
    <div className={cn("w-full", className)}>
      <Button
        tone="lavender"
        size="lg"
        fullWidth
        trailingIcon={ChevronsRight}
        onClick={onClick}
        disabled={disabled}
      >
        {label}
      </Button>
    </div>
  );
}
