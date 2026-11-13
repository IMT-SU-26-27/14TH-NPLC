import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { ListIcon, ListOrderedIcon, LockIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { contestBarStatus } from "@/lib/cp/contest-status";
import { localePath } from "@/lib/i18n/config";
import { getT } from "@/lib/i18n/get-dictionary";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { ContestStatusBadge } from "@/features/cp/components/contest-status-badge";
import { ContestTimer } from "@/features/cp/components/contest-timer";
import type { ContestBarProps } from "@/types/cp";

// Top bar of every contest screen (workspace, problem list, waiting room, leaderboard). It replaces the site header
// so the editor gets the full height. Phones get two rows: session and team with the time left, then status,
// the other contest page and the language.
export function ContestBar({ lang, context, view, round = "preliminary", disqualified = false }: ContestBarProps) {
  const t = getT(lang);
  const { session } = context;
  const status = contestBarStatus(session, disqualified);
  const roundLabel = t(`cp.contest.round.${round}`);
  // Participants lose the live leaderboard in the last hour; the link says so before they open it.
  const closed = session.leaderboard_frozen_at !== null;

  const showProblems = view !== "waiting";
  const showLeaderboard = view !== "waiting" || session.status === "paused";
  const onProblems = view === "problems" || view === "problem";
  const onLeaderboard = view === "leaderboard";
  const navClass = (active: boolean) =>
    cn(buttonVariants({ variant: active ? "secondary" : "ghost" }), "max-sm:h-11", active && "max-sm:hidden");

  return (
    <header className="bg-card border-border flex flex-wrap items-center gap-x-3.5 gap-y-2 border-b px-3 py-2.5 sm:h-16 sm:flex-nowrap sm:px-6 sm:py-0">
      <span className="flex shrink-0 items-center gap-1.5 max-sm:hidden">
        <Image src="/shared/logo-star.webp" alt="" aria-hidden width={18} height={22} className="h-[22px] w-auto" />
        <Image src="/shared/logo-nplc-xiv.webp" alt="NPLC XIV" width={108} height={22} className="h-[22px] w-auto" />
      </span>
      <span aria-hidden className="bg-border h-7 w-px shrink-0 max-sm:hidden" />

      <div className="order-1 flex min-w-0 flex-1 flex-col sm:order-none sm:flex-none">
        <span className="text-muted-foreground truncate text-xs font-medium">
          <span className="max-xl:hidden">{t("cp.contest.barTitle", { round: roundLabel })}</span>
          <span className="xl:hidden">{t("cp.contest.barTitleShort", { round: roundLabel })}</span>
        </span>
        {context.teamName && <span className="font-heading truncate text-base leading-5 font-semibold">{context.teamName}</span>}
      </div>

      <div className="order-4 sm:order-none">
        <ContestStatusBadge status={status} />
      </div>

      {(showProblems || showLeaderboard) && (
        <nav aria-label={t("cp.contest.nav.label")} className="order-4 flex gap-1 sm:order-none sm:ml-4">
          {showProblems && (
            <Link href={localePath(lang, "/cp")} aria-current={onProblems ? "page" : undefined} className={navClass(onProblems)}>
              <ListIcon />
              {t("cp.contest.nav.problems")}
            </Link>
          )}
          {showLeaderboard && (
            <Link
              href={localePath(lang, "/cp/leaderboard")}
              aria-current={onLeaderboard ? "page" : undefined}
              className={navClass(onLeaderboard)}
            >
              <ListOrderedIcon />
              <span className="max-xl:hidden">{t("cp.contest.nav.leaderboard")}</span>
              <span className="xl:hidden">{t("cp.contest.nav.leaderboardShort")}</span>
              {closed && (
                <Badge variant="secondary">
                  <LockIcon />
                  {t("cp.contest.nav.closed")}
                </Badge>
              )}
            </Link>
          )}
        </nav>
      )}

      <span aria-hidden className="flex-1 max-sm:hidden" />

      <div className="order-2 sm:order-none sm:border-border sm:border-l sm:pl-3">
        <ContestTimer
          competitionId={context.competitionId}
          status={session.status}
          scheduledStartAt={session.scheduled_start_at}
          endsAt={session.scheduled_end_at}
          pausedAt={session.paused_at}
        />
      </div>

      {/* Phones: everything after this starts the second row. */}
      <span aria-hidden className="order-3 basis-full sm:hidden" />

      <div className="order-4 max-sm:ml-auto sm:order-none">
        <Suspense fallback={null}>
          <LanguageSwitcher />
        </Suspense>
      </div>
    </header>
  );
}
