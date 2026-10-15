"use client";

import { TimerIcon } from "lucide-react";
import { useCountdown } from "@/hooks/use-countdown";
import { useI18n } from "@/hooks/use-i18n";
import { Badge } from "@/components/ui/badge";
import type { ContestClockProps } from "@/types/cp";

export function ContestClock({ endsAt }: ContestClockProps) {
  const { t } = useI18n();
  const left = useCountdown(endsAt);

  if (!endsAt) return <Badge variant="outline">{t("cp.noEndTime")}</Badge>;

  const h = Math.floor((left ?? 0) / 3600);
  const m = Math.floor(((left ?? 0) % 3600) / 60);
  const s = (left ?? 0) % 60;
  const text = left === null ? "--:--:--" : [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");

  return (
    <Badge variant={left !== null && left < 600 ? "destructive" : "secondary"} className="font-mono tabular-nums" aria-label={t("cp.timeLeft")}>
      <TimerIcon />
      {text}
    </Badge>
  );
}
