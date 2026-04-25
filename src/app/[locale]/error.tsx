"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@kit";

export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("common");

  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-canvas px-5">
      <div className="w-full max-w-sm text-center">
        <h1 className="mb-3 font-serif text-3xl text-ink">{t("error")}</h1>
        <p className="mb-8 text-sm text-ink-muted">{error.digest}</p>
        <Button tone="lavender" onClick={reset} fullWidth>
          Réessayer
        </Button>
      </div>
    </main>
  );
}
