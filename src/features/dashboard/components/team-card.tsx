import Link from "next/link";
import { CodeIcon, InfoIcon, OctagonXIcon } from "lucide-react";
import { COMPETITION_TYPE_LABEL } from "@/lib/format";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { RegistrationStatusBadge } from "@/features/registration/components/registration-status-badge";
import { TeamTimeline } from "@/features/dashboard/components/team-timeline";
import { TeamMembers } from "@/features/dashboard/components/team-members";
import { PaymentPanel } from "@/features/dashboard/components/payment-panel";
import { ReferralCode } from "@/features/dashboard/components/referral-code";
import { DeleteTeamButton } from "@/features/dashboard/components/delete-team-button";
import type { TeamCardProps } from "@/types/registration";

export function TeamCard({ team, userId, qrisUrl }: TeamCardProps) {
  const isLeader = team.leader_id === userId;
  const editable = team.status === "pending_payment" || team.status === "rejected";
  const isCp = team.competition.type === "competitive_programming";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{team.team_name}</CardTitle>
        <CardDescription>
          {team.competition.name} · {COMPETITION_TYPE_LABEL[team.competition.type]}
        </CardDescription>
        <CardAction>
          <RegistrationStatusBadge status={team.status} />
        </CardAction>
      </CardHeader>

      <CardContent className="space-y-6">
        {team.status === "rejected" && team.rejection_reason && (
          <Alert variant="destructive">
            <OctagonXIcon />
            <AlertTitle>Registration rejected</AlertTitle>
            <AlertDescription>{team.rejection_reason}</AlertDescription>
          </Alert>
        )}
        {team.status === "accepted" && isCp && (
          <Alert>
            <CodeIcon />
            <AlertTitle>You&apos;re in the competitive programming contest</AlertTitle>
            <AlertDescription>
              The contest page opens when the admin starts the competition.
              <Link href="/cp" className={buttonVariants({ size: "sm", className: "mt-2" })}>
                Go to contest
              </Link>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="space-y-3">
            <h3 className="font-medium">Registration progress</h3>
            <TeamTimeline team={team} />
          </section>
          <section className="space-y-3">
            <h3 className="font-medium">
              Members ({team.members.length}/{team.competition.max_members})
            </h3>
            <TeamMembers team={team} userId={userId} />
            {editable && <ReferralCode code={team.referral_code} />}
          </section>
        </div>

        {editable && (
          <>
            <Separator />
            <section className="space-y-3">
              <h3 className="font-medium">Payment</h3>
              {isLeader ? (
                <PaymentPanel team={team} qrisUrl={qrisUrl} />
              ) : (
                <Alert>
                  <InfoIcon />
                  <AlertDescription>Your team leader uploads the payment proof once everyone has joined.</AlertDescription>
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
