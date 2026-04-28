"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { ArrowLeft, Pencil } from "lucide-react";
import { Button, Card, ConfirmDialog, IconButton, Tag } from "@kit";
import type {
  Appointment,
  AppointmentService,
  Client,
  Payment,
} from "@/types/domain";
import { ClientForm } from "../ClientForm";
import { deleteClient } from "../actions";

interface Props {
  client: Client;
  appointments: Appointment[];
  appointmentServices: AppointmentService[];
  payments: Payment[];
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
  canDelete,
}: Props) {
  const t = useTranslations("clients");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const locale = useLocale();
  const [editing, setEditing] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);
  const [pending, startTransition] = useTransition();

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
              return (
                <li key={a.id} className="rounded-2xl border border-line-subtle p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-ink">
                      {formatDate(a.start_at, locale)}
                    </span>
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
                  </div>
                  {svcs.length > 0 && (
                    <p className="mt-1 text-sm text-ink-secondary">
                      {svcs.length} prestation{svcs.length > 1 ? "s" : ""} · {Math.round(total)} TND
                    </p>
                  )}
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
