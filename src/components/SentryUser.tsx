import { createClient } from "@/lib/supabase/server";
import { SentryUserBinder } from "./SentryUserBinder";

// Server component: reads the authenticated user (if any) and forwards their
// UUID to the client binder. No-op for unauthenticated requests.
export async function SentryUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return <SentryUserBinder id={user?.id ?? null} />;
}
