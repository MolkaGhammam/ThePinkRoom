"use client";

import { signOut } from "@/app/[locale]/login/actions";
import { Button } from "@kit";

export function LogoutButton({ label }: { label: string }) {
  return (
    <form action={signOut}>
      <Button type="submit" tone="white" size="md" fullWidth>
        {label}
      </Button>
    </form>
  );
}
