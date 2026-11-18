"use client";

import { CircleCheckIcon, CircleDashedIcon, CircleXIcon } from "lucide-react";
import { useI18n } from "@/hooks/use-i18n";
import { Badge } from "@/components/ui/badge";
import type { ProblemStatusBadgeProps } from "@/types/cp";

// The team's status on one problem in the problem list: Accepted, wrong n times, or not attempted.
export function ProblemStatusBadge({ status }: ProblemStatusBadgeProps) {
  const { t } = useI18n();

  if (status?.solved) {
    return (
      <Badge className="bg-success text-success-foreground">
        <CircleCheckIcon />
        {t("cp.contest.problemStatus.accepted")}
      </Badge>
    );
  }

  if (status && status.wrong > 0) {
    return (
      <Badge variant="destructive">
        <CircleXIcon />
        {t("cp.contest.problemStatus.wrong", { count: status.wrong })}
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="bg-card">
      <CircleDashedIcon />
      {t("cp.contest.problemStatus.notTried")}
    </Badge>
  );
}
