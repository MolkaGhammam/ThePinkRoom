import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.2,
  beforeSend(event) {
    const PII_KEYS = [
      "full_name", "phone", "email", "instagram_handle",
      "other_socials", "acquisition_channel", "notes",
    ];

    if (event.extra) {
      PII_KEYS.forEach((key) => delete (event.extra as Record<string, unknown>)[key]);
    }

    return event;
  },
});
