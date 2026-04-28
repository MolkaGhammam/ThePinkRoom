"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { SegmentedToggle, type SegmentedToggleOption } from "@kit";
import { useCurrentUser } from "@/components/UserProvider";

export function SettingsTabs() {
  const t = useTranslations("settings");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const user = useCurrentUser();

  if (user.profile.role !== "admin") return null;

  const active = pathname.includes("/settings/salon") ? "salon" : "profile";

  const options: [SegmentedToggleOption, SegmentedToggleOption] = [
    { value: "profile", label: t("profileTab") },
    { value: "salon", label: t("salonTab") },
  ];

  function go(value: string) {
    router.push(`/${locale}/settings/${value}`);
  }

  return <SegmentedToggle options={options} value={active} onChange={go} />;
}
