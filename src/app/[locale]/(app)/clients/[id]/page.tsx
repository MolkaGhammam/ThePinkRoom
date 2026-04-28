import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import type {
  Appointment,
  AppointmentService,
  Client,
  Payment,
  Service,
  User,
} from "@/types/domain";
import { ClientDetailView } from "./ClientDetailView";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  const supabase = await createClient();

  const { data: client } = await supabase
    .from("clients")
    .select("*")
    .eq("id", id)
    .eq("salon_id", user.profile.salon_id)
    .is("deleted_at", null)
    .maybeSingle();

  if (!client) notFound();

  // Visit history.
  const { data: appointments } = await supabase
    .from("appointments")
    .select("*")
    .eq("client_id", id)
    .is("deleted_at", null)
    .order("start_at", { ascending: false });

  const apptList = (appointments ?? []) as Appointment[];
  const apptIds = apptList.map((a) => a.id);

  let apptServices: AppointmentService[] = [];
  let payments: Payment[] = [];

  if (apptIds.length > 0) {
    const [{ data: svcRows }, { data: payRows }] = await Promise.all([
      supabase.from("appointment_services").select("*").in("appointment_id", apptIds),
      supabase
        .from("payments")
        .select("*")
        .in("appointment_id", apptIds)
        .is("deleted_at", null),
    ]);
    apptServices = (svcRows ?? []) as AppointmentService[];
    payments = (payRows ?? []) as Payment[];
  }

  // Catalog data for the appointment form: active services + active staff.
  const [{ data: serviceRows }, { data: staffRows }] = await Promise.all([
    supabase
      .from("services")
      .select("*")
      .eq("salon_id", user.profile.salon_id)
      .eq("active", true)
      .is("deleted_at", null)
      .order("name", { ascending: true }),
    supabase
      .from("users")
      .select("*")
      .eq("salon_id", user.profile.salon_id)
      .eq("active", true)
      .is("deleted_at", null)
      .order("full_name", { ascending: true }),
  ]);

  return (
    <main className="mx-auto max-w-viewport px-5 pb-28 pt-6">
      <ClientDetailView
        client={client as Client}
        appointments={apptList}
        appointmentServices={apptServices}
        payments={payments}
        services={(serviceRows ?? []) as Service[]}
        staff={(staffRows ?? []) as User[]}
        canDelete={user.profile.role === "admin"}
      />
    </main>
  );
}
