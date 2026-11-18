"use client";

import { CircleCheckIcon, CircleXIcon, ClockIcon, InfoIcon, PlayIcon } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/hooks/use-i18n";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import type { VerdictBadgeKind, VerdictBadgeProps } from "@/types/cp";

type Look = { variant: ComponentProps<typeof Badge>["variant"]; className?: string; icon: ReactNode };

// One map for the result panel, submission history, problem list and leaderboard (design v89, DESIGN.md).
// Green fill only for Accepted, green outline for a repeat Accepted, red tint for wrong answers, secondary for
// Time Limit, and neutral outline for everything that is not a graded verdict.
const LOOK: Record<VerdictBadgeKind, Look> = {
  accepted: { variant: "default", className: "bg-success text-success-foreground", icon: <CircleCheckIcon /> },
  solved: { variant: "outline", className: "border-success-border bg-card text-success", icon: <CircleCheckIcon /> },
  wrongAnswer: { variant: "destructive", icon: <CircleXIcon /> },
  runtimeError: { variant: "destructive", icon: <CircleXIcon /> },
  compileError: { variant: "destructive", icon: <CircleXIcon /> },
  timeLimit: { variant: "secondary", icon: <ClockIcon /> },
  judgeError: { variant: "outline", className: "bg-card", icon: <InfoIcon /> },
  judging: { variant: "outline", className: "bg-card", icon: <Spinner /> },
  run: { variant: "outline", className: "bg-card", icon: <PlayIcon /> },
  lateRejected: { variant: "outline", className: "bg-card", icon: <ClockIcon /> },
};

// Labels are the guidebook's own English words ("Yes – Accepted") in both languages; turn a submission into a
// kind with submissionOutcome(verdict, alreadySolved).
export function VerdictBadge({ kind, className }: VerdictBadgeProps) {
  const { t } = useI18n();
  const look = LOOK[kind];
  return (
    <Badge variant={look.variant} className={cn(look.className, className)}>
      {look.icon}
      {t(`cp.outcome.${kind}`)}
    </Badge>
  );
}
