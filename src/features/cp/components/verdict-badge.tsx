"use client";

import { useI18n } from "@/hooks/use-i18n";
import { Badge } from "@/components/ui/badge";
import type { VerdictBadgeProps } from "@/types/cp";

export function VerdictBadge({ verdict }: VerdictBadgeProps) {
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
