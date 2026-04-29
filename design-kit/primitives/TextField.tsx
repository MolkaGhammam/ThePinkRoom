import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "../utils/cn";

export interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
}

const INPUT_BASE =
  "h-12 w-full rounded-full border border-line-subtle bg-white px-4 text-sm text-ink outline-none transition focus:border-lavender-solid focus:ring-2 focus:ring-lavender-ring disabled:cursor-not-allowed disabled:bg-muted disabled:text-ink-muted";

export function TextField({
  label,
  hint,
  error,
  className,
  id,
  ...rest
}: TextFieldProps) {
  const inputId = id ?? rest.name;
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-ink-secondary">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(INPUT_BASE, error && "border-pink-fg focus:border-pink-fg", className)}
        aria-invalid={error ? true : undefined}
        {...rest}
      />
      {error ? (
        <span className="text-xs text-pink-fg">{error}</span>
      ) : hint ? (
        <span className="text-xs text-ink-muted">{hint}</span>
      ) : null}
    </div>
  );
}
