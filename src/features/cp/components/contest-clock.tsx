"use client";

import { useEffect } from "react";
import { PauseIcon, TimerIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatClock } from "@/lib/format";
import { finishContestIfTimeUp } from "@/lib/actions/cp-clock";
import { useCountdown } from "@/hooks/use-countdown";
import { useI18n } from "@/hooks/use-i18n";
import type { ContestClockProps } from "@/types/cp";

// Time left in the contest. Frozen while paused (the end moves back by the pause on resume).
// At zero it asks the server to end the contest; Realtime then moves every page on.
export function ContestClock({ competitionId, status, endsAt, pausedAt }: ContestClockProps) {
  const { t } = useI18n();
  const live = status === "live";
  const left = useCountdown(live ? endsAt : null);
  const timeUp = live && left === 0;

  // Ask now, then every 5 s: this browser's clock may run slightly ahead of the server's.
  // Stops once the contest has ended (the status prop changes, or the page moves on).
  useEffect(() => {
    if (!timeUp) return;
    let stopped = false;
    const attempt = () => {
      void finishContestIfTimeUp(competitionId).then((result) => {
        if (result.ok && result.data.ended) stopped = true;
      });
    };
    attempt();
    const id = setInterval(() => {
      if (!stopped) attempt();
    }, 5000);
    return () => clearInterval(id);
  }, [timeUp, competitionId]);

  if (!endsAt) return null;

  const pausedLeft = pausedAt ? Math.max(0, Math.round((new Date(endsAt).getTime() - new Date(pausedAt).getTime()) / 1000)) : null;
  const seconds = live ? left : pausedLeft;
  const urgent = live && seconds !== null && seconds < 600;
  const over = timeUp;

  return (
    <div
      role="timer"
      aria-label={t("cp.timeLeft")}
      className={cn(
        "bg-card flex items-center gap-2.5 rounded-lg border px-3 py-1.5",
        urgent && "border-destructive/40 bg-destructive/5",
      )}
    >
      {status === "paused" ? <PauseIcon className="text-muted-foreground size-4" /> : <TimerIcon className={cn("size-4", urgent ? "text-destructive" : "text-muted-foreground")} />}
      <div className="leading-tight">
        <p className="text-muted-foreground text-xs">{status === "paused" ? t("cp.timePaused") : t("cp.timeLeft")}</p>
        <p className={cn("font-mono text-lg font-semibold tabular-nums", urgent && "text-destructive")}>
          {over ? t("cp.timeUp") : seconds === null ? "--:--:--" : formatClock(seconds)}
        </p>
      </div>
    </div>
  );
}
