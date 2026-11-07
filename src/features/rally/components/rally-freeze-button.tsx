"use client";

import { SnowflakeIcon, SunIcon } from "lucide-react";
import { setRallyLeaderboardFrozen } from "@/lib/actions/admin-rally";
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
import type { RallyFreezeButtonProps } from "@/types/rally";

export function RallyFreezeButton({ competitionId, frozen }: RallyFreezeButtonProps) {
  const { t } = useI18n();
  const { open, setOpen, pending, run } = useConfirmAction();
  const Icon = frozen ? SunIcon : SnowflakeIcon;
  const label = t(frozen ? "rally.leaderboard.unfreeze" : "rally.leaderboard.freeze");

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger render={<Button variant="outline" />}>
        <Icon />
        {label}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t(frozen ? "rally.leaderboard.unfreezeTitle" : "rally.leaderboard.freezeTitle")}</AlertDialogTitle>
          <AlertDialogDescription>{t(frozen ? "rally.leaderboard.unfreezeDescription" : "rally.leaderboard.freezeDescription")}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>{t("common.cancel")}</AlertDialogCancel>
          <AlertDialogAction disabled={pending} onClick={() => run(() => setRallyLeaderboardFrozen(competitionId, !frozen), "rally.leaderboard.frozenDone")}>
            {pending && <Spinner />}
            {label}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
