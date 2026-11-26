"use client";

import { RotateCcwIcon } from "lucide-react";
import { resetTeamDevice } from "@/lib/actions/team-device";
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
import type { TeamDeviceResetButtonProps } from "@/types/team-device";

export function TeamDeviceResetButton({ registrationId, teamName }: TeamDeviceResetButtonProps) {
  const { open, setOpen, pending, run } = useConfirmAction();
  const { t } = useI18n();

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger render={<Button variant="outline" size="sm" />}>
        <RotateCcwIcon />
        {t("admin.devices.reset")}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("admin.devices.resetTitle", { team: teamName })}</AlertDialogTitle>
          <AlertDialogDescription>{t("admin.devices.resetDescription")}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>{t("common.cancel")}</AlertDialogCancel>
          <AlertDialogAction disabled={pending} onClick={() => run(() => resetTeamDevice(registrationId), "admin.devices.resetDone")}>
            {pending && <Spinner />}
            {t("admin.devices.reset")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
