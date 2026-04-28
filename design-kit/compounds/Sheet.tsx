"use client";

import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { IconButton } from "../primitives/IconButton";
import { cn } from "../utils/cn";

export interface SheetProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  /** Optional sticky footer (typically a primary action button). */
  footer?: ReactNode;
  className?: string;
}

/**
 * Bottom sheet on mobile (slides up from the bottom of the viewport),
 * centered modal on >= md screens. Renders via portal into document.body.
 *
 * Closes on backdrop click, Escape key, or the close icon.
 * The body content area scrolls; the title and footer stay fixed.
 */
export function Sheet({ open, onClose, title, children, footer, className }: SheetProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (typeof document === "undefined") return null;
  if (!open) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end justify-center md:items-center"
    >
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-inverse/40"
      />
      <div
        className={cn(
          "relative flex max-h-[92vh] w-full flex-col rounded-t-2xl bg-canvas md:max-h-[80vh] md:max-w-md md:rounded-2xl",
          "shadow-card",
          className,
        )}
      >
        <div className="flex items-center justify-between gap-3 border-b border-line-subtle px-5 py-4">
          <h2 className="font-serif text-xl text-ink">{title}</h2>
          <IconButton icon={X} label="Close" tone="muted" size="sm" onClick={onClose} />
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && (
          <div className="border-t border-line-subtle bg-canvas px-5 py-4">{footer}</div>
        )}
      </div>
    </div>,
    document.body,
  );
}
