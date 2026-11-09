import { InfoIcon, OctagonXIcon, UsersIcon } from "lucide-react";
import { getT } from "@/lib/i18n/get-dictionary";
import { isRegistrationOpen } from "@/lib/data/competitions";
import { rallyQrVisible } from "@/lib/rally/session-visibility";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { TeamStatusPill } from "@/features/dashboard/components/team-status-pill";
import { TeamTimeline } from "@/features/dashboard/components/team-timeline";
import { TeamMembers } from "@/features/dashboard/components/team-members";
import { PaymentPanel } from "@/features/dashboard/components/payment-panel";
import { ReferralCode } from "@/features/dashboard/components/referral-code";
import { RallyTeamQr } from "@/features/rally/components/rally-team-qr";
import { RallySessionRefresh } from "@/features/dashboard/components/rally-session-refresh";
import { NextUpCard } from "@/features/dashboard/components/next-up-card";
import { DashboardNote } from "@/features/dashboard/components/dashboard-note";
import type { TeamCardProps } from "@/types/registration";

export function TeamCard({ team, userId, qrisUrl, lang, contestStatus, rallyStatus, nextEvent, mainEvent, waGroupAvailable }: TeamCardProps) {
  const t = getT(lang);
  const isLeader = team.leader_id === userId;
  // Members join and can be removed while the competition is open; payment is only re-sent after a rejection.
  const membershipOpen = isRegistrationOpen(team.competition);
  const needsPayment = team.status === "pending_payment" || team.status === "rejected";
  const isCp = team.competition.type === "competitive_programming";
  // Before the admin starts the contest the old contest pages are closed to participants (the proxy sends them
  // back here), so there is no button until then.
  const contestOpen = contestStatus !== null && contestStatus !== "scheduled";
  const { min_members: minMembers, max_members: maxMembers } = team.competition;
  const short = t(`landing.competitions.short.${team.competition.type}`);
  const belowMinimum = team.members.length < minMembers && team.status !== "accepted";

  const label = "text-primary font-mono text-xs font-medium tracking-[0.14em] uppercase";

  return (
    <article className="bg-card ring-border space-y-5.5 rounded-[12px] p-5 ring-1 sm:px-10 sm:py-9">
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1.5">
          <p className={label}>{`// ${t("dashboard.teamLabel", { type: team.competition.name })}`}</p>
          <h2 className="font-heading text-foreground text-[28px] leading-[1.1] font-bold tracking-[-0.02em] break-words sm:text-[34px]">{team.team_name}</h2>
          {(team.school || team.line_id) && (
            <dl className="text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 pt-1 text-sm">
              {team.school && (
                <div className="flex gap-1">
                  <dt>{t("register.school")}:</dt>
                  <dd className="text-foreground">{team.school}</dd>
                </div>
              )}
              {team.line_id && (
                <div className="flex gap-1">
                  <dt>{t("register.lineId")}:</dt>
                  <dd className="text-foreground font-mono">{team.line_id}</dd>
                </div>
              )}
            </dl>
          )}
        </div>
        <TeamStatusPill status={team.status} lang={lang} />
      </header>

      {team.status === "rejected" && team.rejection_reason && (
        <Alert variant="destructive">
          <OctagonXIcon />
          <AlertTitle>{t("dashboard.rejectedTitle")}</AlertTitle>
          <AlertDescription>{team.rejection_reason}</AlertDescription>
        </Alert>
      )}

      {belowMinimum && (
        <DashboardNote
          icon={UsersIcon}
          description={t(minMembers === maxMembers ? "dashboard.teamExactSize" : "dashboard.teamMinSize", { short, count: minMembers })}
        />
      )}

      {team.status === "accepted" && (
        <NextUpCard
          team={team}
          lang={lang}
          event={nextEvent}
          mainEvent={mainEvent}
          contestOpen={isCp && contestOpen}
          rallyStatus={rallyStatus}
          waGroupAvailable={waGroupAvailable}
        />
      )}

      {team.status === "accepted" && rallyStatus !== null && (
        <>
          {rallyQrVisible(rallyStatus) && <RallyTeamQr token={team.rally_qr_token} referralCode={team.referral_code} lang={lang} />}
          <RallySessionRefresh competitionId={team.competition.id} status={rallyStatus} />
        </>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[5fr_7fr]">
        <section className="space-y-3.5">
          <h3 className={label}>{t("dashboard.progress")}</h3>
          <TeamTimeline team={team} lang={lang} />
        </section>
        <section className="space-y-3">
          <h3 className={label}>{t("dashboard.members", { count: team.members.length, max: team.competition.max_members })}</h3>
          <TeamMembers team={team} userId={userId} />
          {membershipOpen && <ReferralCode code={team.referral_code} />}
        </section>
      </div>

      {needsPayment && (
        <>
          <Separator />
          <section className="space-y-3">
            <h3 className={label}>{t("dashboard.payment")}</h3>
            {isLeader ? (
              <PaymentPanel team={team} qrisUrl={qrisUrl} />
            ) : (
              <Alert>
                <InfoIcon />
                <AlertDescription>{t("dashboard.memberPaysNote")}</AlertDescription>
              </Alert>
            )}
          </section>
        </>
      )}

    </article>
  );
}
