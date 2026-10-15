"use client";

import { Trash2Icon } from "lucide-react";
import { deleteTimelineEvent } from "@/lib/actions/admin-content";
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
import type { DeleteTimelineEventButtonProps } from "@/types/content";

export function DeleteTimelineEventButton({ eventId }: DeleteTimelineEventButtonProps) {
  const { open, setOpen, pending, run } = useConfirmAction();
  const { t } = useI18n();

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger render={<Button variant="ghost" size="icon-sm" aria-label={t("admin.content.deleteEvent")} />}>
        <Trash2Icon />
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("admin.content.deleteEventTitle")}</AlertDialogTitle>
          <AlertDialogDescription>{t("admin.content.deleteEventDescription")}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>{t("common.cancel")}</AlertDialogCancel>
          <AlertDialogAction variant="destructive" disabled={pending} onClick={() => run(() => deleteTimelineEvent(eventId), "admin.content.eventDeleted")}>
            {pending && <Spinner />}
            {t("admin.content.deleteEvent")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
