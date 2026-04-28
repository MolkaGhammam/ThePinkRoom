"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";
import { Button, Card, IconButton, SegmentedToggle, type SegmentedToggleOption } from "@kit";
import type { Service } from "@/types/domain";
import { setServiceActive } from "./actions";
import { ServiceForm } from "./ServiceForm";

export function ServicesView({ services }: { services: Service[] }) {
  const t = useTranslations("services");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [showInactive, setShowInactive] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [open, setOpen] = useState(false);

  const filtered = useMemo(
    () => services.filter((s) => (showInactive ? !s.active : s.active)),
    [services, showInactive],
  );

  function openCreate() {
    setEditing(null);
    setOpen(true);
  }

  function openEdit(service: Service) {
    setEditing(service);
    setOpen(true);
  }

  function toggleActive(service: Service) {
    startTransition(async () => {
      await setServiceActive(service.id, !service.active);
      router.refresh();
    });
  }

  const filterOptions: [SegmentedToggleOption, SegmentedToggleOption] = [
    { value: "active", label: t("active") },
    { value: "inactive", label: t("inactive") },
  ];

  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-serif text-3xl text-ink">{t("title")}</h1>
        <IconButton
          icon={Plus}
          label={t("addService")}
          tone="lavender"
          size="md"
          onClick={openCreate}
        />
      </div>

      <div className="mt-4">
        <SegmentedToggle
          options={filterOptions}
          value={showInactive ? "inactive" : "active"}
          onChange={(v) => setShowInactive(v === "inactive")}
        />
      </div>

      <div className="mt-6 flex flex-col gap-3">
        {filtered.length === 0 ? (
          <Card tone="white" padding="lg" elevated>
            <p className="text-sm font-semibold text-ink">{t("empty")}</p>
            <p className="mt-1 text-sm text-ink-secondary">{t("emptyHint")}</p>
            {!showInactive && (
              <div className="mt-4">
                <Button tone="lavender" size="md" onClick={openCreate}>
                  {t("addService")}
                </Button>
              </div>
            )}
          </Card>
        ) : (
          filtered.map((service) => (
            <Card key={service.id} tone="white" padding="lg" elevated>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-base font-semibold text-ink">{service.name}</p>
                  <p className="mt-1 text-sm text-ink-secondary">
                    {service.duration_minutes} {t("minutes")} · {Math.round(Number(service.price))}{" "}
                    {t("tnd")}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {service.active ? (
                    <>
                      <button
                        type="button"
                        onClick={() => openEdit(service)}
                        className="text-sm font-medium text-ink underline-offset-2 hover:underline"
                      >
                        {tCommon("edit")}
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleActive(service)}
                        disabled={pending}
                        className="text-sm font-medium text-ink-muted underline-offset-2 hover:underline disabled:opacity-50"
                      >
                        {t("deactivate")}
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => toggleActive(service)}
                      disabled={pending}
                      className="text-sm font-medium text-lavender-solid underline-offset-2 hover:underline disabled:opacity-50"
                    >
                      {t("reactivate")}
                    </button>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      <ServiceForm
        open={open}
        onClose={() => setOpen(false)}
        service={editing}
        onSaved={() => router.refresh()}
      />
    </>
  );
}
