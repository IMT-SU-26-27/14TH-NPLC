"use client";

import { Trash2Icon } from "lucide-react";
import { adminDeleteRegistration } from "@/lib/actions/admin-registrations";
import { deleteCompetition } from "@/lib/actions/admin-competitions";
import { deleteLoAccount, deleteRallyPost } from "@/lib/actions/admin-rally";
import { useConfirmAction } from "@/hooks/use-confirm-action";
import { useI18n } from "@/hooks/use-i18n";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import type { AdminDeleteButtonProps } from "@/types/admin";

const TARGETS = {
  registration: {
    action: adminDeleteRegistration,
    title: "admin.detail.deleteTitle",
    description: "admin.detail.deleteDescription",
  },
  competition: {
    action: deleteCompetition,
    title: "admin.competitions.deleteTitle",
    description: "admin.competitions.deleteDescription",
  },
  rallyPost: {
    action: deleteRallyPost,
    title: "rally.admin.deletePostTitle",
    description: "rally.admin.deletePostDescription",
  },
  loAccount: {
    action: deleteLoAccount,
    title: "rally.admin.deleteLoTitle",
    description: "rally.admin.deleteLoDescription",
  },
} as const;

export function AdminDeleteButton({ id, label, target }: AdminDeleteButtonProps) {
  const { open, setOpen, pending, run } = useConfirmAction();
  const config = TARGETS[target];
  const { t } = useI18n();

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger render={<Button variant="destructive" />}>
        <Trash2Icon />
        {label}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t(config.title)}</AlertDialogTitle>
          <AlertDialogDescription>{t(config.description)}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>{t("common.cancel")}</AlertDialogCancel>
          <AlertDialogAction variant="destructive" disabled={pending} onClick={() => run(() => config.action(id), "admin.detail.deleted")}>
            {pending && <Spinner />}
            {label}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
