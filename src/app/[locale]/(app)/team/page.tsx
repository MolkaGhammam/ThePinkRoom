import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import type { User } from "@/types/domain";
import { TeamView } from "./TeamView";

export default async function TeamPage() {
  const locale = await getLocale();
  const user = await getCurrentUser();
  if (user.profile.role !== "admin") {
    redirect(`/${locale}/settings/profile`);
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("salon_id", user.profile.salon_id)
    .is("deleted_at", null)
    .order("active", { ascending: false })
    .order("full_name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  const staff = (data ?? []) as User[];

  return (
    <main className="mx-auto max-w-viewport px-5 pb-28 pt-6">
      <TeamView staff={staff} />
    </main>
  );
}
