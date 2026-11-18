"use client";

import { CircleCheckIcon, CircleXIcon } from "lucide-react";
import { useI18n } from "@/hooks/use-i18n";
import type { ProblemStatusCellProps } from "@/types/cp";

// One team on one problem: solved (with any wrong tries), only wrong tries, or not tried.
export function ProblemStatusCell({ status }: ProblemStatusCellProps) {
  const { t } = useI18n();

  if (!status) {
    return (
      <span className="text-muted-foreground" aria-label={t("cp.problemNotTried")}>
        –
      </span>
    );
  }

  if (status.solved) {
    return (
      <span
        className="text-success inline-flex items-center justify-center gap-1"
        aria-label={status.wrong > 0 ? t("cp.problemSolvedAfter", { count: status.wrong }) : t("cp.problemSolved")}
      >
        <CircleCheckIcon className="size-4" aria-hidden />
        {status.wrong > 0 && <span className="text-muted-foreground font-mono text-xs">{status.wrong}×</span>}
      </span>
    );
  }

  return (
    <span
      className="text-destructive inline-flex items-center justify-center gap-1"
      aria-label={t("cp.problemWrongOnly", { count: status.wrong })}
    >
      <CircleXIcon className="size-4" aria-hidden />
      <span className="font-mono text-xs">{status.wrong}×</span>
    </span>
  );
}
