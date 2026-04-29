"use client";

import { useMemo, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";
import { Button, ConfirmDialog, IconButton, Sheet, Tag } from "@kit";
import type {
  Appointment,
  AppointmentStatus,
  Client,
  Payment,
  Service,
  User,
} from "@/types/domain";
import { useCurrentUser } from "@/components/UserProvider";
import { isTerminal, nextStatuses } from "@/lib/appointments";
import { BADGE_TONE, computePaymentBadge } from "@/lib/payments";
import { setAppointmentStatus } from "./actions";
import { PaymentForm } from "./PaymentForm";

interface Props {
  open: boolean;
  onClose: () => void;
  appointment: Appointment;
  services: Service[]; // selected services in order
  payments: Payment[];
  client?: Client;
  staff?: User;
  onChanged: () => void;
  onEdit: () => void;
}

const STATUS_TONE: Record<AppointmentStatus, "lavender" | "mint" | "muted" | "pink"> = {
  scheduled: "lavender",
  confirmed: "lavender",
  completed: "mint",
  no_show: "muted",
  cancelled: "muted",
};

function formatTime(iso: string) {
  return new Intl.DateTimeFormat("fr-TN", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Africa/Tunis",
  }).format(new Date(iso));
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("fr-TN", {
    dateStyle: "full",
    timeZone: "Africa/Tunis",
  }).format(new Date(iso));
}

