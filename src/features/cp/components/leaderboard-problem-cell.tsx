"use client";

import { CircleCheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/hooks/use-i18n";
import type { LeaderboardCellSize, LeaderboardProblemCellProps } from "@/types/cp";

const SIZE: Record<LeaderboardCellSize, { box: string; icon: string; sub: string }> = {
  sm: { box: "min-w-[30px] h-6 text-[11px] leading-3", icon: "size-3.5", sub: "hidden" },
  default: { box: "min-w-[38px] h-[30px] text-xs leading-3.5", icon: "size-3.5", sub: "text-[10px] leading-[11px]" },
  lg: { box: "min-w-14 h-10 text-base leading-[18px]", icon: "size-[18px]", sub: "text-xs leading-[13px]" },
};

// One team on one problem (screen 5): green box with a check (and the wrong tries before it), red tint box with
// the wrong tries, or a dash when not attempted.
export function LeaderboardProblemCell({ status, size = "default" }: LeaderboardProblemCellProps) {
  const { t } = useI18n();
  const look = SIZE[size];
  const box = cn("inline-flex flex-col items-center justify-center rounded-md font-mono font-semibold tabular-nums", look.box);

  if (status?.solved) {
    return (
      <span
        className={cn(box, "bg-success text-success-foreground")}
        role="img"
        aria-label={status.wrong > 0 ? t("cp.contest.cell.solvedAfter", { count: status.wrong }) : t("cp.contest.cell.solved")}
      >
        <CircleCheckIcon className={look.icon} aria-hidden />
        {status.wrong > 0 && (
          <span className={cn("-mt-px font-medium", look.sub)} aria-hidden>
            ×{status.wrong}
          </span>
        )}
      </span>
    );
  }

  if (status && status.wrong > 0) {
    return (
      <span
        className={cn(box, "bg-destructive-soft text-destructive")}
        role="img"
        aria-label={t("cp.contest.cell.wrongOnly", { count: status.wrong })}
      >
        <span aria-hidden>×{status.wrong}</span>
      </span>
    );
  }

  return (
    <span className={cn(box, "text-muted-foreground font-normal")} role="img" aria-label={t("cp.contest.cell.notTried")}>
      <span aria-hidden>–</span>
    </span>
  );
}
