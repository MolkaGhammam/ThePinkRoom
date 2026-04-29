import { getTranslations } from "next-intl/server";
import { LogoutButton } from "@/components/LogoutButton";
import { SettingsTabs } from "../SettingsTabs";
import { ProfileForm } from "./ProfileForm";
import { PasswordForm } from "./PasswordForm";

export default async function ProfilePage() {
  const t = await getTranslations("settings");
  const tCommon = await getTranslations("common");

  return (
    <main className="mx-auto max-w-viewport px-5 pb-28 pt-6">
      <h1 className="font-serif text-3xl text-ink">{t("title")}</h1>

      <div className="mt-4">
        <SettingsTabs />
      </div>

      <div className="mt-6 flex flex-col gap-4">
        <ProfileForm />
        <PasswordForm />
        <LogoutButton label={tCommon("logout")} />
      </div>
    </main>
  );
}
