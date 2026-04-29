import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import type { Service } from "@/types/domain";
import { ServicesView } from "./ServicesView";

export default async function ServicesPage() {
  const locale = await getLocale();
  const user = await getCurrentUser();
  if (user.profile.role !== "admin") {
    redirect(`/${locale}/settings/profile`);
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("salon_id", user.profile.salon_id)
    .order("active", { ascending: false })
    .order("name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  const services = (data ?? []) as Service[];

  return (
    <main className="mx-auto max-w-viewport px-5 pb-28 pt-6">
      <ServicesView services={services} />
    </main>
  );
}
