"use client";

import { RefreshCwIcon } from "lucide-react";
import { regenerateRallyQr } from "@/lib/actions/admin-rally";
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
import type { RallyQrRegenerateButtonProps } from "@/types/rally";

export function RallyQrRegenerateButton({ registrationId }: RallyQrRegenerateButtonProps) {
  const { open, setOpen, pending, run } = useConfirmAction();
  const { t } = useI18n();

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger render={<Button variant="outline" />}>
        <RefreshCwIcon />
        {t("rally.team.regenerate")}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("rally.team.regenerateTitle")}</AlertDialogTitle>
          <AlertDialogDescription>{t("rally.team.regenerateDescription")}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>{t("common.cancel")}</AlertDialogCancel>
          <AlertDialogAction disabled={pending} onClick={() => run(() => regenerateRallyQr(registrationId), "rally.team.regenerated")}>
            {pending && <Spinner />}
            {t("rally.team.regenerate")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
