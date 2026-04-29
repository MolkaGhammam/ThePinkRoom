import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "../utils/cn";

export interface TimeFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: ReactNode;
}

const INPUT_BASE =
  "h-11 w-full rounded-full border border-line-subtle bg-white px-4 text-sm text-ink outline-none transition focus:border-lavender-solid focus:ring-2 focus:ring-lavender-ring disabled:cursor-not-allowed disabled:bg-muted disabled:text-ink-muted";

export function TimeField({ label, className, id, ...rest }: TimeFieldProps) {
  const inputId = id ?? rest.name;
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={inputId} className="text-xs font-medium text-ink-secondary">
          {label}
        </label>
      )}
      <input id={inputId} type="time" className={cn(INPUT_BASE, className)} {...rest} />
    </div>
  );
}
