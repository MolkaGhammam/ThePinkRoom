"use client";

import { useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { Button, Card, Sheet, TextField } from "@kit";
import type { Client } from "@/types/domain";
import { findClientByPhone, saveClient } from "./actions";
import { ACQUISITION_CHANNELS } from "./constants";

interface Props {
  open: boolean;
  onClose: () => void;
  client?: Client | null;
  onSaved: (id: string) => void;
}

export function ClientForm({ open, onClose, client, onSaved }: Props) {
  const t = useTranslations("clients");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [duplicate, setDuplicate] = useState<Client | null>(null);
  const [duplicateOverride, setDuplicateOverride] = useState(false);

  const [fullName, setFullName] = useState(client?.full_name ?? "");
  const [phone, setPhone] = useState(client?.phone ?? "");
  const [email, setEmail] = useState(client?.email ?? "");
  const [instagram, setInstagram] = useState(client?.instagram_handle ?? "");
  const [channel, setChannel] = useState(client?.acquisition_channel ?? "");

  const seedKey = `${open}:${client?.id ?? "new"}`;
  const [seenKey, setSeenKey] = useState(seedKey);
  if (seenKey !== seedKey) {
    setSeenKey(seedKey);
    setFullName(client?.full_name ?? "");
    setPhone(client?.phone ?? "");
    setEmail(client?.email ?? "");
    setInstagram(client?.instagram_handle ?? "");
    setChannel(client?.acquisition_channel ?? "");
    setError(null);
    setDuplicate(null);
    setDuplicateOverride(false);
  }

  const isEdit = Boolean(client);

  async function checkDuplicate() {
    if (!phone.trim()) {
      setDuplicate(null);
      return;
    }
    const found = await findClientByPhone(phone);
    if (found && found.id !== client?.id) {
      setDuplicate(found);
      setDuplicateOverride(false);
    } else {
      setDuplicate(null);
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (duplicate && !duplicateOverride) {
      // Block submit until the user explicitly overrides.
      return;
    }

    startTransition(async () => {
      const result = await saveClient({
        id: client?.id,
        full_name: fullName,
        phone,
        email,
        instagram_handle: instagram,
        acquisition_channel: channel || null,
      });
      if (result.ok) {
        onSaved(result.data);
        onClose();
      } else {
        const msg = result.error === "name_required" ? t("nameRequired") : tCommon("error");
        setError(msg);
      }
    });
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={isEdit ? t("editClient") : t("newClient")}
      footer={
        <Button
          type="submit"
          form="client-form"
          tone="lavender"
          fullWidth
          disabled={pending || (Boolean(duplicate) && !duplicateOverride)}
        >
          {pending ? tCommon("loading") : tCommon("save")}
        </Button>
      }
    >
      <form id="client-form" onSubmit={onSubmit} className="flex flex-col gap-4">
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
          name="phone"
          label={t("phone")}
          hint={t("phoneOptional")}
          type="tel"
          autoComplete="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          onBlur={checkDuplicate}
        />

        {duplicate && (
          <Card tone="pink" padding="md">
            <p className="text-sm font-semibold text-pink-fg">{t("duplicateTitle")}</p>
            <p className="mt-1 text-sm text-pink-fg">
              {t("duplicateBody")} {duplicate.full_name}
            </p>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
              <Link
                href={`/${locale}/clients/${duplicate.id}`}
                className="text-sm font-semibold text-pink-fg underline-offset-2 hover:underline"
              >
                {t("duplicateView")}
              </Link>
              {!duplicateOverride && (
                <button
                  type="button"
                  onClick={() => setDuplicateOverride(true)}
                  className="text-sm font-semibold text-pink-fg underline-offset-2 hover:underline"
                >
                  {t("duplicateContinue")}
                </button>
              )}
            </div>
          </Card>
        )}

        <TextField
          name="email"
          label={t("email")}
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <TextField
          name="instagram"
          label={t("instagram")}
          placeholder={t("instagramPlaceholder")}
          value={instagram}
          onChange={(e) => setInstagram(e.target.value)}
        />

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="acquisition_channel"
            className="text-sm font-medium text-ink-secondary"
          >
            {t("acquisitionChannel")}
          </label>
          <select
            id="acquisition_channel"
            name="acquisition_channel"
            value={channel ?? ""}
            onChange={(e) => setChannel(e.target.value)}
            className="h-12 w-full rounded-full border border-line-subtle bg-white px-4 text-sm text-ink outline-none transition focus:border-lavender-solid focus:ring-2 focus:ring-lavender-ring"
          >
            <option value="">—</option>
            {ACQUISITION_CHANNELS.map((c) => (
              <option key={c} value={c}>
                {t(`channels.${c}`)}
              </option>
            ))}
          </select>
        </div>

        {error && <p className="text-sm text-pink-fg">{error}</p>}
      </form>
    </Sheet>
  );
}
