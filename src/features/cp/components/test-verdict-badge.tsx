"use client";

import { useI18n } from "@/hooks/use-i18n";
import { Badge } from "@/components/ui/badge";
import type { TestVerdictBadgeProps } from "@/types/cp";

// One test case's raw Judge0 verdict, for the admin submission detail and the verdict guide.
export function TestVerdictBadge({ verdict }: TestVerdictBadgeProps) {
  const { t } = useI18n();
  const variant =
    verdict === "accepted"
      ? "default"
      : verdict === "internal_error" || verdict === "exec_format_error"
        ? "outline"
        : verdict === "time_limit_exceeded"
          ? "secondary"
          : "destructive";
  return (
    <Badge variant={variant} className={verdict === "accepted" ? "bg-success text-success-foreground" : undefined}>
      {t(`cp.verdict.${verdict}.title`)}
    </Badge>
  );
}
