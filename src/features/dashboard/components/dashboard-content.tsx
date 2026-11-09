import { InfoIcon } from "lucide-react";
import { requireUser } from "@/lib/data/auth";
import { getMyTeams, getMyWaGroup } from "@/lib/data/registrations";
import { getCpSessionStatus } from "@/lib/data/cp";
import { getRallySession } from "@/lib/data/rally";
import { getTimelineEvents } from "@/lib/data/content";
import { lastEventFor, nextEventFor, todayInWib } from "@/lib/timeline";
import { publicImageUrl } from "@/lib/cloudinary/server";
import { getT } from "@/lib/i18n/get-dictionary";
import { pushEnabledFor } from "@/lib/push/config";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { RefreshButton } from "@/components/shared/refresh-button";
import { AccountCard } from "@/features/dashboard/components/account-card";
import { AccountNote } from "@/features/dashboard/components/account-note";
import { DashboardEmptyCard } from "@/features/dashboard/components/dashboard-empty-card";
import { TeamCard } from "@/features/dashboard/components/team-card";
import { PushPrompt } from "@/features/dashboard/components/push-prompt";
import type { DashboardContentProps } from "@/types/registration";

export async function DashboardContent({ lang, searchParams }: DashboardContentProps) {
  const t = getT(lang);
  const [{ notice }, user, teams, waGroup, events] = await Promise.all([
    searchParams,
    requireUser("/dashboard"),
    getMyTeams(),
    getMyWaGroup(),
    getTimelineEvents(),
  ]);
  const today = todayInWib();

  const team = teams[0];
  // An accepted CP team sees the contest button only once the contest has started.
  const cpTeam = teams.find((item) => item.status === "accepted" && item.competition.type === "competitive_programming");
  const contestStatus = cpTeam ? await getCpSessionStatus(cpTeam.competition.id) : null;
  // An accepted Rally team sees its QR and the leaderboard only once the admin has started the session.
  const rallyTeam = teams.find((item) => item.status === "accepted" && item.competition.type === "logic");
  const rallyStatus = rallyTeam ? (await getRallySession(rallyTeam.competition.id)).status : null;

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

      {pushEnabledFor(user.role) && <PushPrompt hasTeams={teams.length > 0} />}

      {/* No realtime here (the server has 2 cores): the page refreshes when the tab is opened again, or by hand. */}
      {teams.length > 0 && (
        <div className="flex justify-end">
          <RefreshButton />
        </div>
      )}

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
                contestStatus={item.id === cpTeam?.id ? contestStatus : null}
                rallyStatus={item.id === rallyTeam?.id ? rallyStatus : null}
                nextEvent={item.status === "accepted" ? nextEventFor(events, item.competition.type, today) : null}
                mainEvent={item.status === "accepted" ? lastEventFor(events, item.competition.type) : null}
                waGroup={item.status === "accepted" ? waGroup : null}
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
    </div>
  );
}
