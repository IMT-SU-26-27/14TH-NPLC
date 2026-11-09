import Link from "next/link";
import { ArrowRightIcon, BookOpenIcon, CalendarIcon, TrophyIcon } from "lucide-react";
import { GUIDEBOOK_URL, INSTAGRAM } from "@/lib/event-info";
import { formatDateRange } from "@/lib/format";
import { localePath } from "@/lib/i18n/config";
import { getT } from "@/lib/i18n/get-dictionary";
import { rallyLeaderboardOpen, rallyQrVisible } from "@/lib/rally/session-visibility";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { ContactPersonLink } from "@/components/shared/contact-person-link";
import { InstagramIcon } from "@/components/shared/instagram-icon";
import { WhatsappIcon } from "@/components/shared/whatsapp-icon";
import { CpContestRefresh } from "@/features/dashboard/components/cp-contest-refresh";
import type { NextUpCardProps } from "@/types/registration";

const hud = "text-primary font-mono text-xs font-medium tracking-[0.14em] uppercase";
const todoLink = "focus-visible:ring-ring/50 inline-flex items-center gap-2 rounded-sm underline-offset-4 outline-none hover:underline focus-visible:ring-3";

// "// SELANJUTNYA" for an accepted team: the next date on the timeline for its competition, what happens there, a
// short to-do list and the contact person. The contest button (CP) or the leaderboard (Rally) appears here on its own
// once the admin starts the session.
export function NextUpCard({ team, lang, event, mainEvent, contestOpen, rallyStatus, waGroupAvailable }: NextUpCardProps) {
  const t = getT(lang);
  const isCp = team.competition.type === "competitive_programming";
  const date = event ? formatDateRange(event.starts_on, event.ends_on, lang) : null;
  // The Rally QR shows on the Rally day itself, which is not always the next date (e.g. while registration runs).
  const rallyDay = mainEvent ? formatDateRange(mainEvent.starts_on, mainEvent.ends_on, lang) : null;
  const hint = isCp
    ? t(contestOpen ? "dashboard.nextCpLive" : "dashboard.nextCpHint")
    : rallyQrVisible(rallyStatus)
      ? t("dashboard.nextRallyLive")
      : rallyDay
        ? t("dashboard.nextRallyHint", { date: rallyDay })
        : t("dashboard.nextRallyHintNoDate");

  const action = isCp ? (
    contestOpen ? (
      <Link href={localePath(lang, "/cp")} className={cn(buttonVariants(), "rounded-[8px]")}>
        {t("dashboard.goToContest")}
        <ArrowRightIcon data-icon="inline-end" />
      </Link>
    ) : null
  ) : rallyLeaderboardOpen(rallyStatus) ? (
    <Link href={localePath(lang, "/rally/leaderboard")} className={cn(buttonVariants({ variant: "outline" }), "border-primary text-primary rounded-[8px]")}>
      <TrophyIcon data-icon="inline-start" />
      {t("rally.leaderboard.title")}
    </Link>
  ) : null;

  return (
    <section className="bg-card-muted ring-border space-y-4 rounded-[12px] p-4 ring-1 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className={hud}>{`// ${t("dashboard.nextLabel")}`}</h3>
        {action}
      </div>

      <div className="space-y-1">
        {event && date && (
          <p className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <span className="text-primary inline-flex items-center gap-1.5 font-mono text-xs tracking-wider">
              <CalendarIcon aria-hidden className="size-3.5" />
              {date}
            </span>
            <span className="font-heading text-lg leading-tight font-bold">{lang === "id" ? event.title_id : event.title_en}</span>
          </p>
        )}
        <p className="text-muted-foreground text-sm">{hint}</p>
      </div>

      <ul className="space-y-2 text-sm">
        {waGroupAvailable && (
          <li>
            <a href="#grup-peserta" className={todoLink}>
              <WhatsappIcon aria-hidden className="text-primary size-4 shrink-0" />
              {t("dashboard.nextWaGroup")}
            </a>
          </li>
        )}
        {GUIDEBOOK_URL && (
          <li>
            <a href={GUIDEBOOK_URL} target="_blank" rel="noopener noreferrer" className={todoLink}>
              <BookOpenIcon aria-hidden className="text-primary size-4 shrink-0" />
              {t("dashboard.nextGuidebook")}
            </a>
          </li>
        )}
        {/* With a WhatsApp group the Instagram link sits in that block, under the status history. */}
        {!waGroupAvailable && (
          <li>
            <a href={INSTAGRAM.url} target="_blank" rel="noopener noreferrer" className={todoLink}>
              <InstagramIcon aria-hidden className="text-primary size-4 shrink-0" />
              {t("dashboard.nextInstagram", { handle: INSTAGRAM.handle })}
            </a>
          </li>
        )}
      </ul>

      <div className="border-border flex flex-wrap items-center justify-between gap-3 border-t pt-4">
        <p className="text-muted-foreground text-sm">{t("dashboard.nextQuestions", { competition: team.competition.name })}</p>
        <ContactPersonLink competitionType={team.competition.type} opensLabel={t("landing.contact.opensWhatsapp")} className="rounded-[8px]" />
      </div>

      {isCp && !contestOpen && <CpContestRefresh competitionId={team.competition.id} />}
    </section>
  );
}
