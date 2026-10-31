import Link from "next/link";
import { CodeIcon, InfoIcon, OctagonXIcon } from "lucide-react";
import { localePath } from "@/lib/i18n/config";
import { getT } from "@/lib/i18n/get-dictionary";
import { isRegistrationOpen } from "@/lib/data/competitions";
import { Alert, AlertAction, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { RegistrationStatusBadge } from "@/features/registration/components/registration-status-badge";
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
  const typeLabel = t(`competition.type.${team.competition.type}`);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{team.team_name}</CardTitle>
        <CardDescription>
          {team.competition.name}
          {typeLabel.toLowerCase() !== team.competition.name.toLowerCase() && ` · ${typeLabel}`}
        </CardDescription>
        {(team.school || team.line_id) && (
          <dl className="text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 text-sm">
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
        <CardAction>
          <RegistrationStatusBadge status={team.status} />
        </CardAction>
      </CardHeader>

      <CardContent className="space-y-6">
        {team.status === "rejected" && team.rejection_reason && (
          <Alert variant="destructive">
            <OctagonXIcon />
            <AlertTitle>{t("dashboard.rejectedTitle")}</AlertTitle>
            <AlertDescription>{team.rejection_reason}</AlertDescription>
          </Alert>
        )}
        {team.status === "accepted" && isCp && (
          <Alert>
            <CodeIcon />
            <AlertTitle>{t("dashboard.cpAcceptedTitle")}</AlertTitle>
            <AlertDescription>{t("dashboard.cpAcceptedDescription")}</AlertDescription>
            <AlertAction>
              <Link href={localePath(lang, "/cp")} className={buttonVariants({ size: "sm" })}>
                {t("dashboard.goToContest")}
              </Link>
            </AlertAction>
          </Alert>
        )}

        {team.status === "accepted" && team.competition.type === "logic" && (
          <RallyTeamQr token={team.rally_qr_token} referralCode={team.referral_code} lang={lang} />
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="space-y-3">
            <h3 className="font-medium">{t("dashboard.progress")}</h3>
            <TeamTimeline team={team} lang={lang} />
          </section>
          <section className="space-y-3">
            <h3 className="font-medium">{t("dashboard.members", { count: team.members.length, max: team.competition.max_members })}</h3>
            <TeamMembers team={team} userId={userId} canEdit={membershipOpen} />
            {membershipOpen && <ReferralCode code={team.referral_code} />}
          </section>
        </div>

        {needsPayment && (
          <>
            <Separator />
            <section className="space-y-3">
              <h3 className="font-medium">{t("dashboard.payment")}</h3>
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
      </CardContent>

      {isLeader && team.status === "pending_payment" && (
        <CardFooter className="justify-end">
          <DeleteTeamButton registrationId={team.id} />
        </CardFooter>
      )}
    </Card>
  );
}
