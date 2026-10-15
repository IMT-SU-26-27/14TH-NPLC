import Link from "next/link";
import { InfoIcon, UsersIcon } from "lucide-react";
import { requireUser } from "@/lib/data/auth";
import { getMyTeams } from "@/lib/data/registrations";
import { publicImageUrl } from "@/lib/cloudinary/server";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { buttonVariants } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { AccountCard } from "@/features/dashboard/components/account-card";
import { TeamCard } from "@/features/dashboard/components/team-card";
import { RegistrationRealtime } from "@/features/dashboard/components/registration-realtime";
import type { DashboardPageProps } from "@/types/registration";

export async function DashboardContent({ searchParams }: DashboardPageProps) {
  const [{ notice }, user, teams] = await Promise.all([searchParams, requireUser("/dashboard"), getMyTeams()]);

  return (
    <div className="space-y-6">
      {notice === "cp-not-registered" && (
        <Alert>
          <InfoIcon />
          <AlertTitle>The contest page is for accepted teams</AlertTitle>
          <AlertDescription>
            You need an accepted competitive programming registration to open it.
          </AlertDescription>
        </Alert>
      )}

      <AccountCard user={user} />

      {teams.length === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <UsersIcon />
            </EmptyMedia>
            <EmptyTitle>You&apos;re not on a team yet</EmptyTitle>
            <EmptyDescription>Register a new team as its leader, or join one with a code from your leader.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent className="flex-row justify-center">
            <Link href="/register" className={buttonVariants()}>
              Register a team
            </Link>
            <Link href="/join" className={buttonVariants({ variant: "outline" })}>
              Join with a code
            </Link>
          </EmptyContent>
        </Empty>
      ) : (
        teams.map((team) => (
          <TeamCard
            key={team.id}
            team={team}
            userId={user.id}
            qrisUrl={team.competition.qris_public_id ? publicImageUrl(team.competition.qris_public_id) : null}
          />
        ))
      )}

      <RegistrationRealtime registrationIds={teams.map((t) => t.id)} />
    </div>
  );
}
