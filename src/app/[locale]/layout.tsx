import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/lib/i18n/routing";
import { fontVariables } from "@/app/layout";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import { ServiceWorkerRegistrar } from "@/components/ServiceWorkerRegistrar";
import { SentryUser } from "@/components/SentryUser";

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as "fr" | "ar")) {
    notFound();
  }

  const messages = await getMessages();
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <html lang={locale} dir={dir} className={fontVariables}>
      <head>
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="theme-color" content="#fdf4f0" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Pink Room" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon-180.png" />
      </head>
      <body className="min-h-screen bg-canvas font-sans text-ink antialiased">
        <NextIntlClientProvider messages={messages}>
          <OfflineIndicator />
          {children}
          <ServiceWorkerRegistrar />
          <SentryUser />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
