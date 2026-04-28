import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import type { Client } from "@/types/domain";
import { ClientsView } from "./ClientsView";

export default async function ClientsPage() {
  const user = await getCurrentUser();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .eq("salon_id", user.profile.salon_id)
    .is("deleted_at", null)
    .order("full_name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  const clients = (data ?? []) as Client[];

  return (
    <main className="mx-auto max-w-viewport px-5 pb-28 pt-6">
      <ClientsView clients={clients} />
    </main>
  );
}
