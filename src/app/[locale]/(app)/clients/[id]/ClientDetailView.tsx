"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { ArrowLeft, Pencil, Plus } from "lucide-react";
import { Button, Card, ConfirmDialog, IconButton, Tag } from "@kit";
import type {
  Appointment,
  AppointmentService,
  Client,
  Payment,
  Service,
  User,
} from "@/types/domain";
import { ClientForm } from "../ClientForm";
import { deleteClient } from "../actions";
import { AppointmentForm } from "../../appointments/AppointmentForm";
import { AppointmentDetailSheet } from "../../appointments/AppointmentDetailSheet";
import { BADGE_TONE, computePaymentBadge } from "@/lib/payments";

interface Props {
  client: Client;
  appointments: Appointment[];
  appointmentServices: AppointmentService[];
  payments: Payment[];
  services: Service[];
  staff: User[];
  canDelete: boolean;
}

function formatDate(iso: string, locale: string) {
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-TN" : "fr-TN", {
    dateStyle: "medium",
  }).format(new Date(iso));
}

const STATUS_LABEL: Record<string, string> = {
  scheduled: "Planifié",
  confirmed: "Confirmé",
  completed: "Terminé",
  no_show: "Absent",
  cancelled: "Annulé",
};

export function ClientDetailView({
  client,
  appointments,
  appointmentServices,
  payments,
  services,
  staff,
  canDelete,
}: Props) {
  const t = useTranslations("clients");
  const tAppt = useTranslations("appointments");
  const tPay = useTranslations("payments");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const locale = useLocale();
  const [editing, setEditing] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);
  const [pending, startTransition] = useTransition();

  const [createOpen, setCreateOpen] = useState(false);
  const [editAppt, setEditAppt] = useState<Appointment | null>(null);
  const [detailAppt, setDetailAppt] = useState<Appointment | null>(null);

  const { visits, totalSpent, noShows, lastVisitAt } = useMemo(() => {
    const completedAppts = appointments.filter((a) => a.status === "completed");
    const noShowCount = appointments.filter((a) => a.status === "no_show").length;
    const lastVisit = completedAppts[0]?.start_at ?? null;
    const total = payments.reduce((sum, p) => {
      if (p.status === "paid") return sum + Number(p.amount);
      if (p.status === "refunded") return sum - Number(p.amount);
      return sum;
    }, 0);
    return {
      visits: completedAppts.length,
      totalSpent: total,
      noShows: noShowCount,
      lastVisitAt: lastVisit,
    };
  }, [appointments, payments]);

  function runDelete() {
    startTransition(async () => {
      await deleteClient(client.id);
      router.push(`/${locale}/clients`);
    });
  }

  // For the AppointmentDetailSheet we need to enrich the snapshotted services
  // (price/duration at booking) into something that looks like a Service row.
  const detailServices = useMemo(() => {
    if (!detailAppt) return [] as Service[];
    const rows = appointmentServices.filter((s) => s.appointment_id === detailAppt.id);
    return rows.map((row) => {
      const meta = services.find((s) => s.id === row.service_id);
      return {
        id: row.service_id,
        salon_id: row.salon_id,
        name: meta?.name ?? "—",
        duration_minutes: row.duration_at_booking,
        price: row.price_at_booking,
        active: meta?.active ?? false,
        created_at: row.created_at,
        updated_at: row.updated_at,
        deleted_at: null,
      } as Service;
    });
  }, [detailAppt, appointmentServices, services]);

  const editInitial = useMemo(() => {
    if (!editAppt) return undefined;
    const startDate = new Date(editAppt.start_at);
    const date = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, "0")}-${String(startDate.getDate()).padStart(2, "0")}`;
    const time = `${String(startDate.getHours()).padStart(2, "0")}:${String(startDate.getMinutes()).padStart(2, "0")}`;
    const ids = appointmentServices
      .filter((s) => s.appointment_id === editAppt.id)
      .map((s) => s.service_id);
    return {
      id: editAppt.id,
      client_id: editAppt.client_id,
      staff_user_id: editAppt.staff_user_id,
      date,
      time,
      service_ids: ids,
      notes: editAppt.notes ?? "",
    };
  }, [editAppt, appointmentServices]);

  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <IconButton
          icon={ArrowLeft}
          label={tCommon("back")}
          tone="muted"
          size="md"
          onClick={() => router.push(`/${locale}/clients`)}
        />
        <IconButton
          icon={Pencil}
          label={tCommon("edit")}
          tone="lavender"
          size="md"
          onClick={() => setEditing(true)}
        />
      </div>

      <div className="mt-4">
        <h1 className="font-serif text-3xl text-ink">{client.full_name}</h1>
        {client.phone && <p className="mt-1 text-sm text-ink-secondary">{client.phone}</p>}
      </div>

      <div className="mt-4">
        <Button tone="lavender" fullWidth onClick={() => setCreateOpen(true)}>
          <span className="inline-flex items-center justify-center gap-2">
            <Plus width={16} height={16} strokeWidth={2.4} />
            {tAppt("newForClient")}
          </span>
        </Button>
      </div>

      <Card tone="white" padding="lg" elevated className="mt-6">
        <div className="grid grid-cols-3 gap-3 text-center">
          <Stat label={t("visits")} value={visits.toString()} />
          <Stat label={t("totalSpent")} value={`${Math.round(totalSpent)} TND`} />
          <Stat label={t("noShows")} value={noShows.toString()} />
        </div>
        <div className="mt-4 border-t border-line-subtle pt-3 text-center text-xs text-ink-muted">
          {t("lastVisit")}:{" "}
          {lastVisitAt ? formatDate(lastVisitAt, locale) : t("noVisitYet")}
        </div>
      </Card>

      <Card tone="white" padding="lg" elevated className="mt-4">
        <h2 className="font-serif text-xl text-ink">{t("info")}</h2>
        <dl className="mt-3 grid grid-cols-1 gap-2 text-sm">
          <Row label={t("email")} value={client.email} />
          <Row
            label={t("instagram")}
            value={client.instagram_handle ? `@${client.instagram_handle}` : null}
          />
          <Row
            label={t("acquisitionChannel")}
            value={
              client.acquisition_channel
                ? t(`channels.${client.acquisition_channel}` as never)
                : null
            }
          />
        </dl>
      </Card>

      <Card tone="white" padding="lg" elevated className="mt-4">
        <h2 className="font-serif text-xl text-ink">{t("visitHistory")}</h2>
        {appointments.length === 0 ? (
          <p className="mt-3 text-sm text-ink-secondary">{t("visitHistoryEmpty")}</p>
        ) : (
          <ul className="mt-3 flex flex-col gap-3">
            {appointments.map((a) => {
              const svcs = appointmentServices.filter((s) => s.appointment_id === a.id);
              const total = svcs.reduce((sum, s) => sum + Number(s.price_at_booking), 0);
              const apptPayments = payments.filter((p) => p.appointment_id === a.id);
              const { badge } = computePaymentBadge(apptPayments, total);
              return (
                <li key={a.id}>
                  <button
                    type="button"
                    onClick={() => setDetailAppt(a)}
                    className="w-full rounded-2xl border border-line-subtle p-3 text-left transition hover:bg-muted/40"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-ink">
                        {formatDate(a.start_at, locale)}
                      </span>
                      <div className="flex items-center gap-1">
                        <Tag
                          tone={
                            a.status === "completed"
                              ? "mint"
                              : a.status === "no_show" || a.status === "cancelled"
                                ? "muted"
                                : "lavender"
                          }
                        >
                          {STATUS_LABEL[a.status] ?? a.status}
                        </Tag>
                        <Tag tone={BADGE_TONE[badge]}>{tPay(`badge.${badge}`)}</Tag>
                      </div>
                    </div>
                    {svcs.length > 0 && (
                      <p className="mt-1 text-sm text-ink-secondary">
                        {svcs.length} prestation{svcs.length > 1 ? "s" : ""} ·{" "}
                        {Math.round(total)} TND
                      </p>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      {canDelete && (
        <div className="mt-6">
          <Button tone="white" fullWidth onClick={() => setConfirmDel(true)}>
            <span className="text-pink-fg">{t("delete")}</span>
          </Button>
        </div>
      )}

      <ClientForm
        open={editing}
        onClose={() => setEditing(false)}
        client={client}
        onSaved={() => router.refresh()}
      />

      <AppointmentForm
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        clients={[client]}
        staff={staff}
        services={services}
        lockClient
        initial={{ client_id: client.id }}
        onSaved={() => router.refresh()}
      />

      <AppointmentForm
        open={Boolean(editInitial)}
        onClose={() => setEditAppt(null)}
        clients={[client]}
        staff={staff}
        services={services}
        lockClient
        initial={editInitial}
        onSaved={() => router.refresh()}
      />

      {detailAppt && (
        <AppointmentDetailSheet
          open={Boolean(detailAppt)}
          onClose={() => setDetailAppt(null)}
          appointment={detailAppt}
          services={detailServices}
          payments={payments.filter((p) => p.appointment_id === detailAppt.id)}
          client={client}
          staff={staff.find((s) => s.id === detailAppt.staff_user_id)}
          onChanged={() => router.refresh()}
          onEdit={() => {
            const a = detailAppt;
            setDetailAppt(null);
            setEditAppt(a);
          }}
        />
      )}

      <ConfirmDialog
        open={confirmDel}
        onClose={() => setConfirmDel(false)}
        onConfirm={runDelete}
        title={t("confirmDeleteTitle")}
        description={t("confirmDeleteBody")}
        confirmLabel={t("confirmDelete")}
        cancelLabel={tCommon("cancel")}
        destructive
        pending={pending}
      />
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-serif text-2xl text-ink">{value}</p>
      <p className="mt-1 text-xs text-ink-muted">{label}</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div className="flex items-baseline justify-between gap-3 border-t border-line-subtle pt-2 first:border-0 first:pt-0">
      <dt className="text-xs uppercase tracking-wide text-ink-muted">{label}</dt>
      <dd className="text-sm text-ink">{value}</dd>
    </div>
  );
}
