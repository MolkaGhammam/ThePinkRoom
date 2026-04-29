"use client";

import { useTransition, useState } from "react";
import { useTranslations } from "next-intl";
import { Button, Card, TextField } from "@kit";
import { useCurrentUser } from "@/components/UserProvider";
import { updateProfile } from "../actions";

export function ProfileForm() {
  const t = useTranslations("settings.profile");
  const tCommon = useTranslations("common");
  const user = useCurrentUser();
  const [pending, startTransition] = useTransition();
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fullName, setFullName] = useState(user.profile.full_name);
  const [phone, setPhone] = useState(user.profile.phone ?? "");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await updateProfile({ full_name: fullName, phone });
      if (result.ok) {
        setSavedAt(Date.now());
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <Card tone="white" padding="lg" elevated>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <h2 className="font-serif text-2xl text-ink">{t("heading")}</h2>

        <TextField
          name="full_name"
          label={t("fullName")}
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          autoComplete="name"
        />

        <TextField
          name="phone"
          label={t("phone")}
          hint={t("phoneOptional")}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          type="tel"
          autoComplete="tel"
        />

        <TextField
          name="email"
          label={t("email")}
          hint={t("emailReadOnly")}
          value={user.profile.email ?? ""}
          disabled
          readOnly
        />

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
    </Card>
  );
}
