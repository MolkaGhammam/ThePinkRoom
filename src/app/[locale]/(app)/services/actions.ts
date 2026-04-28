"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import type { Result } from "@/lib/result";

type ServiceInput = {
  id?: string;
  name: string;
  duration_minutes: number;
  price: number;
};

function validate(input: ServiceInput): string | null {
  if (!input.name.trim()) return "name_required";
  if (
    !Number.isInteger(input.duration_minutes) ||
    input.duration_minutes < 5 ||
    input.duration_minutes > 480
  ) {
    return "duration_invalid";
  }
  if (!Number.isInteger(input.price) || input.price < 0 || input.price > 1_000_000) {
    return "price_invalid";
  }
  return null;
}

export async function saveService(input: ServiceInput): Promise<Result<string>> {
  const user = await getCurrentUser();
  if (user.profile.role !== "admin") {
    return { ok: false, error: "forbidden" };
  }

  const v = validate(input);
  if (v) return { ok: false, error: v };

  const supabase = await createClient();

  if (input.id) {
    const { error } = await supabase
      .from("services")
      .update({
        name: input.name.trim(),
        duration_minutes: input.duration_minutes,
        price: input.price,
      })
      .eq("id", input.id);
    if (error) return { ok: false, error: error.message };
    revalidatePath("/", "layout");
    return { ok: true, data: input.id };
  }

  const { data, error } = await supabase
    .from("services")
    .insert({
      salon_id: user.profile.salon_id,
      name: input.name.trim(),
      duration_minutes: input.duration_minutes,
      price: input.price,
    })
    .select("id")
    .single();

  if (error || !data) return { ok: false, error: error?.message ?? "insert_failed" };
  revalidatePath("/", "layout");
  return { ok: true, data: data.id };
}

export async function setServiceActive(
  id: string,
  active: boolean,
): Promise<Result<null>> {
  const user = await getCurrentUser();
  if (user.profile.role !== "admin") {
    return { ok: false, error: "forbidden" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("services").update({ active }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/", "layout");
  return { ok: true, data: null };
}
