"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { CalendarDays, Scissors, Settings, UserCog, Users } from "lucide-react";
import { BottomTabBar, type BottomTab } from "@kit";
import { useCurrentUser } from "./UserProvider";

type TabKey = "calendar" | "clients" | "services" | "team" | "settings";

const ALL_TABS: { key: TabKey; icon: BottomTab["icon"]; adminOnly?: boolean }[] = [
  { key: "calendar", icon: CalendarDays },
  { key: "clients", icon: Users },
  { key: "services", icon: Scissors, adminOnly: true },
  { key: "team", icon: UserCog, adminOnly: true },
  { key: "settings", icon: Settings },
];

function activeTabFromPath(pathname: string): TabKey {
  // Strip the locale segment, then look at the first app segment.
  const segments = pathname.split("/").filter(Boolean);
  const seg = segments[1] ?? "settings";
  if (seg === "calendar") return "calendar";
  if (seg === "clients") return "clients";
  if (seg === "services") return "services";
  if (seg === "team") return "team";
  return "settings";
}

export function AppBottomTabBar() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const user = useCurrentUser();

  const tabs: BottomTab[] = ALL_TABS.filter(
    (tab) => !tab.adminOnly || user.profile.role === "admin",
  ).map((tab) => ({ key: tab.key, icon: tab.icon, label: t(tab.key) }));

  const active = activeTabFromPath(pathname);

  function go(key: string) {
    if (key === "settings") {
      router.push(`/${locale}/settings/profile`);
    } else {
      router.push(`/${locale}/${key}`);
    }
  }

  return <BottomTabBar tabs={tabs} active={active} onChange={go} />;
}
