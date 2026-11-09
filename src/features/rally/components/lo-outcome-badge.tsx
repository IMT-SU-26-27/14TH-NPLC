"use client";

import { useI18n } from "@/hooks/use-i18n";
import { Badge } from "@/components/ui/badge";
import type { LoOutcomeBadgeProps } from "@/types/rally";

const VARIANT = { win: "default", lose: "secondary", draw: "outline" } as const;

export function LoOutcomeBadge({ outcome, points }: LoOutcomeBadgeProps) {
  const { t } = useI18n();
  return (
    <Badge variant={VARIANT[outcome]}>
      {t(`rally.outcome.${outcome}`)} · {t("rally.lo.points", { points })}
    </Badge>
  );
}
