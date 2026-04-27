import { useTranslations } from "next-intl";
import Link from "next/link";
import { Button } from "@kit";
import { requestPasswordReset } from "../login/actions";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string }>;
}) {
  const params = await searchParams;
  return <ResetForm sent={!!params.sent} />;
}

function ResetForm({ sent }: { sent: boolean }) {
  const t = useTranslations("auth");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-canvas px-5">
      <div className="w-full max-w-sm">
        <h1 className="mb-2 font-serif text-3xl text-ink">{t("resetPassword")}</h1>
        <p className="mb-8 text-sm text-ink-muted">{t("resetPasswordDescription")}</p>

        {sent ? (
          <div className="rounded-2xl bg-mint px-4 py-3 text-sm text-ink">
            {t("resetLinkSent")}
          </div>
        ) : (
          <form action={requestPasswordReset} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-sm font-medium text-ink-secondary">
                {t("email")}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="h-12 w-full rounded-full border border-line-subtle bg-white px-4 text-sm text-ink outline-none transition focus:border-lavender-solid focus:ring-2 focus:ring-lavender-ring"
              />
            </div>
            <Button type="submit" tone="lavender" size="lg" fullWidth>
              {t("sendResetLink")}
            </Button>
          </form>
        )}

        <div className="mt-6 text-center">
          <Link
            href="../login"
            className="text-sm text-ink-muted underline-offset-2 hover:underline"
          >
            {t("backToLogin")}
          </Link>
        </div>
      </div>
    </main>
  );
}
