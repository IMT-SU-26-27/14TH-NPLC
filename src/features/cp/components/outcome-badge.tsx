"use client";

import { useI18n } from "@/hooks/use-i18n";
import { submissionOutcome } from "@/lib/cp/outcome";
import { Badge } from "@/components/ui/badge";
import type { OutcomeBadgeProps } from "@/types/cp";

// One submission's response, worded as in the guidebook ("Yes - Accepted", "No - Wrong Answer", ...).
export function OutcomeBadge({ verdict, alreadySolved }: OutcomeBadgeProps) {
  const { t } = useI18n();
  const outcome = submissionOutcome(verdict, alreadySolved);
  const passed = outcome === "accepted" || outcome === "solved";
  return (
    <Badge
      variant={passed ? "default" : outcome === "judgeError" ? "outline" : "destructive"}
      className={passed ? "bg-success text-success-foreground" : undefined}
    >
      {t(`cp.outcome.${outcome}`)}
    </Badge>
  );
}
