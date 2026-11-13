"use client";

import { useEffect } from "react";
import { InfoIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatClock, formatWibTime } from "@/lib/format";
import { finishContestIfTimeUp } from "@/lib/actions/cp-clock";
import { useCountdown } from "@/hooks/use-countdown";
import { useI18n } from "@/hooks/use-i18n";
import { useServerClockOffset } from "@/hooks/use-server-clock-offset";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { ContestTimerProps } from "@/types/cp";

// The countdown block of the contest bar: time left while live (frozen while paused), time to the start in the
// waiting room. Follows the server clock (offset measured once per page), and at zero asks the server to end the
// contest; Realtime then moves every page on.
export function ContestTimer({
  competitionId,
  status,
  scheduledStartAt,
  endsAt,
  pausedAt,
  size = "default",
  finishAtZero = true,
}: ContestTimerProps) {
  const { t, lang } = useI18n();
  const offset = useServerClockOffset();
  const live = status === "live";
  const target = live ? endsAt : status === "scheduled" ? scheduledStartAt : null;
  const left = useCountdown(target, offset);
  const timeUp = live && left === 0;

  // Ask now, then every 5 s, until the server has ended the contest (the status prop then changes).
  useEffect(() => {
    if (!timeUp || !finishAtZero) return;
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
  }, [timeUp, finishAtZero, competitionId]);

  let label: string;
  let tip: string;
  let value: string | null;
  if (status === "paused") {
    label = t("cp.contest.timer.leftPaused");
    tip = t("cp.contest.timer.tooltipPaused");
    value =
      endsAt && pausedAt ? formatClock(Math.max(0, Math.round((new Date(endsAt).getTime() - new Date(pausedAt).getTime()) / 1000))) : null;
  } else if (status === "ended") {
    label = t("cp.contest.timer.left");
    tip = t("cp.contest.timer.tooltipEnded");
    value = formatClock(0);
  } else if (status === "scheduled") {
    label = scheduledStartAt ? t("cp.contest.timer.startsIn") : t("cp.contest.timer.startsAt");
    tip = scheduledStartAt
      ? t("cp.contest.timer.tooltipStart", { time: formatWibTime(scheduledStartAt, lang) })
      : t("cp.contest.timer.tooltipUnscheduled");
    value = scheduledStartAt ? (left === null ? null : formatClock(left)) : t("cp.contest.timer.notScheduled");
  } else {
    label = t("cp.contest.timer.left");
    tip = endsAt ? t("cp.contest.timer.tooltipLive", { time: formatWibTime(endsAt, lang) }) : label;
    value = left === null ? null : formatClock(left);
  }

  const unscheduled = status === "scheduled" && !scheduledStartAt;
  const done = status === "ended" || timeUp;

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <div
            role="timer"
            tabIndex={0}
            aria-label={`${label} ${value ?? ""}`.trim()}
            className="focus-visible:ring-ring/50 flex flex-col items-end rounded-md outline-none focus-visible:ring-[3px]"
          />
        }
      >
        <span className={cn("text-muted-foreground inline-flex items-center gap-1 font-medium", size === "lg" ? "text-base" : "text-[11px] leading-3.5")}>
          {label}
          <InfoIcon aria-hidden className={size === "lg" ? "size-4" : "size-3"} />
        </span>
        <span
          className={cn(
            "font-mono font-semibold tracking-[-0.01em] tabular-nums",
            unscheduled ? "text-sm leading-8 font-medium" : size === "lg" ? "text-[56px] leading-[60px]" : "text-[28px] leading-8",
            done || value === null ? "text-muted-foreground" : "text-foreground",
          )}
        >
          {value ?? "--:--:--"}
        </span>
      </TooltipTrigger>
      <TooltipContent>{tip}</TooltipContent>
    </Tooltip>
  );
}
