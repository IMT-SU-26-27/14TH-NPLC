import { InfoIcon } from "lucide-react";
import { requireUser } from "@/lib/data/auth";
import { getMyTeams } from "@/lib/data/registrations";
import { publicImageUrl } from "@/lib/cloudinary/server";
import { getT } from "@/lib/i18n/get-dictionary";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AccountCard } from "@/features/dashboard/components/account-card";
import { AccountNote } from "@/features/dashboard/components/account-note";
import { DashboardEmptyCard } from "@/features/dashboard/components/dashboard-empty-card";
import { TeamCard } from "@/features/dashboard/components/team-card";
import { RegistrationRealtime } from "@/features/dashboard/components/registration-realtime";
import { PushPrompt } from "@/features/dashboard/components/push-prompt";
import type { DashboardContentProps } from "@/types/registration";

export async function DashboardContent({ lang, searchParams }: DashboardContentProps) {
  const t = getT(lang);
  const [{ notice }, user, teams] = await Promise.all([searchParams, requireUser("/dashboard"), getMyTeams()]);

  const team = teams[0];

  return (
    <div className="space-y-5">
      {notice === "cp-not-registered" && (
        <Alert>
          <InfoIcon />
          <AlertTitle>{t("dashboard.cpNoticeTitle")}</AlertTitle>
          <AlertDescription>{t("dashboard.cpNoticeDescription")}</AlertDescription>
        </Alert>
      )}

      {notice === "already-registered" && (
        <Alert>
          <InfoIcon />
          <AlertTitle>{t("dashboard.alreadyRegisteredTitle")}</AlertTitle>
          <AlertDescription>{t("dashboard.alreadyRegisteredDescription")}</AlertDescription>
        </Alert>
      )}

      <PushPrompt hasTeams={teams.length > 0} />

      {/* Design 07: the team takes two thirds, the account sits beside it. */}
      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-5">
          {teams.length === 0 ? (
            <DashboardEmptyCard lang={lang} />
          ) : (
            teams.map((item) => (
              <TeamCard
                key={item.id}
                team={item}
                userId={user.id}
                lang={lang}
                qrisUrl={item.competition.qris_public_id ? publicImageUrl(item.competition.qris_public_id) : null}
              />
            ))
          )}
        </div>

        <div className="space-y-5">
          <AccountCard user={user} lang={lang} />
          {team && <AccountNote teamName={team.team_name} lang={lang} />}
        </div>
      </div>

      <RegistrationRealtime registrationIds={teams.map((item) => item.id)} />
    </div>
  );
}
