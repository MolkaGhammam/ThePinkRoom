import { useTranslations } from "next-intl";
import Link from "next/link";
import { Button } from "@kit";
import { signIn } from "./actions";

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; updated?: string }>;
}) {
  return <LoginContent searchParams={searchParams} />;
}

async function LoginContent({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; updated?: string }>;
}) {
  const params = await searchParams;
  return <LoginForm error={params.error} updated={params.updated} />;
}

function LoginForm({ error, updated }: { error?: string; updated?: string }) {
  const t = useTranslations("auth");
  const tCommon = useTranslations("common");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-canvas px-5">
      <div className="w-full max-w-sm">
        {/* Logo / brand */}
        <div className="mb-10 text-center">
          <h1 className="font-serif text-4xl text-ink">{tCommon("appName")}</h1>
        </div>

        {/* Success banner */}
        {updated && (
          <div className="mb-6 rounded-2xl bg-mint px-4 py-3 text-sm text-ink">
            {t("passwordUpdated")}
          </div>
        )}

        {/* Error banner */}
        {error && (
          <div className="mb-6 rounded-2xl bg-pink-soft px-4 py-3 text-sm text-ink">
            {t("invalidCredentials")}
          </div>
        )}

        <form action={signIn} className="flex flex-col gap-4">
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

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-sm font-medium text-ink-secondary">
              {t("password")}
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="h-12 w-full rounded-full border border-line-subtle bg-white px-4 text-sm text-ink outline-none transition focus:border-lavender-solid focus:ring-2 focus:ring-lavender-ring"
            />
          </div>

          <Button type="submit" tone="lavender" size="lg" fullWidth>
            {t("login")}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Link
            href="./reset-password"
            className="text-sm text-ink-muted underline-offset-2 hover:underline"
          >
            {t("forgotPassword")}
          </Link>
        </div>
      </div>
    </main>
  );
}
