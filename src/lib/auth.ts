import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { User } from "@/types/domain";

export type CurrentUser = {
  authId: string;
  profile: User;
};

// Returns the authenticated user joined with their public.users profile row.
// Throws if called in an unauthenticated context (middleware guards this).
// Signs out and redirects to /login if the profile is deactivated or soft-deleted.
export async function getCurrentUser(): Promise<CurrentUser> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Unauthenticated");
  }

  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    throw new Error("User profile not found");
  }

  if (!profile.active || profile.deleted_at) {
    await supabase.auth.signOut();
    redirect(`/fr/login?error=account_disabled`);
  }

  return { authId: user.id, profile };
}
