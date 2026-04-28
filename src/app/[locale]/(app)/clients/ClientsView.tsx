"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { Card, IconButton } from "@kit";
import type { Client } from "@/types/domain";
import { ClientForm } from "./ClientForm";

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

export function ClientsView({ clients }: { clients: Client[] }) {
  const t = useTranslations("clients");
  const router = useRouter();
  const locale = useLocale();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = normalize(query.trim());
    if (!q) return clients;
    const phoneQ = q.replace(/\s+/g, "");
    return clients.filter((c) => {
      const nameMatch = normalize(c.full_name).includes(q);
      const phoneMatch = c.phone ? c.phone.replace(/\s+/g, "").includes(phoneQ) : false;
      return nameMatch || phoneMatch;
    });
  }, [clients, query]);

  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-serif text-3xl text-ink">{t("title")}</h1>
        <IconButton
          icon={Plus}
          label={t("addClient")}
          tone="lavender"
          size="md"
          onClick={() => setOpen(true)}
        />
      </div>

      <div className="mt-4 flex h-12 items-center gap-3 rounded-full bg-muted px-4">
        <Search className="h-4 w-4 shrink-0 text-ink-secondary" strokeWidth={2.2} />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("search")}
          className="flex-1 bg-transparent text-sm text-ink placeholder:text-ink-muted outline-none"
        />
      </div>

      <div className="mt-6 flex flex-col gap-3">
        {clients.length === 0 ? (
          <Card tone="white" padding="lg" elevated>
            <p className="text-sm font-semibold text-ink">{t("empty")}</p>
            <p className="mt-1 text-sm text-ink-secondary">{t("emptyHint")}</p>
          </Card>
        ) : filtered.length === 0 ? (
          <Card tone="white" padding="lg" elevated>
            <p className="text-sm text-ink-secondary">{t("noResults")}</p>
          </Card>
        ) : (
          filtered.map((c) => (
            <Link
              key={c.id}
              href={`/${locale}/clients/${c.id}`}
              className="block rounded-2xl bg-white p-5 shadow-card transition hover:bg-muted/40"
            >
              <p className="truncate text-base font-semibold text-ink">{c.full_name}</p>
              {c.phone && (
                <p className="mt-1 text-sm text-ink-secondary">{c.phone}</p>
              )}
            </Link>
          ))
        )}
      </div>

      <ClientForm
        open={open}
        onClose={() => setOpen(false)}
        onSaved={(id) => {
          setOpen(false);
          router.push(`/${locale}/clients/${id}`);
        }}
      />
    </>
  );
}
