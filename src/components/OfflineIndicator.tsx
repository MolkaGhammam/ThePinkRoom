"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { WifiOff } from "lucide-react";
import { cn } from "@kit";

export function OfflineIndicator() {
  const t = useTranslations("common");
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    setOffline(!navigator.onLine);
    const on = () => setOffline(false);
    const off = () => setOffline(true);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  return (
    <div
      className={cn(
        "fixed inset-x-0 top-0 z-50 flex items-center justify-center gap-2 bg-inverse px-4 py-2 text-sm font-medium text-white transition-transform duration-300",
        offline ? "translate-y-0" : "-translate-y-full",
      )}
      role="status"
      aria-live="polite"
    >
      <WifiOff className="h-4 w-4" />
      {t("offline")}
    </div>
  );
}