export function AppointmentDetailSheet({
  open,
  onClose,
  appointment,
  services,
  payments,
  client,
  staff,
  onChanged,
  onEdit,
}: Props) {
  const t = useTranslations("appointments");
  const tPay = useTranslations("payments");
  const tCommon = useTranslations("common");
  const me = useCurrentUser();
  const [pending, startTransition] = useTransition();
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [paymentEditing, setPaymentEditing] = useState<Payment | null>(null);
  const [paymentOpen, setPaymentOpen] = useState(false);

  const isAdmin = me.profile.role === "admin";
  const isOwnedByMe = appointment.staff_user_id === me.authId;
  const canModifyStatus = isAdmin || isOwnedByMe;
  const canRecordPayment = isAdmin || isOwnedByMe;
  const terminal = isTerminal(appointment.status);
  const transitions = nextStatuses(appointment.status);

  const totalPrice = services.reduce((sum, s) => sum + Number(s.price), 0);

  const { badge, paid } = useMemo(
    () => computePaymentBadge(payments, totalPrice),
    [payments, totalPrice],
  );
  const balance = Math.max(0, totalPrice - paid);

  function transition(next: AppointmentStatus) {
    if (next === "cancelled") {
      setConfirmCancel(true);
      return;
    }
    startTransition(async () => {
      await setAppointmentStatus(appointment.id, next);
      onChanged();
      onClose();
    });
  }

  function runCancel() {
    startTransition(async () => {
      await setAppointmentStatus(appointment.id, "cancelled");
      setConfirmCancel(false);
      onChanged();
      onClose();
    });
  }

  function openPaymentCreate() {
    setPaymentEditing(null);
    setPaymentOpen(true);
  }

  function openPaymentEdit(p: Payment) {
    setPaymentEditing(p);
    setPaymentOpen(true);
  }

  return (
    <>
      <Sheet
        open={open}
        onClose={onClose}
        title={t("editAppointment")}
        footer={
          canModifyStatus && !terminal ? (
            <div className="flex flex-col gap-2">
              {transitions.map((s) => {
                if (s === "cancelled") {
                  return (
                    <Button
                      key={s}
                      tone="white"
                      fullWidth
                      disabled={pending}
                      onClick={() => transition(s)}
                    >
                      <span className="text-pink-fg">{t(`actions.${s}`)}</span>
                    </Button>
                  );
                }
                return (
                  <Button
                    key={s}
                    tone={s === "completed" ? "lavender" : "white"}
                    fullWidth
                    disabled={pending}
                    onClick={() => transition(s)}
                  >
                    {t(`actions.${s}`)}
                  </Button>
                );
              })}
              {appointment.status !== "completed" && appointment.status !== "no_show" && (
                <Button tone="white" fullWidth disabled={pending} onClick={onEdit}>
                  {tCommon("edit")}
                </Button>
              )}
            </div>
          ) : null
        }
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Tag tone={STATUS_TONE[appointment.status]}>
              {t(`status.${appointment.status}`)}
            </Tag>
            <Tag tone={BADGE_TONE[badge]}>{tPay(`badge.${badge}`)}</Tag>
          </div>

          <div>
            <p className="font-serif text-2xl text-ink">{client?.full_name ?? "—"}</p>
            {client?.phone && <p className="text-sm text-ink-secondary">{client.phone}</p>}
          </div>

          <div className="rounded-2xl border border-line-subtle p-3">
            <p className="text-xs uppercase tracking-wide text-ink-muted">
              {t("date")}
            </p>
            <p className="mt-1 text-sm text-ink">{formatDate(appointment.start_at)}</p>
            <p className="mt-2 text-xs uppercase tracking-wide text-ink-muted">
              {t("time")}
            </p>
            <p className="mt-1 text-sm text-ink">
              {formatTime(appointment.start_at)} – {formatTime(appointment.end_at)}
            </p>
            <p className="mt-2 text-xs uppercase tracking-wide text-ink-muted">
              {t("staff")}
            </p>
            <p className="mt-1 text-sm text-ink">{staff?.full_name ?? "—"}</p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-ink-muted">
              {t("services")}
            </p>
            <ul className="mt-2 flex flex-col gap-1.5">
              {services.map((s) => (
                <li
                  key={s.id}
                  className="flex items-center justify-between rounded-2xl bg-muted px-3 py-2 text-sm"
                >
                  <span className="truncate text-ink">{s.name}</span>
                  <span className="shrink-0 text-ink-secondary">
                    {s.duration_minutes} {t("minutes")} · {Math.round(Number(s.price))} {t("tnd")}
                  </span>
                </li>
              ))}
            </ul>
            {services.length > 0 && (
              <p className="mt-2 text-right text-sm font-semibold text-ink">
                {Math.round(totalPrice)} {t("tnd")}
              </p>
            )}
          </div>

          {/* Payments section */}
          <div>
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs uppercase tracking-wide text-ink-muted">
                {tPay("title")}
              </p>
              {canRecordPayment && (
                <IconButton
                  icon={Plus}
                  label={tPay("addPayment")}
                  tone="lavender"
                  size="sm"
                  onClick={openPaymentCreate}
                />
              )}
            </div>

            {payments.filter((p) => !p.deleted_at).length === 0 ? (
              <p className="mt-2 text-sm text-ink-secondary">{tPay("noPayments")}</p>
            ) : (
              <ul className="mt-2 flex flex-col gap-1.5">
                {payments
                  .filter((p) => !p.deleted_at)
                  .map((p) => {
                    const isRefund = p.status === "refunded";
                    const sign = isRefund ? "-" : "";
                    const clickable = isAdmin && !isRefund;
                    const Inner = (
                      <>
                        <span className="truncate text-ink">
                          {tPay(`methods.${p.method}`)}
                          {isRefund ? ` · ${tPay("badge.refunded")}` : ""}
                        </span>
                        <span className="shrink-0 font-semibold text-ink">
                          {sign}
                          {Math.round(Number(p.amount))} {tPay("tnd")}
                        </span>
                      </>
                    );
                    return (
                      <li key={p.id}>
                        {clickable ? (
                          <button
                            type="button"
                            onClick={() => openPaymentEdit(p)}
                            className="flex w-full items-center justify-between rounded-2xl bg-muted px-3 py-2 text-left text-sm transition hover:bg-line-subtle"
                          >
                            {Inner}
                          </button>
                        ) : (
                          <div
                            className={
                              "flex items-center justify-between rounded-2xl px-3 py-2 text-sm " +
                              (isRefund ? "bg-pink-soft" : "bg-muted")
                            }
                          >
                            {Inner}
                          </div>
                        )}
                      </li>
                    );
                  })}
              </ul>
            )}

            {services.length > 0 && (
              <div className="mt-3 flex flex-col gap-1 rounded-2xl border border-line-subtle p-3 text-sm">
                <Row label={tPay("totalDue")} value={`${Math.round(totalPrice)} ${tPay("tnd")}`} />
                <Row label={tPay("totalPaid")} value={`${Math.round(paid)} ${tPay("tnd")}`} />
                <Row
                  label={tPay("balance")}
                  value={`${Math.round(balance)} ${tPay("tnd")}`}
                  emphasis
                />
              </div>
            )}
          </div>

          {appointment.notes && (
            <div className="rounded-2xl border border-line-subtle p-3">
              <p className="text-xs uppercase tracking-wide text-ink-muted">
                {t("notes")}
              </p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-ink">
                {appointment.notes}
              </p>
            </div>
          )}
        </div>
      </Sheet>

      <PaymentForm
        open={paymentOpen}
        onClose={() => setPaymentOpen(false)}
        appointmentId={appointment.id}
        payment={paymentEditing}
        onChanged={onChanged}
      />

      <ConfirmDialog
        open={confirmCancel}
        onClose={() => setConfirmCancel(false)}
        onConfirm={runCancel}
        title={t("confirmCancelTitle")}
        description={t("confirmCancelBody")}
        confirmLabel={t("actions.cancelled")}
        cancelLabel={tCommon("back")}
        destructive
        pending={pending}
      />
    </>
  );
}

function Row({
  label,
  value,
  emphasis,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs uppercase tracking-wide text-ink-muted">{label}</span>
      <span className={emphasis ? "text-base font-semibold text-ink" : "text-sm text-ink"}>
        {value}
      </span>
    </div>
  );
}
