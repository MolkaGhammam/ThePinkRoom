"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { getCurrentUser } from "@/lib/auth";
import type { Result } from "@/lib/result";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type CreateStaffInput = {
  full_name: string;
  email: string;
  phone: string | null;
  password: string;
};

type UpdateStaffInput = {
  id: string;
  full_name: string;
  phone: string | null;
};

async function requireAdmin() {
  const user = await getCurrentUser();
  if (user.profile.role !== "admin") {
    return { ok: false as const, error: "forbidden" };
  }
  return { ok: true as const, user };
}

export async function createStaff(input: CreateStaffInput): Promise<Result<string>> {
  const gate = await requireAdmin();
  if (!gate.ok) return gate;
  const { user: admin } = gate;

  const fullName = input.full_name.trim();
  const email = input.email.trim().toLowerCase();
  const phone = input.phone?.trim() || null;

  if (!fullName) return { ok: false, error: "name_required" };
  if (!EMAIL_RE.test(email)) return { ok: false, error: "email_invalid" };
  if (input.password.length < 8) return { ok: false, error: "password_too_short" };

  const service = createServiceClient();

  const { data: created, error: createErr } = await service.auth.admin.createUser({
    email,
    password: input.password,
    email_confirm: true,
  });

  if (createErr || !created.user) {
    const code = createErr?.message?.includes("already") ? "email_taken" : "create_failed";
    return { ok: false, error: code };
  }

  // Insert into public.users using the admin's RLS-respecting client.
  const supabase = await createClient();
  const { error: insertErr } = await supabase.from("users").insert({
    id: created.user.id,
    salon_id: admin.profile.salon_id,
    role: "staff",
    full_name: fullName,
    email,
    phone,
  });

  if (insertErr) {
    // Best-effort cleanup of the orphaned auth user.
    await service.auth.admin.deleteUser(created.user.id).catch(() => null);
    return { ok: false, error: insertErr.message };
  }

  revalidatePath("/", "layout");
  return { ok: true, data: created.user.id };
}

export async function updateStaff(input: UpdateStaffInput): Promise<Result<null>> {
  const gate = await requireAdmin();
  if (!gate.ok) return gate;

  const fullName = input.full_name.trim();
  if (!fullName) return { ok: false, error: "name_required" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("users")
    .update({ full_name: fullName, phone: input.phone?.trim() || null })
    .eq("id", input.id);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/", "layout");
  return { ok: true, data: null };
}

export async function setStaffActive(id: string, active: boolean): Promise<Result<null>> {
  const gate = await requireAdmin();
  if (!gate.ok) return gate;

  // Don't let an admin lock themselves out by deactivating their own account.
  if (id === gate.user.authId) {
    return { ok: false, error: "cannot_modify_self" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("users").update({ active }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/", "layout");
  return { ok: true, data: null };
}

export async function deleteStaff(id: string): Promise<Result<null>> {
  const gate = await requireAdmin();
  if (!gate.ok) return gate;

  if (id === gate.user.authId) {
    return { ok: false, error: "cannot_modify_self" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("users")
    .update({ deleted_at: new Date().toISOString(), active: false })
    .eq("id", id);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/", "layout");
  return { ok: true, data: null };
}
