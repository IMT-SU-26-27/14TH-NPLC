import Link from "next/link";
import { CodeIcon, InfoIcon, OctagonXIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { localePath } from "@/lib/i18n/config";
import { getT } from "@/lib/i18n/get-dictionary";
import { isRegistrationOpen } from "@/lib/data/competitions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { TeamStatusPill } from "@/features/dashboard/components/team-status-pill";
import { TeamTimeline } from "@/features/dashboard/components/team-timeline";
import { TeamMembers } from "@/features/dashboard/components/team-members";
import { PaymentPanel } from "@/features/dashboard/components/payment-panel";
import { ReferralCode } from "@/features/dashboard/components/referral-code";
import { DeleteTeamButton } from "@/features/dashboard/components/delete-team-button";
import { RallyTeamQr } from "@/features/rally/components/rally-team-qr";
import type { TeamCardProps } from "@/types/registration";

export function TeamCard({ team, userId, qrisUrl, lang }: TeamCardProps) {
  const t = getT(lang);
  const isLeader = team.leader_id === userId;
  // Members join and can be removed while the competition is open; payment is only re-sent after a rejection.
  const membershipOpen = isRegistrationOpen(team.competition);
  const needsPayment = team.status === "pending_payment" || team.status === "rejected";
  const isCp = team.competition.type === "competitive_programming";

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

      {team.status === "accepted" && isCp && (
        <div className="bg-accent ring-border flex flex-wrap items-center gap-x-4 gap-y-3 rounded-lg px-3.5 py-2.5 ring-1">
          <CodeIcon aria-hidden className="text-primary size-[18px] shrink-0" />
          <div className="min-w-0 flex-1 basis-48 text-sm">
            <p className="font-medium">{t("dashboard.cpAcceptedTitle")}</p>
            <p className="text-muted-foreground">{t("dashboard.cpAcceptedDescription")}</p>
          </div>
          <Link href={localePath(lang, "/cp")} className={cn(buttonVariants(), "rounded-[8px]")}>
            {t("dashboard.goToContest")}
          </Link>
        </div>
      )}

      {team.status === "accepted" && team.competition.type === "logic" && (
        <RallyTeamQr token={team.rally_qr_token} referralCode={team.referral_code} lang={lang} />
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[5fr_7fr]">
        <section className="space-y-3.5">
          <h3 className={label}>{t("dashboard.progress")}</h3>
          <TeamTimeline team={team} lang={lang} />
        </section>
        <section className="space-y-3">
          <h3 className={label}>{t("dashboard.members", { count: team.members.length, max: team.competition.max_members })}</h3>
          <TeamMembers team={team} userId={userId} canEdit={membershipOpen} />
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

      {isLeader && team.status === "pending_payment" && (
        <div className="flex justify-end">
          <DeleteTeamButton registrationId={team.id} />
        </div>
      )}
    </article>
  );
}
