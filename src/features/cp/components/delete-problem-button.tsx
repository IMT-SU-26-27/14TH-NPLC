"use client";

import { Trash2Icon } from "lucide-react";
import { deleteProblem } from "@/lib/actions/admin-cp";
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
import type { DeleteProblemButtonProps } from "@/types/cp";

export function DeleteProblemButton({ problemId }: DeleteProblemButtonProps) {
  const { open, setOpen, pending, run } = useConfirmAction();
  const { t } = useI18n();
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger render={<Button variant="ghost" size="icon-sm" aria-label={t("admin.cp.deleteProblem")} />}>
        <Trash2Icon />
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("admin.cp.deleteTitle")}</AlertDialogTitle>
          <AlertDialogDescription>{t("admin.cp.deleteDescription")}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>{t("common.cancel")}</AlertDialogCancel>
          <AlertDialogAction variant="destructive" disabled={pending} onClick={() => run(() => deleteProblem(problemId), "admin.cp.problemDeleted")}>
            {pending && <Spinner />}
            {t("admin.cp.deleteProblem")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
