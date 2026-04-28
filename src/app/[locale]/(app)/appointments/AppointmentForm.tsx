"use client";

import { useMemo, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import {
  Button,
  Calendar,
  Card,
  Chip,
  DayStrip,
  type DayStripItem,
  Sheet,
  TextField,
  TimeWheel,
  type TimeWheelValue,
} from "@kit";
import type { Client, Service, User } from "@/types/domain";
import { useCurrentUser } from "@/components/UserProvider";
import { hhmmToWheel, wheelToHHMM } from "@/lib/appointments";
import { saveAppointment, type AppointmentInput } from "./actions";

export interface AppointmentFormInitial {
  id?: string;
  client_id?: string;
  staff_user_id?: string;
  date?: string; // YYYY-MM-DD
  time?: string; // HH:MM
  service_ids?: string[];
  notes?: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  /** Pre-fill values; for create or edit. */
  initial?: AppointmentFormInitial;
  clients: Client[];
  staff: User[];
  services: Service[];
  /** When the client is fixed (e.g. opened from client detail), lock the picker. */
  lockClient?: boolean;
  onSaved: (id: string) => void;
}

const ALLOWED_MINUTES = [0, 15, 30, 45];

function todayISO(): string {
  const d = new Date();
  // Use local YYYY-MM-DD; we treat dates as wall dates in salon timezone.
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function buildDayStrip(start: string, count: number): DayStripItem[] {
  const items: DayStripItem[] = [];
  const [y, m, d] = start.split("-").map(Number);
  const base = new Date(y, m - 1, d);
  const labels = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
  for (let i = 0; i < count; i++) {
    const dt = new Date(base);
    dt.setDate(base.getDate() + i);
    const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
    items.push({ key, weekday: labels[dt.getDay()], day: dt.getDate() });
  }
  return items;
}

function dateFromISO(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function isoFromDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function AppointmentForm({
  open,
  onClose,
  initial,
  clients,
  staff,
  services,
  lockClient,
  onSaved,
}: Props) {
  const t = useTranslations("appointments");
  const tCommon = useTranslations("common");
  const me = useCurrentUser();
  const isAdmin = me.profile.role === "admin";

  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [overlapWarning, setOverlapWarning] = useState(false);

  const initialDate = initial?.date ?? todayISO();
  const initialTime = initial?.time ?? "10:00";

  const [clientId, setClientId] = useState<string>(initial?.client_id ?? "");
  const [staffId, setStaffId] = useState<string>(
    initial?.staff_user_id ?? (isAdmin ? "" : me.authId),
  );
  const [date, setDate] = useState<string>(initialDate);
  const [time, setTime] = useState<TimeWheelValue>(
    hhmmToWheel(initialTime, ALLOWED_MINUTES),
  );
  const [serviceIds, setServiceIds] = useState<string[]>(initial?.service_ids ?? []);
  const [notes, setNotes] = useState<string>(initial?.notes ?? "");
  const [showCalendar, setShowCalendar] = useState(false);

  // Re-seed when the form opens for a different appointment.
  const seedKey = `${open}:${initial?.id ?? "new"}:${initial?.client_id ?? ""}`;
  const [seenKey, setSeenKey] = useState(seedKey);
  if (seenKey !== seedKey) {
    setSeenKey(seedKey);
    setClientId(initial?.client_id ?? "");
    setStaffId(initial?.staff_user_id ?? (isAdmin ? "" : me.authId));
    setDate(initial?.date ?? todayISO());
    setTime(hhmmToWheel(initial?.time ?? "10:00", ALLOWED_MINUTES));
    setServiceIds(initial?.service_ids ?? []);
    setNotes(initial?.notes ?? "");
    setShowCalendar(false);
    setError(null);
    setOverlapWarning(false);
  }

  const dayStrip = useMemo(() => buildDayStrip(todayISO(), 14), []);

  const selectedServices = useMemo(
    () => serviceIds.map((id) => services.find((s) => s.id === id)!).filter(Boolean),
    [serviceIds, services],
  );
  const totalMinutes = selectedServices.reduce(
    (sum, s) => sum + Number(s.duration_minutes),
    0,
  );
  const totalPrice = selectedServices.reduce((sum, s) => sum + Number(s.price), 0);

  function toggleService(id: string) {
    setServiceIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
    setOverlapWarning(false);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const payload: AppointmentInput = {
      id: initial?.id,
      client_id: clientId,
      staff_user_id: staffId,
      date,
      time: wheelToHHMM(time),
      service_ids: serviceIds,
      notes: notes.trim() || null,
      override_overlap: overlapWarning && isAdmin,
    };

    startTransition(async () => {
      const result = await saveAppointment(payload);
      if (result.ok) {
        onSaved(result.data);
        onClose();
        return;
      }
      if (result.error === "overlap") {
        if (isAdmin) {
          setOverlapWarning(true);
          setError(null);
        } else {
          setError(t("overlapStaffBlock"));
        }
        return;
      }
      const map: Record<string, string> = {
        client_required: t("errors.client_required"),
        staff_required: t("errors.staff_required"),
        no_services: t("errors.no_services"),
        invalid_time: t("errors.invalid_time"),
        client_not_found: t("errors.client_not_found"),
        service_not_found: t("errors.service_not_found"),
        invalid_status_transition: t("errors.invalid_status_transition"),
        forbidden: t("errors.forbidden"),
      };
      setError(map[result.error] ?? tCommon("error"));
    });
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={initial?.id ? t("editAppointment") : t("newAppointment")}
      footer={
        <Button
          type="submit"
          form="appointment-form"
          tone="lavender"
          fullWidth
          disabled={pending}
        >
          {pending
            ? tCommon("loading")
            : overlapWarning && isAdmin
              ? t("overlapContinue")
              : tCommon("save")}
        </Button>
      }
    >
      <form id="appointment-form" onSubmit={onSubmit} className="flex flex-col gap-5">
        {/* Client */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="client_id" className="text-sm font-medium text-ink-secondary">
            {t("client")}
          </label>
          <select
            id="client_id"
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            disabled={lockClient}
            required
            className="h-12 w-full rounded-full border border-line-subtle bg-white px-4 text-sm text-ink outline-none transition focus:border-lavender-solid focus:ring-2 focus:ring-lavender-ring disabled:bg-muted disabled:text-ink-muted"
          >
            <option value="" disabled>
              {t("selectClient")}
            </option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.full_name}
                {c.phone ? ` — ${c.phone}` : ""}
              </option>
            ))}
          </select>
        </div>

        {/* Staff */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="staff_user_id" className="text-sm font-medium text-ink-secondary">
            {t("staff")}
          </label>
          <select
            id="staff_user_id"
            value={staffId}
            onChange={(e) => setStaffId(e.target.value)}
            disabled={!isAdmin}
            required
            className="h-12 w-full rounded-full border border-line-subtle bg-white px-4 text-sm text-ink outline-none transition focus:border-lavender-solid focus:ring-2 focus:ring-lavender-ring disabled:bg-muted disabled:text-ink-muted"
          >
            <option value="" disabled>
              —
            </option>
            {staff.map((s) => (
              <option key={s.id} value={s.id}>
                {s.full_name}
              </option>
            ))}
          </select>
        </div>

        {/* Date */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-ink-secondary">{t("date")}</span>
            <button
              type="button"
              onClick={() => setShowCalendar((s) => !s)}
              className="text-xs font-medium text-lavender-solid underline-offset-2 hover:underline"
            >
              {t("moreDates")}
            </button>
          </div>
          <DayStrip
            days={dayStrip}
            selectedKey={date}
            onSelect={(k) => {
              setDate(k);
              setOverlapWarning(false);
              setShowCalendar(false);
            }}
          />
          {showCalendar && (
            <div className="mt-2">
              <Calendar
                value={dateFromISO(date)}
                onSelect={(d) => {
                  setDate(isoFromDate(d));
                  setOverlapWarning(false);
                  setShowCalendar(false);
                }}
              />
            </div>
          )}
        </div>

        {/* Time */}
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-ink-secondary">{t("time")}</span>
          <TimeWheel
            value={time}
            onChange={(v) => {
              setTime(v);
              setOverlapWarning(false);
            }}
            minutes={ALLOWED_MINUTES}
          />
        </div>

        {/* Services */}
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-ink-secondary">{t("services")}</span>
          {services.length === 0 ? (
            <p className="text-sm text-ink-muted">{t("selectServices")}</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {services.map((s) => {
                const selected = serviceIds.includes(s.id);
                return (
                  <Chip
                    key={s.id}
                    selected={selected}
                    onClick={() => toggleService(s.id)}
                    shape="pill"
                    size="sm"
                  >
                    {s.name} · {s.duration_minutes}
                    {t("minutes")}
                  </Chip>
                );
              })}
            </div>
          )}
          {serviceIds.length === 0 ? (
            <p className="text-xs text-ink-muted">{t("noServiceSelected")}</p>
          ) : (
            <div className="mt-1 flex justify-between text-xs text-ink-secondary">
              <span>
                {t("totalDuration")}: <strong className="text-ink">{totalMinutes} {t("minutes")}</strong>
              </span>
              <span>
                {t("totalPrice")}:{" "}
                <strong className="text-ink">
                  {Math.round(totalPrice)} {t("tnd")}
                </strong>
              </span>
            </div>
          )}
        </div>

        {/* Notes */}
        <TextField
          name="notes"
          label={t("notes")}
          placeholder={t("notesPlaceholder")}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        {overlapWarning && isAdmin && (
          <Card tone="pink" padding="md">
            <p className="text-sm text-pink-fg">{t("overlapAdminWarning")}</p>
          </Card>
        )}

        {error && <p className="text-sm text-pink-fg">{error}</p>}
      </form>
    </Sheet>
  );
}
