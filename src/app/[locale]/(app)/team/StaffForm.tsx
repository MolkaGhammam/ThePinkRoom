"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Button, Sheet, TextField } from "@kit";
import type { User } from "@/types/domain";
import { createStaff, updateStaff } from "./actions";

interface Props {
  open: boolean;
  onClose: () => void;
  staff?: User | null;
  onSaved: () => void;
}

export function StaffForm({ open, onClose, staff, onSaved }: Props) {
  const t = useTranslations("team");
  const tCommon = useTranslations("common");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [fullName, setFullName] = useState(staff?.full_name ?? "");
  const [email, setEmail] = useState(staff?.email ?? "");
  const [phone, setPhone] = useState(staff?.phone ?? "");
  const [password, setPassword] = useState("");

  const seedKey = `${open}:${staff?.id ?? "new"}`;
  const [seenKey, setSeenKey] = useState(seedKey);
  if (seenKey !== seedKey) {
    setSeenKey(seedKey);
    setFullName(staff?.full_name ?? "");
    setEmail(staff?.email ?? "");
    setPhone(staff?.phone ?? "");
    setPassword("");
    setError(null);
  }

  const isEdit = Boolean(staff);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = isEdit
        ? await updateStaff({ id: staff!.id, full_name: fullName, phone })
        : await createStaff({ full_name: fullName, email, phone, password });

      if (result.ok) {
        onSaved();
        onClose();
      } else {
        const map: Record<string, string> = {
          name_required: t("nameRequired"),
          email_invalid: t("emailInvalid"),
          password_too_short: t("passwordTooShort"),
          email_taken: t("emailTaken"),
          create_failed: t("createFailed"),
        };
        setError(map[result.error] ?? tCommon("error"));
      }
    });
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={isEdit ? t("editStaff") : t("newStaff")}
      footer={
        <Button
          type="submit"
          form="staff-form"
          tone="lavender"
          fullWidth
          disabled={pending}
        >
          {pending ? tCommon("loading") : tCommon("save")}
        </Button>
      }
    >
      <form id="staff-form" onSubmit={onSubmit} className="flex flex-col gap-4">
        <TextField
          name="full_name"
          label={t("fullName")}
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          autoFocus
          autoComplete="name"
        />

        <TextField
          name="email"
          label={t("email")}
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isEdit}
          readOnly={isEdit}
        />

        <TextField
          name="phone"
          label={t("phone")}
          hint={t("phoneOptional")}
          type="tel"
          autoComplete="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        {!isEdit && (
          <TextField
            name="password"
            label={t("tempPassword")}
            hint={t("tempPasswordHint")}
            type="text"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        )}

        {error && <p className="text-sm text-pink-fg">{error}</p>}
      </form>
    </Sheet>
  );
}
