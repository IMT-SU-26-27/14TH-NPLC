import { TrophyIcon } from "lucide-react";
import { requireUser } from "@/lib/data/auth";
import { getRallyLeaderboard, getRallySession } from "@/lib/data/rally";
import { getMyTeams } from "@/lib/data/registrations";
import { getT } from "@/lib/i18n/get-dictionary";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { RallyLeaderboardTable } from "@/features/rally/components/rally-leaderboard-table";
import type { LangProps } from "@/types/i18n";

export async function RallyParticipantLeaderboard({ lang }: LangProps) {
  const t = getT(lang);
  await requireUser("/rally/leaderboard");
  const teams = await getMyTeams();
  const team = teams.find((x) => x.status === "accepted" && x.competition.type === "logic");

  if (!team) {
    return (
      <Empty className="border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <TrophyIcon />
          </EmptyMedia>
          <EmptyTitle>{t("rally.leaderboard.notEligibleTitle")}</EmptyTitle>
          <EmptyDescription>{t("rally.leaderboard.notEligibleDescription")}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  const session = await getRallySession(team.competition.id);
  const rows = await getRallyLeaderboard(team.competition.id, session.leaderboard_frozen_at ? "snapshot" : "live");

  return (
    <RallyLeaderboardTable
      competitionId={team.competition.id}
      initialRows={rows}
      viewer="participant"
      frozenAt={session.leaderboard_frozen_at}
      highlightRegistrationId={team.id}
    />
  );
}
