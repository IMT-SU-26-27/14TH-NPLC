import Link from "next/link";
import { ArrowLeftIcon, ListOrderedIcon } from "lucide-react";
import { localePath } from "@/lib/i18n/config";
import { getT } from "@/lib/i18n/get-dictionary";
import { buttonVariants } from "@/components/ui/button";
import { ContestClock } from "@/features/cp/components/contest-clock";
import type { ContestHeaderProps } from "@/types/cp";

export function ContestHeader({ lang, context, showBackToProblems }: ContestHeaderProps) {
  const t = getT(lang);
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="space-y-1">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">{t("cp.title")}</h1>
        {context.teamName && <p className="text-muted-foreground">{t("cp.waiting.team", { team: context.teamName })}</p>}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <ContestClock
          competitionId={context.competitionId}
          status={context.session.status}
          endsAt={context.session.scheduled_end_at}
          pausedAt={context.session.paused_at}
        />
        {showBackToProblems && (
          <Link href={localePath(lang, "/cp")} className={buttonVariants({ variant: "outline" })}>
            <ArrowLeftIcon />
            {t("cp.backToProblems")}
          </Link>
        )}
        <Link href={localePath(lang, "/cp/leaderboard")} className={buttonVariants({ variant: "outline" })}>
          <ListOrderedIcon />
          {t("cp.leaderboard")}
        </Link>
      </div>
    </div>
  );
}
