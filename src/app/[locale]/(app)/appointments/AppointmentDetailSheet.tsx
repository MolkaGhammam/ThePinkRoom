"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Button, ConfirmDialog, Sheet, Tag } from "@kit";
import type {
  Appointment,
  AppointmentService,
  AppointmentStatus,
  Client,
  Service,
  User,
} from "@/types/domain";
import { useCurrentUser } from "@/components/UserProvider";
import { isTerminal, nextStatuses } from "@/lib/appointments";
import { setAppointmentStatus } from "./actions";

interface Props {
  open: boolean;
  onClose: () => void;
  appointment: Appointment;
  services: Service[]; // selected services in order
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
  client,
  staff,
  onChanged,
  onEdit,
}: Props) {
  const t = useTranslations("appointments");
  const tCommon = useTranslations("common");
  const me = useCurrentUser();
  const [pending, startTransition] = useTransition();
  const [confirmCancel, setConfirmCancel] = useState(false);

  const isAdmin = me.profile.role === "admin";
  const isOwnedByMe = appointment.staff_user_id === me.authId;
  const canModify = isAdmin || isOwnedByMe;
  const terminal = isTerminal(appointment.status);
  const transitions = nextStatuses(appointment.status);

  const totalPrice = services
    .map((s, i) => {
      // We pass services already enriched with appointment_services snapshot data via duration/price below if needed
      return Number(s.price);
    })
    .reduce((sum, p) => sum + p, 0);

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

  return (
    <>
      <Sheet
        open={open}
        onClose={onClose}
        title={t("editAppointment")}
        footer={
          canModify && !terminal ? (
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
          <div className="flex items-center justify-between gap-2">
            <Tag tone={STATUS_TONE[appointment.status]}>
              {t(`status.${appointment.status}`)}
            </Tag>
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
