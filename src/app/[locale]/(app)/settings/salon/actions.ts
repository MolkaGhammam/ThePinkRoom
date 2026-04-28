"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import type { Result } from "@/lib/result";
import { isValidOpeningHours, type OpeningHours } from "@/lib/opening-hours";

type SalonInput = {
  name: string;
  default_appointment_duration_minutes: number;
  opening_hours: OpeningHours;
};

export async function updateSalon(input: SalonInput): Promise<Result<null>> {
  const user = await getCurrentUser();
  if (user.profile.role !== "admin") {
    return { ok: false, error: "forbidden" };
  }

  const name = input.name.trim();
  if (!name) {
    return { ok: false, error: "name_required" };
  }
  if (
    !Number.isInteger(input.default_appointment_duration_minutes) ||
    input.default_appointment_duration_minutes < 5 ||
    input.default_appointment_duration_minutes > 480
  ) {
    return { ok: false, error: "invalid_duration" };
  }
  if (!isValidOpeningHours(input.opening_hours)) {
    return { ok: false, error: "invalid_opening_hours" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("salons")
    .update({
      name,
      default_appointment_duration_minutes: input.default_appointment_duration_minutes,
      opening_hours: input.opening_hours,
    })
    .eq("id", user.profile.salon_id);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/", "layout");
  return { ok: true, data: null };
}
