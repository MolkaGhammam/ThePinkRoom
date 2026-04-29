"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import {
  IconButton,
  SegmentedToggle,
  type SegmentedToggleOption,
} from "@kit";
import type {
  Appointment,
  AppointmentService,
  Client,
  Payment,
  PaymentBadge,
  Service,
  User,
} from "@/types/domain";
import type { OpeningHours } from "@/lib/opening-hours";
import { computePaymentBadge } from "@/lib/payments";
import { AppointmentForm } from "../appointments/AppointmentForm";
import { AppointmentDetailSheet } from "../appointments/AppointmentDetailSheet";
import { DailyGrid } from "./DailyGrid";
import { WeeklyGrid } from "./WeeklyGrid";

interface Props {
  date: string;
  view: "daily" | "weekly";
  showCancelled: boolean;
  staffFilter: string | null;
  appointments: Appointment[];
  appointmentServices: AppointmentService[];
  payments: Payment[];
  clientsInRange: Client[];
  allClients: Client[];
  services: Service[];
  staff: User[];
  openingHours: OpeningHours;
  isAdmin: boolean;
}

function shiftISODate(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + days);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
}

function todayInTunis(): string {
  const now = new Date(Date.now() + 60 * 60 * 1000);
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}-${String(now.getUTCDate()).padStart(2, "0")}`;
}

function formatDateLabel(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Intl.DateTimeFormat("fr-TN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date(y, m - 1, d));
}

function formatWeekLabel(weekStartStr: string): string {
  const [y, m, d] = weekStartStr.split("-").map(Number);
  const start = new Date(y, m - 1, d);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  const fmt = new Intl.DateTimeFormat("fr-TN", { day: "numeric", month: "short" });
  return `${fmt.format(start)} – ${fmt.format(end)}`;
}

export function CalendarView({
  date,
  view,
  showCancelled,
  staffFilter,
  appointments,
  appointmentServices,
  payments,
  clientsInRange,
  allClients,
  services,
  staff,
  openingHours,
  isAdmin,
}: Props) {
  const t = useTranslations("calendar");
  const tAppt = useTranslations("appointments");
  const router = useRouter();
  const locale = useLocale();

  const [createOpen, setCreateOpen] = useState(false);
  const [createSlot, setCreateSlot] = useState<{ date?: string; time?: string }>({});
  const [editAppt, setEditAppt] = useState<Appointment | null>(null);
  const [detailAppt, setDetailAppt] = useState<Appointment | null>(null);

  const visibleAppointments = useMemo(
    () =>
      showCancelled
        ? appointments
        : appointments.filter((a) => a.status !== "cancelled"),
    [appointments, showCancelled],
  );

  const clientById = useMemo(() => {
    const m = new Map<string, Client>();
    clientsInRange.forEach((c) => m.set(c.id, c));
    return m;
  }, [clientsInRange]);

  const staffById = useMemo(() => {
    const m = new Map<string, User>();
    staff.forEach((s) => m.set(s.id, s));
    return m;
  }, [staff]);

  const badgeByAppt = useMemo(() => {
    const m = new Map<string, PaymentBadge>();
    for (const a of appointments) {
      const total = appointmentServices
        .filter((s) => s.appointment_id === a.id)
        .reduce((sum, s) => sum + Number(s.price_at_booking), 0);
      const apptPayments = payments.filter((p) => p.appointment_id === a.id);
      m.set(a.id, computePaymentBadge(apptPayments, total).badge);
    }
    return m;
  }, [appointments, appointmentServices, payments]);

  function pushUrl(next: Record<string, string | null>) {
    const params = new URLSearchParams();
    const merged: Record<string, string | null> = {
      date,
      view,
      cancelled: showCancelled ? "1" : null,
      staff: staffFilter,
      ...next,
    };
    Object.entries(merged).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    router.push(`/${locale}/calendar?${params.toString()}`);
  }

  const viewOptions: [SegmentedToggleOption, SegmentedToggleOption] = [
    { value: "daily", label: t("viewDaily") },
    { value: "weekly", label: t("viewWeekly") },
  ];

  const headerLabel =
    view === "daily" ? formatDateLabel(date) : formatWeekLabel(date);

  const detailServices = useMemo(() => {
    if (!detailAppt) return [] as Service[];
    const rows = appointmentServices.filter(
      (s) => s.appointment_id === detailAppt.id,
    );
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
    const dateStr = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, "0")}-${String(startDate.getDate()).padStart(2, "0")}`;
    const timeStr = `${String(startDate.getHours()).padStart(2, "0")}:${String(startDate.getMinutes()).padStart(2, "0")}`;
    const ids = appointmentServices
      .filter((s) => s.appointment_id === editAppt.id)
      .map((s) => s.service_id);
    return {
      id: editAppt.id,
      client_id: editAppt.client_id,
      staff_user_id: editAppt.staff_user_id,
      date: dateStr,
      time: timeStr,
      service_ids: ids,
      notes: editAppt.notes ?? "",
    };
  }, [editAppt, appointmentServices]);

  function openCreate(slot?: { date?: string; time?: string }) {
    setCreateSlot(slot ?? {});
    setCreateOpen(true);
  }

  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-serif text-3xl text-ink">{t("title")}</h1>
        <IconButton
          icon={Plus}
          label={tAppt("newAppointment")}
          tone="lavender"
          size="md"
          onClick={() => openCreate({ date })}
        />
      </div>

      <div className="mt-4 hidden md:block">
        <SegmentedToggle
          options={viewOptions}
          value={view}
          onChange={(v) => pushUrl({ view: v })}
        />
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <IconButton
          icon={ChevronLeft}
          label={t("previous")}
          tone="muted"
          size="sm"
          onClick={() => pushUrl({ date: shiftISODate(date, view === "weekly" ? -7 : -1) })}
        />
        <button
          type="button"
          onClick={() => pushUrl({ date: todayInTunis() })}
          className="text-sm font-semibold text-ink underline-offset-2 hover:underline"
        >
          {headerLabel}
        </button>
        <IconButton
          icon={ChevronRight}
          label={t("next")}
          tone="muted"
          size="sm"
          onClick={() => pushUrl({ date: shiftISODate(date, view === "weekly" ? 7 : 1) })}
        />
      </div>

      {/* Filters row */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {isAdmin && (
          <select
            value={staffFilter ?? ""}
            onChange={(e) => pushUrl({ staff: e.target.value || null })}
            className="h-9 rounded-full border border-line-subtle bg-white px-4 text-sm text-ink outline-none focus:border-lavender-solid focus:ring-2 focus:ring-lavender-ring"
          >
            <option value="">{t("allStaff")}</option>
            {staff.map((s) => (
              <option key={s.id} value={s.id}>
                {s.full_name}
              </option>
            ))}
          </select>
        )}
        <button
          type="button"
          onClick={() => pushUrl({ cancelled: showCancelled ? null : "1" })}
          className={
            showCancelled
              ? "h-9 rounded-full bg-lavender-solid px-4 text-sm font-semibold text-white"
              : "h-9 rounded-full border border-line-subtle bg-white px-4 text-sm font-medium text-ink"
          }
        >
          {showCancelled ? t("hideCancelled") : t("showCancelled")}
        </button>
      </div>

      <div className="mt-6">
        {view === "weekly" ? (
          <>
            <div className="hidden md:block">
              <WeeklyGrid
                weekStartDate={date}
                appointments={visibleAppointments}
                openingHours={openingHours}
                clientById={clientById}
                staffById={staffById}
                badgeByAppt={badgeByAppt}
                showStaff={isAdmin && !staffFilter}
                onAppointmentClick={(a) => setDetailAppt(a)}
                onEmptySlotClick={(d, time) => openCreate({ date: d, time })}
              />
            </div>
            <div className="rounded-2xl bg-white p-6 text-center text-sm text-ink-secondary md:hidden">
              {t("weeklyOnDesktop")}
            </div>
          </>
        ) : (
          <DailyGrid
            date={date}
            appointments={visibleAppointments}
            openingHours={openingHours}
            clientById={clientById}
            staffById={staffById}
            badgeByAppt={badgeByAppt}
            showStaff={isAdmin && !staffFilter}
            onAppointmentClick={(a) => setDetailAppt(a)}
            onEmptySlotClick={(time) => openCreate({ date, time })}
          />
        )}
      </div>

      <AppointmentForm
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        clients={allClients}
        staff={staff}
        services={services}
        initial={createSlot}
        onSaved={() => router.refresh()}
      />

      <AppointmentForm
        open={Boolean(editInitial)}
        onClose={() => setEditAppt(null)}
        clients={allClients}
        staff={staff}
        services={services}
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
          client={clientById.get(detailAppt.client_id)}
          staff={staffById.get(detailAppt.staff_user_id)}
          onChanged={() => router.refresh()}
          onEdit={() => {
            const a = detailAppt;
            setDetailAppt(null);
            setEditAppt(a);
          }}
        />
      )}
    </>
  );
}
