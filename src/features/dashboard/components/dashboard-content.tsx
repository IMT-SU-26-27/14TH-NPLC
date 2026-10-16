import Link from "next/link";
import { InfoIcon, UsersIcon } from "lucide-react";
import { requireUser } from "@/lib/data/auth";
import { getMyTeams } from "@/lib/data/registrations";
import { publicImageUrl } from "@/lib/cloudinary/server";
import { localePath } from "@/lib/i18n/config";
import { getT } from "@/lib/i18n/get-dictionary";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { buttonVariants } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { AccountCard } from "@/features/dashboard/components/account-card";
import { TeamCard } from "@/features/dashboard/components/team-card";
import { RegistrationRealtime } from "@/features/dashboard/components/registration-realtime";
import { PushPrompt } from "@/features/dashboard/components/push-prompt";
import type { DashboardContentProps } from "@/types/registration";

export async function DashboardContent({ lang, searchParams }: DashboardContentProps) {
  const t = getT(lang);
  const [{ notice }, user, teams] = await Promise.all([searchParams, requireUser("/dashboard"), getMyTeams()]);

  return (
    <div className="space-y-6">
      {notice === "cp-not-registered" && (
        <Alert>
          <InfoIcon />
          <AlertTitle>{t("dashboard.cpNoticeTitle")}</AlertTitle>
          <AlertDescription>{t("dashboard.cpNoticeDescription")}</AlertDescription>
        </Alert>
      )}

      <PushPrompt hasTeams={teams.length > 0} />

      {teams.length === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <UsersIcon />
            </EmptyMedia>
            <EmptyTitle>{t("dashboard.emptyTitle")}</EmptyTitle>
            <EmptyDescription>{t("dashboard.emptyDescription")}</EmptyDescription>
          </EmptyHeader>
          <EmptyContent className="flex-row justify-center">
            <Link href={localePath(lang, "/register")} className={buttonVariants()}>
              {t("dashboard.registerTeam")}
            </Link>
            <Link href={localePath(lang, "/join")} className={buttonVariants({ variant: "outline" })}>
              {t("dashboard.joinWithCode")}
            </Link>
          </EmptyContent>
        </Empty>
      ) : (
        teams.map((team) => (
          <TeamCard
            key={team.id}
            team={team}
            userId={user.id}
            lang={lang}
            qrisUrl={team.competition.qris_public_id ? publicImageUrl(team.competition.qris_public_id) : null}
          />
        ))
      )}

      <AccountCard user={user} lang={lang} />

      <RegistrationRealtime registrationIds={teams.map((team) => team.id)} />
    </div>
  );
}
