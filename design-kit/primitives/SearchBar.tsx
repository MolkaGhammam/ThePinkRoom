import type { InputHTMLAttributes } from "react";
import { Mic, Sparkles } from "lucide-react";
import { cn } from "../utils/cn";
import { IconButton } from "./IconButton";

export interface SearchBarProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  onMicClick?: () => void;
  micLabel?: string;
}

export function SearchBar({
  className,
  placeholder = "Asked anything about your health",
  onMicClick,
  micLabel = "Voice search",
  ...rest
}: SearchBarProps) {
  return (
    <div
      className={cn(
        "flex h-14 items-center gap-3 rounded-full bg-muted pl-4 pr-1.5",
        className,
      )}
    >
      <Sparkles className="h-4 w-4 shrink-0 text-ink-secondary" strokeWidth={2.2} />
      <input
        type="text"
        placeholder={placeholder}
        className="flex-1 bg-transparent text-small text-ink placeholder:text-ink-muted outline-none"
        {...rest}
      />
      <IconButton
        icon={Mic}
        label={micLabel}
        tone="ink"
        size="md"
        onClick={onMicClick}
      />
    </div>
  );
}
