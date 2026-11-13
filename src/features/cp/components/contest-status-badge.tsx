"use client";

import type { ComponentProps } from "react";
import { BanIcon } from "lucide-react";
import { useI18n } from "@/hooks/use-i18n";
import { Badge } from "@/components/ui/badge";
import type { ContestBarStatus, ContestStatusBadgeProps } from "@/types/cp";

const VARIANT: Record<ContestBarStatus, ComponentProps<typeof Badge>["variant"]> = {
  live: "outline",
  paused: "secondary",
  ended: "secondary",
  disqualified: "destructive",
  scheduled: "outline",
  unscheduled: "outline",
};

// The contest bar's status: live carries the lime dot, paused and time-up are secondary, disqualified is red tint.
export function ContestStatusBadge({ status }: ContestStatusBadgeProps) {
  const { t } = useI18n();
  return (
    <Badge variant={VARIANT[status]} className={VARIANT[status] === "outline" ? "bg-card" : undefined}>
      {status === "live" && <span aria-hidden className="bg-highlight ring-highlight-foreground size-[7px] rounded-full ring-1" />}
      {status === "disqualified" && <BanIcon />}
      {t(`cp.contest.status.${status}`)}
    </Badge>
  );
}
