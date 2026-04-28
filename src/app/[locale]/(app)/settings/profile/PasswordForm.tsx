"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Button, Card, TextField } from "@kit";
import { changePassword } from "../actions";

export function PasswordForm() {
  const t = useTranslations("settings.profile");
  const tCommon = useTranslations("common");
  const [pending, startTransition] = useTransition();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 8) {
      setError(t("passwordTooShort"));
      return;
    }
    if (newPassword !== confirmPassword) {
      setError(t("passwordMismatch"));
      return;
    }

    startTransition(async () => {
      const result = await changePassword({ newPassword });
      if (result.ok) {
        setSavedAt(Date.now());
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setError(
          result.error === "password_too_short"
            ? t("passwordTooShort")
            : tCommon("error"),
        );
      }
    });
  }

  return (
    <Card tone="white" padding="lg" elevated>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <h2 className="font-serif text-2xl text-ink">{t("passwordHeading")}</h2>

        <TextField
          name="new_password"
          label={t("newPassword")}
          type="password"
          autoComplete="new-password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />

        <TextField
          name="confirm_password"
          label={t("confirmPassword")}
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        {error && <p className="text-sm text-pink-fg">{error}</p>}
        {savedAt && !error && (
          <p className="text-sm text-mint-fg" key={savedAt}>
            {t("passwordSaved")}
          </p>
        )}

        <Button type="submit" tone="lavender" fullWidth disabled={pending}>
          {pending ? tCommon("loading") : tCommon("save")}
        </Button>
      </form>
    </Card>
  );
}
