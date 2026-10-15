import { Badge } from "@/components/ui/badge";
import type { RegistrationStatusBadgeProps } from "@/types/registration";

const STATUS = {
  pending_payment: { label: "Waiting for payment", variant: "outline" },
  under_review: { label: "Under review", variant: "secondary" },
  accepted: { label: "Accepted", variant: "default" },
  rejected: { label: "Rejected", variant: "destructive" },
} as const;

export function RegistrationStatusBadge({ status }: RegistrationStatusBadgeProps) {
  const { label, variant } = STATUS[status];
  return <Badge variant={variant}>{label}</Badge>;
}
