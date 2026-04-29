"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import type { Result } from "@/lib/result";
import type { AppointmentStatus } from "@/types/domain";
import {
  addMinutesISO,
  canTransitionTo,
  combineDateTimeISO,
  intervalsOverlap,
} from "@/lib/appointments";

export type AppointmentInput = {
  id?: string;
  client_id: string;
  staff_user_id: string;
  date: string; // "YYYY-MM-DD"
  time: string; // "HH:MM"
  service_ids: string[]; // ordered
  notes: string | null;
  override_overlap?: boolean; // admin-only bypass
};

type ServiceRow = {
  id: string;
  duration_minutes: number;
  price: number;
  active: boolean;
};

// Look up overlapping non-cancelled appointments for the same staff member.
// Returns a list of overlapping appointment ids (excluding `excludeId`).
export async function findOverlaps(
  staffUserId: string,
  startISO: string,
  endISO: string,
  excludeId?: string,
): Promise<{ id: string; start_at: string; end_at: string }[]> {
  const user = await getCurrentUser();
  const supabase = await createClient();

  let query = supabase
    .from("appointments")
    .select("id, start_at, end_at")
    .eq("salon_id", user.profile.salon_id)
    .eq("staff_user_id", staffUserId)
    .neq("status", "cancelled")
    .is("deleted_at", null);

  if (excludeId) query = query.neq("id", excludeId);
  const { data } = await query;
  const rows = (data ?? []) as { id: string; start_at: string; end_at: string }[];

  return rows.filter((r) => intervalsOverlap(startISO, endISO, r.start_at, r.end_at));
}

