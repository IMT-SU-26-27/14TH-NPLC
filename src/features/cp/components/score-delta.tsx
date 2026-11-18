"use client";

import { cn } from "@/lib/utils";
import { formatScoreDelta } from "@/lib/format";
import { useI18n } from "@/hooks/use-i18n";
import type { ScoreDeltaProps } from "@/types/cp";

// What one submission did to the team score: "+100" green, "−10" red, "±0" slate. The number comes from the
// database (cp_submissions.score), so the session's penalty is already applied. Nothing for Run, judging or refused.
export function ScoreDelta({ score, className }: ScoreDeltaProps) {
  const { lang } = useI18n();
  if (score === null) return null;
  return (
    <span
      className={cn(
        "font-mono font-semibold tabular-nums",
        score > 0 ? "text-success" : score < 0 ? "text-destructive" : "text-muted-foreground",
        className,
      )}
    >
      {formatScoreDelta(score, lang)}
    </span>
  );
}
