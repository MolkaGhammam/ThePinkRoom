import { useTranslations } from "next-intl";
import { Button } from "@kit";
import { updatePassword } from "../login/actions";

export default async function UpdatePasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  return <UpdateForm error={!!params.error} />;
}

function UpdateForm({ error }: { error: boolean }) {
  const t = useTranslations("auth");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-canvas px-5">
      <div className="w-full max-w-sm">
        <h1 className="mb-8 font-serif text-3xl text-ink">{t("updatePassword")}</h1>

        {error && (
          <div className="mb-6 rounded-2xl bg-pink-soft px-4 py-3 text-sm text-ink">
            {t("error", { ns: "common" })}
          </div>
        )}

        <form action={updatePassword} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-sm font-medium text-ink-secondary">
              {t("newPassword")}
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="new-password"
              minLength={8}
              className="h-12 w-full rounded-full border border-line-subtle bg-white px-4 text-sm text-ink outline-none transition focus:border-lavender-solid focus:ring-2 focus:ring-lavender-ring"
            />
          </div>
          <Button type="submit" tone="lavender" size="lg" fullWidth>
            {t("updatePassword")}
          </Button>
        </form>
      </div>
    </main>
  );
}
