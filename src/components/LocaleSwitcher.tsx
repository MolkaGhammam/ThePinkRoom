"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { routing } from "@/lib/i18n/routing";
import { cn } from "@kit";

const LABELS: Record<string, string> = { fr: "FR", ar: "ع" };

export function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function switchLocale(next: string) {
    const segments = pathname.split("/");
    segments[1] = next;
    router.push(segments.join("/"));
  }

  return (
    <div className="flex gap-1">
      {routing.locales.map((l) => (
        <button
          key={l}
          onClick={() => switchLocale(l)}
          className={cn(
            "h-8 w-8 rounded-full text-xs font-semibold transition",
            l === locale
              ? "bg-lavender-solid text-white"
              : "bg-muted text-ink-secondary hover:bg-line-subtle",
          )}
        >
          {LABELS[l]}
        </button>
      ))}
    </div>
  );
}