export async function saveAppointment(
  input: AppointmentInput,
): Promise<Result<string>> {
  const user = await getCurrentUser();
  const isAdmin = user.profile.role === "admin";

  // Staff can only schedule for themselves.
  if (!isAdmin && input.staff_user_id !== user.authId) {
    return { ok: false, error: "forbidden" };
  }

  if (!input.client_id) return { ok: false, error: "client_required" };
  if (!input.staff_user_id) return { ok: false, error: "staff_required" };
  if (input.service_ids.length === 0) return { ok: false, error: "no_services" };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date)) {
    return { ok: false, error: "invalid_time" };
  }
  if (!/^\d{2}:\d{2}$/.test(input.time)) {
    return { ok: false, error: "invalid_time" };
  }

  const supabase = await createClient();

  // Pull canonical service rows (price + duration).
  // Use the active list — but for *edits* we need to allow snapshotted services
  // even if they've since been deactivated. Easiest: fetch all matching IDs
  // regardless of `active`, then validate they belong to this salon.
  const { data: svcRows, error: svcErr } = await supabase
    .from("services")
    .select("id, duration_minutes, price, active")
    .in("id", input.service_ids)
    .eq("salon_id", user.profile.salon_id)
    .is("deleted_at", null);

  if (svcErr) return { ok: false, error: svcErr.message };
  const services = (svcRows ?? []) as ServiceRow[];
  if (services.length !== input.service_ids.length) {
    return { ok: false, error: "service_not_found" };
  }

  // For new appointments, all services must be active.
  if (!input.id && services.some((s) => !s.active)) {
    return { ok: false, error: "service_not_found" };
  }

  // Verify the client belongs to this salon and isn't soft-deleted.
  const { data: clientRow } = await supabase
    .from("clients")
    .select("id")
    .eq("id", input.client_id)
    .eq("salon_id", user.profile.salon_id)
    .is("deleted_at", null)
    .maybeSingle();
  if (!clientRow) return { ok: false, error: "client_not_found" };

  // Sum durations in input order.
  const orderMap = new Map(input.service_ids.map((id, idx) => [id, idx]));
  const orderedSvcs = [...services].sort(
    (a, b) => (orderMap.get(a.id) ?? 0) - (orderMap.get(b.id) ?? 0),
  );
  const totalMinutes = orderedSvcs.reduce(
    (sum, s) => sum + Number(s.duration_minutes),
    0,
  );

  const startISO = combineDateTimeISO(input.date, input.time);
  const endISO = addMinutesISO(startISO, totalMinutes);

  // Overlap check.
  const overlaps = await findOverlaps(input.staff_user_id, startISO, endISO, input.id);
  if (overlaps.length > 0) {
    if (!isAdmin || !input.override_overlap) {
      return { ok: false, error: "overlap" };
    }
  }

  if (input.id) {
    // For edit, refuse if the existing appointment is in a terminal state.
    const { data: existing } = await supabase
      .from("appointments")
      .select("status, staff_user_id")
      .eq("id", input.id)
      .single();
    if (!existing) return { ok: false, error: "client_not_found" };
    if (
      existing.status === "completed" ||
      existing.status === "no_show" ||
      existing.status === "cancelled"
    ) {
      return { ok: false, error: "invalid_status_transition" };
    }
    if (!isAdmin && existing.staff_user_id !== user.authId) {
      return { ok: false, error: "forbidden" };
    }

    const { error: updErr } = await supabase
      .from("appointments")
      .update({
        client_id: input.client_id,
        staff_user_id: input.staff_user_id,
        start_at: startISO,
        end_at: endISO,
        notes: input.notes?.trim() || null,
      })
      .eq("id", input.id);
    if (updErr) return { ok: false, error: updErr.message };

    // Replace the appointment_services rows. Cheaper than diffing.
    const { error: delErr } = await supabase
      .from("appointment_services")
      .delete()
      .eq("appointment_id", input.id);
    if (delErr) return { ok: false, error: delErr.message };

    const svcInsert = orderedSvcs.map((s) => ({
      salon_id: user.profile.salon_id,
      appointment_id: input.id!,
      service_id: s.id,
      price_at_booking: s.price,
      duration_at_booking: s.duration_minutes,
    }));
    const { error: svcInsErr } = await supabase
      .from("appointment_services")
      .insert(svcInsert);
    if (svcInsErr) return { ok: false, error: svcInsErr.message };

    revalidatePath("/", "layout");
    return { ok: true, data: input.id };
  }

  // Create.
  const { data: created, error: insErr } = await supabase
    .from("appointments")
    .insert({
      salon_id: user.profile.salon_id,
      client_id: input.client_id,
      staff_user_id: input.staff_user_id,
      start_at: startISO,
      end_at: endISO,
      status: "scheduled",
      notes: input.notes?.trim() || null,
      created_by: user.authId,
    })
    .select("id")
    .single();

  if (insErr || !created) {
    return { ok: false, error: insErr?.message ?? "insert_failed" };
  }

  const svcInsert = orderedSvcs.map((s) => ({
    salon_id: user.profile.salon_id,
    appointment_id: created.id,
    service_id: s.id,
    price_at_booking: s.price,
    duration_at_booking: s.duration_minutes,
  }));
  const { error: svcInsErr } = await supabase
    .from("appointment_services")
    .insert(svcInsert);
  if (svcInsErr) {
    // Best-effort cleanup of the now-orphaned appointment.
    await supabase.from("appointments").delete().eq("id", created.id);
    return { ok: false, error: svcInsErr.message };
  }

  revalidatePath("/", "layout");
  return { ok: true, data: created.id };
}

export async function setAppointmentStatus(
  id: string,
  next: AppointmentStatus,
): Promise<Result<null>> {
  const user = await getCurrentUser();
  const isAdmin = user.profile.role === "admin";

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("appointments")
    .select("status, staff_user_id, salon_id")
    .eq("id", id)
    .single();

  if (!existing) return { ok: false, error: "client_not_found" };
  if (!isAdmin && existing.staff_user_id !== user.authId) {
    return { ok: false, error: "forbidden" };
  }
  if (!canTransitionTo(existing.status, next)) {
    return { ok: false, error: "invalid_status_transition" };
  }

  const { error } = await supabase
    .from("appointments")
    .update({ status: next })
    .eq("id", id);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/", "layout");
  return { ok: true, data: null };
}
