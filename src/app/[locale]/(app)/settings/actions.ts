"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Result } from "@/lib/result";

type ProfileInput = {
  full_name: string;
  phone: string | null;
};

export async function updateProfile(input: ProfileInput): Promise<Result<null>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "unauthenticated" };
  }

  const fullName = input.full_name.trim();
  if (!fullName) {
    return { ok: false, error: "name_required" };
  }

  const phone = input.phone?.trim() || null;

  const { error } = await supabase
    .from("users")
    .update({ full_name: fullName, phone })
    .eq("id", user.id);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/", "layout");
  return { ok: true, data: null };
}

export async function changePassword(input: {
  newPassword: string;
}): Promise<Result<null>> {
  const supabase = await createClient();

  if (input.newPassword.length < 8) {
    return { ok: false, error: "password_too_short" };
  }

  const { error } = await supabase.auth.updateUser({ password: input.newPassword });
  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true, data: null };
}
