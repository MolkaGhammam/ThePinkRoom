import { useTranslations } from "next-intl";
import { getCurrentUser } from "@/lib/auth";
import { TopBar } from "@kit";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { LogoutButton } from "@/components/LogoutButton";

export default async function HomePage() {
  const { profile } = await getCurrentUser();
  return <HomeContent name={profile.full_name} role={profile.role} />;
}

function HomeContent({ name, role }: { name: string; role: string }) {
  const t = useTranslations("home");
  const tCommon = useTranslations("common");

  return (
    <main className="mx-auto max-w-viewport px-5 pb-28 pt-6">
      <TopBar
        variant="greeting"
        greeting={`${t("greeting")}, ${name}`}
        subGreeting={t("tagline")}
        right={<LocaleSwitcher />}
      />

      <div className="mt-8 rounded-2xl bg-white p-5 shadow-card">
        <p className="text-sm text-ink-secondary">
          {tCommon("appName")} · {role}
        </p>
      </div>

      <div className="mt-4">
        <LogoutButton label={tCommon("logout")} />
      </div>
    </main>
  );
}
