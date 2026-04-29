"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export function SentryUserBinder({ id }: { id: string | null }) {
  useEffect(() => {
    if (id) {
      Sentry.setUser({ id });
    } else {
      Sentry.setUser(null);
    }
  }, [id]);

  return null;
}
