"use client";

import { SnowflakeIcon, SunIcon } from "lucide-react";
import { setLeaderboardFrozen } from "@/lib/actions/admin-cp";
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
import type { LeaderboardFreezeButtonProps } from "@/types/cp";

export function LeaderboardFreezeButton({ competitionId, frozen }: LeaderboardFreezeButtonProps) {
  const { t } = useI18n();
  const confirm = useConfirmAction();
  const Icon = frozen ? SunIcon : SnowflakeIcon;
  const label = frozen ? t("admin.cp.unfreeze") : t("admin.cp.freeze");

  return (
    <AlertDialog open={confirm.open} onOpenChange={confirm.setOpen}>
      <AlertDialogTrigger render={<Button variant="outline" size="sm" />}>
        <Icon />
        {label}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{frozen ? t("admin.cp.unfreezeTitle") : t("admin.cp.freezeTitle")}</AlertDialogTitle>
          <AlertDialogDescription>{frozen ? t("admin.cp.unfreezeDescription") : t("admin.cp.freezeDescription")}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={confirm.pending}>{t("common.cancel")}</AlertDialogCancel>
          <AlertDialogAction
            disabled={confirm.pending}
            onClick={() => confirm.run(() => setLeaderboardFrozen(competitionId, !frozen), frozen ? "admin.cp.leaderboardUnfrozenDone" : "admin.cp.leaderboardFrozenDone")}
          >
            {confirm.pending && <Spinner />}
            {label}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
