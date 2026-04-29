"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Button, Sheet, TextField } from "@kit";
import type { Service } from "@/types/domain";
import { saveService } from "./actions";

interface Props {
  open: boolean;
  onClose: () => void;
  service?: Service | null;
  onSaved: () => void;
}

export function ServiceForm({ open, onClose, service, onSaved }: Props) {
  const t = useTranslations("services");
  const tCommon = useTranslations("common");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(service?.name ?? "");
  const [duration, setDuration] = useState<number>(service?.duration_minutes ?? 60);
  const [price, setPrice] = useState<number>(Number(service?.price ?? 0));

  // Re-seed local state when the editor opens for a different service.
  // Cheap and avoids a full controlled-vs-key dance.
  const seedKey = `${open}:${service?.id ?? "new"}`;
  const [seenKey, setSeenKey] = useState(seedKey);
  if (seenKey !== seedKey) {
    setSeenKey(seedKey);
    setName(service?.name ?? "");
    setDuration(service?.duration_minutes ?? 60);
    setPrice(Number(service?.price ?? 0));
    setError(null);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await saveService({
        id: service?.id,
        name,
        duration_minutes: duration,
        price,
      });
      if (result.ok) {
        onSaved();
        onClose();
      } else {
        const msg =
          result.error === "name_required"
            ? t("nameRequired")
            : result.error === "duration_invalid"
              ? t("durationInvalid")
              : result.error === "price_invalid"
                ? t("priceInvalid")
                : tCommon("error");
        setError(msg);
      }
    });
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={service ? t("editService") : t("newService")}
      footer={
        <Button
          type="submit"
          form="service-form"
          tone="lavender"
          fullWidth
          disabled={pending}
        >
          {pending ? tCommon("loading") : tCommon("save")}
        </Button>
      }
    >
      <form id="service-form" onSubmit={onSubmit} className="flex flex-col gap-4">
        <TextField
          name="name"
          label={t("name")}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoFocus
        />

        <TextField
          name="duration"
          label={t("duration")}
          type="number"
          inputMode="numeric"
          min={5}
          max={480}
          step={5}
          value={duration}
          onChange={(e) => setDuration(Number(e.target.value) || 0)}
          required
        />

        <TextField
          name="price"
          label={t("price")}
          type="number"
          inputMode="numeric"
          min={0}
          step={1}
          value={price}
          onChange={(e) => setPrice(Math.floor(Number(e.target.value) || 0))}
          required
        />

        {error && <p className="text-sm text-pink-fg">{error}</p>}
      </form>
    </Sheet>
  );
}
