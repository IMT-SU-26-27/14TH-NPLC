"use client";

import { useI18n } from "@/hooks/use-i18n";
import { Badge } from "@/components/ui/badge";
import type { RegistrationStatusBadgeProps } from "@/types/registration";

const VARIANT = {
  pending_payment: "outline",
  under_review: "secondary",
  accepted: "default",
  rejected: "destructive",
} as const;

export function RegistrationStatusBadge({ status }: RegistrationStatusBadgeProps) {
  const { t } = useI18n();
  return (
    <Badge variant={VARIANT[status]} className={status === "accepted" ? "bg-success text-success-foreground" : undefined}>
      {t(`status.${status}`)}
    </Badge>
  );
}
