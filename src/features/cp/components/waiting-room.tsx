"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { HourglassIcon, PauseIcon, TrophyIcon } from "lucide-react";
import { toast } from "sonner";
import { formatDateTime } from "@/lib/format";
import { useCountdown } from "@/hooks/use-countdown";
import { useCpSessionRealtime } from "@/hooks/use-cp-session-realtime";
import { useI18n } from "@/hooks/use-i18n";
import { buttonVariants } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import type { WaitingRoomProps } from "@/types/cp";

function clock(seconds: number, daySuffix: string) {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const hms = [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
  return d > 0 ? `${d}${daySuffix} ${hms}` : hms;
}

// Moves the team into the contest the moment an admin presses start (Supabase Realtime on cp_sessions).
// Uses a full page load, not router.replace: the client router can reuse the cached
// "/cp → /cp/waiting" redirect from before the start and land the team back here.
export function WaitingRoom({ competitionId, status, scheduledStartAt, teamName }: WaitingRoomProps) {
  const router = useRouter();
  const { t, href, lang } = useI18n();
  const left = useCountdown(status === "scheduled" ? scheduledStartAt : null);

  useCpSessionRealtime(competitionId, (next) => {
    if (next === "live") {
      toast.success(t(status === "paused" ? "cp.waiting.resumedToast" : "cp.waiting.startedToast"));
      window.location.replace(href("/cp"));
    } else {
      router.refresh();
    }
  });

  if (status === "paused") {
    return (
      <Empty className="border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <PauseIcon />
          </EmptyMedia>
          <EmptyTitle>{t("cp.waiting.pausedTitle")}</EmptyTitle>
          <EmptyDescription>{t("cp.waiting.pausedLead")}</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          {teamName && <p className="text-sm font-medium">{t("cp.waiting.team", { team: teamName })}</p>}
          <Link href={href("/cp/leaderboard")} className={buttonVariants({ variant: "outline" })}>
            {t("cp.leaderboard")}
          </Link>
        </EmptyContent>
      </Empty>
    );
  }

  if (status === "ended") {
    return (
      <Empty className="border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <TrophyIcon />
          </EmptyMedia>
          <EmptyTitle>{t("cp.waiting.endedTitle")}</EmptyTitle>
          <EmptyDescription>{t("cp.waiting.endedLead")}</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Link href={href("/cp/leaderboard")} className={buttonVariants()}>
            {t("cp.leaderboard")}
          </Link>
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <Empty className="border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <HourglassIcon />
        </EmptyMedia>
        <EmptyTitle>{t("cp.waiting.scheduledTitle")}</EmptyTitle>
        <EmptyDescription>{t("cp.waiting.scheduledLead")}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        {teamName && <p className="text-sm font-medium">{t("cp.waiting.team", { team: teamName })}</p>}
        {scheduledStartAt ? (
          <div className="space-y-1">
            <p className="text-muted-foreground text-xs">{t("cp.waiting.startsIn")}</p>
            <p className="font-heading text-4xl font-semibold tabular-nums" aria-live="polite">
              {left === null ? "--:--:--" : clock(left, t("cp.daySuffix"))}
            </p>
            <p className="text-muted-foreground text-xs">{t("cp.waiting.startsAt", { date: formatDateTime(scheduledStartAt, lang) })}</p>
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">{t("cp.waiting.noSchedule")}</p>
        )}
      </EmptyContent>
    </Empty>
  );
}
