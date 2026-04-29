"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import type { Result } from "@/lib/result";
import type { PaymentMethod } from "@/types/domain";

export type PaymentInput = {
  id?: string;
  appointment_id: string;
  amount: number;
  method: PaymentMethod;
  notes: string | null;
};

const METHODS = ["cash", "card", "transfer", "other"] as const;

function validate(input: PaymentInput): string | null {
  if (!Number.isInteger(input.amount) || input.amount <= 0 || input.amount > 1_000_000) {
    return "amount_invalid";
  }
  if (!(METHODS as readonly string[]).includes(input.method)) {
    return "amount_invalid";
  }
  return null;
}

export async function createPayment(input: PaymentInput): Promise<Result<string>> {
  const user = await getCurrentUser();

  const v = validate(input);
  if (v) return { ok: false, error: v };

  const supabase = await createClient();

  // Verify the appointment exists in this salon and (for staff) is owned by them.
  const { data: appt } = await supabase
    .from("appointments")
    .select("id, salon_id, staff_user_id")
    .eq("id", input.appointment_id)
    .eq("salon_id", user.profile.salon_id)
    .is("deleted_at", null)
    .maybeSingle();

  if (!appt) return { ok: false, error: "appointment_not_found" };

  const isAdmin = user.profile.role === "admin";
  if (!isAdmin && appt.staff_user_id !== user.authId) {
    return { ok: false, error: "forbidden" };
  }

  const { data, error } = await supabase
    .from("payments")
    .insert({
      salon_id: user.profile.salon_id,
      appointment_id: input.appointment_id,
      amount: input.amount,
      method: input.method,
      status: "paid",
      notes: input.notes?.trim() || null,
      created_by: user.authId,
    })
    .select("id")
    .single();

  if (error || !data) return { ok: false, error: error?.message ?? "insert_failed" };
  revalidatePath("/", "layout");
  return { ok: true, data: data.id };
}

export async function updatePayment(input: PaymentInput): Promise<Result<null>> {
  const user = await getCurrentUser();
  if (user.profile.role !== "admin") {
    return { ok: false, error: "forbidden" };
  }
  if (!input.id) return { ok: false, error: "amount_invalid" };

  const v = validate(input);
  if (v) return { ok: false, error: v };

  const supabase = await createClient();
  const { error } = await supabase
    .from("payments")
    .update({
      amount: input.amount,
      method: input.method,
      notes: input.notes?.trim() || null,
    })
    .eq("id", input.id);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/", "layout");
  return { ok: true, data: null };
}

// Refund creates a NEW row with status='refunded' for the same amount + method.
// Per spec §6.8 the badge is derived from the net of paid - refunded.
export async function refundPayment(paymentId: string): Promise<Result<string>> {
  const user = await getCurrentUser();
  if (user.profile.role !== "admin") {
    return { ok: false, error: "forbidden" };
  }

  const supabase = await createClient();
  const { data: original } = await supabase
    .from("payments")
    .select("*")
    .eq("id", paymentId)
    .is("deleted_at", null)
    .maybeSingle();

  if (!original) return { ok: false, error: "appointment_not_found" };
  if (original.status !== "paid") {
    return { ok: false, error: "amount_invalid" };
  }

  const { data, error } = await supabase
    .from("payments")
    .insert({
      salon_id: original.salon_id,
      appointment_id: original.appointment_id,
      amount: original.amount,
      method: original.method,
      status: "refunded",
      notes: original.notes,
      created_by: user.authId,
    })
    .select("id")
    .single();

  if (error || !data) return { ok: false, error: error?.message ?? "insert_failed" };
  revalidatePath("/", "layout");
  return { ok: true, data: data.id };
}

export async function deletePayment(paymentId: string): Promise<Result<null>> {
  const user = await getCurrentUser();
  if (user.profile.role !== "admin") {
    return { ok: false, error: "forbidden" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("payments")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", paymentId);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/", "layout");
  return { ok: true, data: null };
}
