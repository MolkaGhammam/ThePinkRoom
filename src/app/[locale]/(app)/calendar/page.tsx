import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import type {
  Appointment,
  AppointmentService,
  Client,
  Payment,
  Salon,
  Service,
  User,
} from "@/types/domain";
import {
  DEFAULT_OPENING_HOURS,
  isValidOpeningHours,
  type OpeningHours,
} from "@/lib/opening-hours";
import { CalendarView } from "./CalendarView";

type SearchParams = Promise<{
  date?: string;
  view?: string;
  staff?: string;
  cancelled?: string;
}>;

function todayInTunis(): string {
  // Africa/Tunis is fixed at UTC+1 (no DST since 2009).
  const now = new Date(Date.now() + 60 * 60 * 1000);
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}-${String(now.getUTCDate()).padStart(2, "0")}`;
}

function weekStart(dateStr: string): string {
  // Week starts on Monday for the salon (TN convention).
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  const dow = dt.getDay(); // 0=Sun..6=Sat
  const offset = dow === 0 ? -6 : 1 - dow;
  dt.setDate(dt.getDate() + offset);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
}

function shiftDate(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + days);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
}

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const user = await getCurrentUser();
  const supabase = await createClient();

  const view = params.view === "weekly" ? "weekly" : "daily";
  const date = params.date && /^\d{4}-\d{2}-\d{2}$/.test(params.date)
    ? params.date
    : todayInTunis();
  const showCancelled = params.cancelled === "1";

  // Range to fetch.
  let rangeStart: string;
  let rangeEndExclusive: string;
  if (view === "weekly") {
    rangeStart = weekStart(date);
    rangeEndExclusive = shiftDate(rangeStart, 7);
  } else {
    rangeStart = date;
    rangeEndExclusive = shiftDate(date, 1);
  }

  const startISO = new Date(`${rangeStart}T00:00:00+01:00`).toISOString();
  const endISO = new Date(`${rangeEndExclusive}T00:00:00+01:00`).toISOString();

  // Salon, staff, services in parallel.
  const [salonResult, staffResult, serviceResult] = await Promise.all([
    supabase
      .from("salons")
      .select("*")
      .eq("id", user.profile.salon_id)
      .single(),
    supabase
      .from("users")
      .select("*")
      .eq("salon_id", user.profile.salon_id)
      .eq("active", true)
      .is("deleted_at", null)
      .order("full_name", { ascending: true }),
    supabase
      .from("services")
      .select("*")
      .eq("salon_id", user.profile.salon_id)
      .eq("active", true)
      .is("deleted_at", null)
      .order("name", { ascending: true }),
  ]);

  if (salonResult.error || !salonResult.data) {
    throw new Error(salonResult.error?.message ?? "Salon not found");
  }

  const salon = salonResult.data as Salon;
  const allStaff = (staffResult.data ?? []) as User[];
  const services = (serviceResult.data ?? []) as Service[];

  const isAdmin = user.profile.role === "admin";
  const visibleStaff = isAdmin ? allStaff : allStaff.filter((s) => s.id === user.authId);
  const staffFilter = isAdmin && params.staff ? params.staff : null;

  // Appointments query.
  let apptQuery = supabase
    .from("appointments")
    .select("*")
    .eq("salon_id", user.profile.salon_id)
    .is("deleted_at", null)
    .gte("start_at", startISO)
    .lt("start_at", endISO);

  if (!isAdmin) {
    apptQuery = apptQuery.eq("staff_user_id", user.authId);
  } else if (staffFilter) {
    apptQuery = apptQuery.eq("staff_user_id", staffFilter);
  }

  const { data: apptRows, error: apptErr } = await apptQuery.order("start_at", {
    ascending: true,
  });
  if (apptErr) throw new Error(apptErr.message);

  const appointments = (apptRows ?? []) as Appointment[];

  // Pull related rows in batch.
  const apptIds = appointments.map((a) => a.id);
  const clientIds = Array.from(new Set(appointments.map((a) => a.client_id)));

  const [{ data: apptSvcRows }, { data: clientRows }, { data: paymentRows }] =
    await Promise.all([
      apptIds.length
        ? supabase.from("appointment_services").select("*").in("appointment_id", apptIds)
        : Promise.resolve({ data: [] as AppointmentService[] }),
      clientIds.length
        ? supabase.from("clients").select("*").in("id", clientIds).is("deleted_at", null)
        : Promise.resolve({ data: [] as Client[] }),
      apptIds.length
        ? supabase
            .from("payments")
            .select("*")
            .in("appointment_id", apptIds)
            .is("deleted_at", null)
        : Promise.resolve({ data: [] as Payment[] }),
    ]);

  // Full client list for the create form.
  const { data: allClientsRows } = await supabase
    .from("clients")
    .select("*")
    .eq("salon_id", user.profile.salon_id)
    .is("deleted_at", null)
    .order("full_name", { ascending: true });

  const openingHours: OpeningHours = isValidOpeningHours(salon.opening_hours)
    ? salon.opening_hours
    : DEFAULT_OPENING_HOURS;

  return (
    <main className="mx-auto max-w-viewport px-5 pb-28 pt-6">
      <CalendarView
        date={date}
        view={view}
        showCancelled={showCancelled}
        staffFilter={staffFilter}
        appointments={appointments}
        appointmentServices={(apptSvcRows ?? []) as AppointmentService[]}
        payments={(paymentRows ?? []) as Payment[]}
        clientsInRange={(clientRows ?? []) as Client[]}
        allClients={(allClientsRows ?? []) as Client[]}
        services={services}
        staff={visibleStaff}
        openingHours={openingHours}
        isAdmin={isAdmin}
      />
    </main>
  );
}
