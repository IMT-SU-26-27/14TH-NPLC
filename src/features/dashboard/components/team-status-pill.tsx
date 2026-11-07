import { cn } from "@/lib/utils";
import { getT } from "@/lib/i18n/get-dictionary";
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
    <span className="bg-card ring-border text-foreground inline-flex h-6 shrink-0 items-center gap-1.5 rounded-md px-2.5 font-mono text-[11px] font-medium tracking-[0.12em] uppercase ring-1">
      <span aria-hidden className={cn("size-[7px] rounded-full", DOT[status])} />
      {t(`status.${status}`)}
    </span>
  );
}
