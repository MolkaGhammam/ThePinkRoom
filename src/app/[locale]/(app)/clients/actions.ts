"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import type { Result } from "@/lib/result";
import type { Client } from "@/types/domain";
import { ACQUISITION_CHANNELS } from "./constants";

export type ClientInput = {
  id?: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  instagram_handle: string | null;
  acquisition_channel: string | null;
};

function normalizePhone(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const t = raw.replace(/\s+/g, "").trim();
  return t || null;
}

function normalizeInstagram(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const t = raw.trim().replace(/^@/, "");
  return t || null;
}

export async function findClientByPhone(phone: string): Promise<Client | null> {
  const user = await getCurrentUser();
  const normalized = normalizePhone(phone);
  if (!normalized) return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from("clients")
    .select("*")
    .eq("salon_id", user.profile.salon_id)
    .eq("phone", normalized)
    .is("deleted_at", null)
    .maybeSingle();

  return (data as Client | null) ?? null;
}

export async function saveClient(input: ClientInput): Promise<Result<string>> {
  const user = await getCurrentUser();

  const fullName = input.full_name.trim();
  if (!fullName) return { ok: false, error: "name_required" };

  const phone = normalizePhone(input.phone);
  const email = input.email?.trim().toLowerCase() || null;
  const instagram = normalizeInstagram(input.instagram_handle);
  const channel =
    input.acquisition_channel &&
    (ACQUISITION_CHANNELS as readonly string[]).includes(input.acquisition_channel)
      ? input.acquisition_channel
      : null;

  const supabase = await createClient();

  if (input.id) {
    const { error } = await supabase
      .from("clients")
      .update({
        full_name: fullName,
        phone,
        email,
        instagram_handle: instagram,
        acquisition_channel: channel,
      })
      .eq("id", input.id);
    if (error) return { ok: false, error: error.message };
    revalidatePath("/", "layout");
    return { ok: true, data: input.id };
  }

  const { data, error } = await supabase
    .from("clients")
    .insert({
      salon_id: user.profile.salon_id,
      full_name: fullName,
      phone,
      email,
      instagram_handle: instagram,
      acquisition_channel: channel,
    })
    .select("id")
    .single();

  if (error || !data) return { ok: false, error: error?.message ?? "insert_failed" };
  revalidatePath("/", "layout");
  return { ok: true, data: data.id };
}

export async function deleteClient(id: string): Promise<Result<null>> {
  const user = await getCurrentUser();
  if (user.profile.role !== "admin") {
    return { ok: false, error: "forbidden" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("clients")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/", "layout");
  return { ok: true, data: null };
}
