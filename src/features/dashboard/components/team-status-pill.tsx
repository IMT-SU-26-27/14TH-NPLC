import { cn } from "@/lib/utils";
import { getT } from "@/lib/i18n/get-dictionary";
import { Badge } from "@/components/ui/badge";
import type { TeamStatusPillProps } from "@/types/registration";

const DOT = {
  pending_payment: "bg-warning",
  under_review: "bg-primary",
  accepted: "bg-highlight shadow-[0_0_6px_var(--highlight)]",
  rejected: "bg-destructive",
} as const;

// Status chip from the 07 design: a small lit dot and the status in mono type.
export function TeamStatusPill({ status, lang }: TeamStatusPillProps) {
  const t = getT(lang);

  return (
    <Badge
      variant="outline"
      className="bg-card/80 border-primary/45 h-6 gap-1.5 rounded-[6px] px-2.5 font-mono text-[11px] tracking-[0.12em] uppercase"
    >
      <span aria-hidden className={cn("size-[7px] rounded-full", DOT[status])} />
      {t(`status.${status}`)}
    </Badge>
  );
}
