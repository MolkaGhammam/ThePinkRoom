import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import type { Client, Appointment, AppointmentService, Payment } from "@/types/domain";
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

  // Visit history — wired now so Phase 5 (appointments) lights it up automatically.
  const { data: appointments } = await supabase
    .from("appointments")
    .select("*")
    .eq("client_id", id)
    .is("deleted_at", null)
    .order("start_at", { ascending: false });

  const apptList = (appointments ?? []) as Appointment[];
  const apptIds = apptList.map((a) => a.id);

  let services: AppointmentService[] = [];
  let payments: Payment[] = [];

  if (apptIds.length > 0) {
    const [{ data: svcRows }, { data: payRows }] = await Promise.all([
      supabase.from("appointment_services").select("*").in("appointment_id", apptIds),
      supabase.from("payments").select("*").in("appointment_id", apptIds).is("deleted_at", null),
    ]);
    services = (svcRows ?? []) as AppointmentService[];
    payments = (payRows ?? []) as Payment[];
  }

  return (
    <main className="mx-auto max-w-viewport px-5 pb-28 pt-6">
      <ClientDetailView
        client={client as Client}
        appointments={apptList}
        appointmentServices={services}
        payments={payments}
        canDelete={user.profile.role === "admin"}
      />
    </main>
  );
}
