"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";

export async function signIn(formData: FormData) {
  const supabase = await createClient();
  const locale = await getLocale();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/${locale}/login?error=invalid_credentials`);
  }

  redirect(`/${locale}`);
}

export async function signOut() {
  const supabase = await createClient();
  const locale = await getLocale();

  await supabase.auth.signOut();
  redirect(`/${locale}/login`);
}

export async function requestPasswordReset(formData: FormData) {
  const supabase = await createClient();
  const locale = await getLocale();

  const email = formData.get("email") as string;
  const redirectTo = `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/${locale}/update-password`;

  await supabase.auth.resetPasswordForEmail(email, { redirectTo });

  redirect(`/${locale}/reset-password?sent=1`);
}

export async function updatePassword(formData: FormData) {
  const supabase = await createClient();
  const locale = await getLocale();

  const password = formData.get("password") as string;

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    redirect(`/${locale}/update-password?error=1`);
  }

  await supabase.auth.signOut();
  redirect(`/${locale}/login?updated=1`);
}
