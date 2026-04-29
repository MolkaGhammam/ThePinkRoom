import { redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import type { Salon } from "@/types/domain";
import { SettingsTabs } from "../SettingsTabs";
import { SalonForm } from "./SalonForm";

export default async function SalonSettingsPage() {
  const locale = await getLocale();
  const user = await getCurrentUser();
  if (user.profile.role !== "admin") {
    redirect(`/${locale}/settings/profile`);
  }

  const supabase = await createClient();
  const { data: salon, error } = await supabase
    .from("salons")
    .select("*")
    .eq("id", user.profile.salon_id)
    .single();

  if (error || !salon) {
    throw new Error("Salon not found");
  }

  const t = await getTranslations("settings");

  return (
    <main className="mx-auto max-w-viewport px-5 pb-28 pt-6">
      <h1 className="font-serif text-3xl text-ink">{t("title")}</h1>

      <div className="mt-4">
        <SettingsTabs />
      </div>

      <div className="mt-6">
        <SalonForm salon={salon as Salon} />
      </div>
    </main>
  );
}
