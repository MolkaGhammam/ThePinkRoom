"use client";

import type { ReactNode } from "react";
import { Button } from "../primitives/Button";
import { Sheet } from "./Sheet";

export interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: ReactNode;
  description?: ReactNode;
  confirmLabel: ReactNode;
  cancelLabel: ReactNode;
  destructive?: boolean;
  pending?: boolean;
}

/**
 * Yes/No confirmation modal. Built on top of `Sheet`.
 * Set `destructive` for delete-style actions (renders the confirm button in ink, not lavender).
 */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel,
  cancelLabel,
  destructive = false,
  pending = false,
}: ConfirmDialogProps) {
  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <div className="flex flex-col gap-2">
          <Button
            tone={destructive ? "ink" : "lavender"}
            fullWidth
            disabled={pending}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
          <Button tone="white" fullWidth disabled={pending} onClick={onClose}>
            {cancelLabel}
          </Button>
        </div>
      }
    >
      {description && <p className="text-sm text-ink-secondary">{description}</p>}
    </Sheet>
  );
}
