"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Button, ConfirmDialog, Sheet, TextField } from "@kit";
import type { Payment, PaymentMethod } from "@/types/domain";
import { useCurrentUser } from "@/components/UserProvider";
import {
  createPayment,
  deletePayment,
  refundPayment,
  updatePayment,
} from "./payment-actions";

interface Props {
  open: boolean;
  onClose: () => void;
  appointmentId: string;
  payment?: Payment | null;
  onChanged: () => void;
}

const METHODS: PaymentMethod[] = ["cash", "card", "transfer", "other"];

export function PaymentForm({
  open,
  onClose,
  appointmentId,
  payment,
  onChanged,
}: Props) {
  const t = useTranslations("payments");
  const tCommon = useTranslations("common");
  const me = useCurrentUser();
  const isAdmin = me.profile.role === "admin";

  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [confirmRefund, setConfirmRefund] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [amount, setAmount] = useState<number>(Number(payment?.amount ?? 0));
  const [method, setMethod] = useState<PaymentMethod>(payment?.method ?? "cash");
  const [notes, setNotes] = useState<string>(payment?.notes ?? "");

  const seedKey = `${open}:${payment?.id ?? "new"}`;
  const [seenKey, setSeenKey] = useState(seedKey);
  if (seenKey !== seedKey) {
    setSeenKey(seedKey);
    setAmount(Number(payment?.amount ?? 0));
    setMethod(payment?.method ?? "cash");
    setNotes(payment?.notes ?? "");
    setError(null);
    setConfirmRefund(false);
    setConfirmDelete(false);
  }

  const isEdit = Boolean(payment);
  // Only an existing 'paid' row can be refunded.
  const canRefund = isEdit && isAdmin && payment?.status === "paid";

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = isEdit
        ? await updatePayment({
            id: payment!.id,
            appointment_id: appointmentId,
            amount: Math.floor(amount),
            method,
            notes,
          })
        : await createPayment({
            appointment_id: appointmentId,
            amount: Math.floor(amount),
            method,
            notes,
          });
      if (result.ok) {
        onChanged();
        onClose();
      } else {
        const map: Record<string, string> = {
          amount_invalid: t("errors.amount_invalid"),
          appointment_not_found: t("errors.appointment_not_found"),
          forbidden: t("errors.forbidden"),
        };
        setError(map[result.error] ?? tCommon("error"));
      }
    });
  }

  function runRefund() {
    if (!payment) return;
    startTransition(async () => {
      await refundPayment(payment.id);
      setConfirmRefund(false);
      onChanged();
      onClose();
    });
  }

  function runDelete() {
    if (!payment) return;
    startTransition(async () => {
      await deletePayment(payment.id);
      setConfirmDelete(false);
      onChanged();
      onClose();
    });
  }

  return (
    <>
      <Sheet
        open={open}
        onClose={onClose}
        title={isEdit ? t("editPayment") : t("newPayment")}
        footer={
          <Button
            type="submit"
            form="payment-form"
            tone="lavender"
            fullWidth
            disabled={pending}
          >
            {pending ? tCommon("loading") : tCommon("save")}
          </Button>
        }
      >
        <form id="payment-form" onSubmit={onSubmit} className="flex flex-col gap-4">
          <TextField
            name="amount"
            label={t("amount")}
            type="number"
            inputMode="numeric"
            min={1}
            step={1}
            value={amount}
            onChange={(e) => setAmount(Math.floor(Number(e.target.value) || 0))}
            required
            autoFocus
          />

          <div className="flex flex-col gap-1.5">
            <label htmlFor="method" className="text-sm font-medium text-ink-secondary">
              {t("method")}
            </label>
            <select
              id="method"
              value={method}
              onChange={(e) => setMethod(e.target.value as PaymentMethod)}
              className="h-12 w-full rounded-full border border-line-subtle bg-white px-4 text-sm text-ink outline-none transition focus:border-lavender-solid focus:ring-2 focus:ring-lavender-ring"
            >
              {METHODS.map((m) => (
                <option key={m} value={m}>
                  {t(`methods.${m}`)}
                </option>
              ))}
            </select>
          </div>

          <TextField
            name="notes"
            label={t("notes")}
            hint={t("notesOptional")}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          {error && <p className="text-sm text-pink-fg">{error}</p>}

          {isEdit && isAdmin && (
            <div className="mt-2 flex flex-col gap-2 border-t border-line-subtle pt-4">
              {canRefund && (
                <button
                  type="button"
                  onClick={() => setConfirmRefund(true)}
                  className="text-left text-sm font-semibold text-pink-fg underline-offset-2 hover:underline"
                >
                  {t("refund")}
                </button>
              )}
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="text-left text-sm font-semibold text-pink-fg underline-offset-2 hover:underline"
              >
                {t("delete")}
              </button>
            </div>
          )}
        </form>
      </Sheet>

      <ConfirmDialog
        open={confirmRefund}
        onClose={() => setConfirmRefund(false)}
        onConfirm={runRefund}
        title={t("confirmRefundTitle")}
        description={t("confirmRefundBody")}
        confirmLabel={t("refund")}
        cancelLabel={tCommon("cancel")}
        destructive
        pending={pending}
      />

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={runDelete}
        title={t("confirmDeleteTitle")}
        description={t("confirmDeleteBody")}
        confirmLabel={t("delete")}
        cancelLabel={tCommon("cancel")}
        destructive
        pending={pending}
      />
    </>
  );
}
