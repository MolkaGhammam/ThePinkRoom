"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Button, Card, TextField } from "@kit";
import type { Salon } from "@/types/domain";
import {
  DEFAULT_OPENING_HOURS,
  isValidOpeningHours,
  type OpeningHours,
} from "@/lib/opening-hours";
import { updateSalon } from "./actions";
import { OpeningHoursEditor } from "./OpeningHoursEditor";

export function SalonForm({ salon }: { salon: Salon }) {
  const t = useTranslations("settings.salon");
  const tCommon = useTranslations("common");
  const [pending, startTransition] = useTransition();
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const initialHours = isValidOpeningHours(salon.opening_hours)
    ? salon.opening_hours
    : DEFAULT_OPENING_HOURS;

  const [name, setName] = useState(salon.name);
  const [duration, setDuration] = useState<number>(
    salon.default_appointment_duration_minutes,
  );
  const [hours, setHours] = useState<OpeningHours>(initialHours);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await updateSalon({
        name,
        default_appointment_duration_minutes: duration,
        opening_hours: hours,
      });
      if (result.ok) {
        setSavedAt(Date.now());
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <Card tone="white" padding="lg" elevated>
        <div className="flex flex-col gap-4">
          <h2 className="font-serif text-2xl text-ink">{t("heading")}</h2>

          <TextField
            name="name"
            label={t("name")}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <TextField
            name="duration"
            label={t("defaultDuration")}
            type="number"
            inputMode="numeric"
            min={5}
            max={480}
            step={5}
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value) || 0)}
            required
          />
        </div>
      </Card>

      <OpeningHoursEditor value={hours} onChange={setHours} />

      {error && <p className="text-sm text-pink-fg">{error}</p>}
      {savedAt && !error && (
        <p className="text-sm text-mint-fg" key={savedAt}>
          {t("saved")}
        </p>
      )}

      <Button type="submit" tone="lavender" fullWidth disabled={pending}>
        {pending ? tCommon("loading") : tCommon("save")}
      </Button>
    </form>
  );
}
