"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";
import { Button, Card, ConfirmDialog, IconButton, Tag } from "@kit";
import type { User } from "@/types/domain";
import { useCurrentUser } from "@/components/UserProvider";
import { deleteStaff, setStaffActive } from "./actions";
import { StaffForm } from "./StaffForm";

export function TeamView({ staff }: { staff: User[] }) {
  const t = useTranslations("team");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const me = useCurrentUser();
  const [pending, startTransition] = useTransition();

  const [editing, setEditing] = useState<User | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<User | null>(null);

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(u: User) {
    setEditing(u);
    setFormOpen(true);
  }

  function toggleActive(u: User) {
    startTransition(async () => {
      await setStaffActive(u.id, !u.active);
      router.refresh();
    });
  }

  function confirmDeleteRun() {
    if (!confirmDelete) return;
    const id = confirmDelete.id;
    startTransition(async () => {
      await deleteStaff(id);
      setConfirmDelete(null);
      router.refresh();
    });
  }

  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-serif text-3xl text-ink">{t("title")}</h1>
        <IconButton
          icon={Plus}
          label={t("addStaff")}
          tone="lavender"
          size="md"
          onClick={openCreate}
        />
      </div>

      <div className="mt-6 flex flex-col gap-3">
        {staff.length === 0 ? (
          <Card tone="white" padding="lg" elevated>
            <p className="text-sm font-semibold text-ink">{t("empty")}</p>
            <p className="mt-1 text-sm text-ink-secondary">{t("emptyHint")}</p>
            <div className="mt-4">
              <Button tone="lavender" size="md" onClick={openCreate}>
                {t("addStaff")}
              </Button>
            </div>
          </Card>
        ) : (
          staff.map((u) => {
            const isMe = u.id === me.authId;
            const inactive = !u.active;
            return (
              <Card
                key={u.id}
                tone="white"
                padding="lg"
                elevated
                className={inactive ? "opacity-60" : undefined}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-base font-semibold text-ink">
                        {u.full_name}
                      </p>
                      {inactive && <Tag tone="muted">{t("deactivatedBadge")}</Tag>}
                    </div>
                    {u.email && (
                      <p className="mt-1 truncate text-sm text-ink-secondary">{u.email}</p>
                    )}
                    {u.phone && (
                      <p className="text-sm text-ink-muted">{u.phone}</p>
                    )}
                  </div>
                </div>

                {!isMe && (
                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
                    <button
                      type="button"
                      onClick={() => openEdit(u)}
                      className="text-sm font-medium text-ink underline-offset-2 hover:underline"
                    >
                      {tCommon("edit")}
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleActive(u)}
                      disabled={pending}
                      className="text-sm font-medium text-ink-muted underline-offset-2 hover:underline disabled:opacity-50"
                    >
                      {u.active ? t("deactivate") : t("reactivate")}
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(u)}
                      disabled={pending}
                      className="text-sm font-medium text-pink-fg underline-offset-2 hover:underline disabled:opacity-50"
                    >
                      {t("delete")}
                    </button>
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>

      <StaffForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        staff={editing}
        onSaved={() => router.refresh()}
      />

      <ConfirmDialog
        open={Boolean(confirmDelete)}
        onClose={() => setConfirmDelete(null)}
        onConfirm={confirmDeleteRun}
        title={t("confirmDeleteTitle")}
        description={t("confirmDeleteBody")}
        confirmLabel={t("confirmDelete")}
        cancelLabel={tCommon("cancel")}
        destructive
        pending={pending}
      />
    </>
  );
}
