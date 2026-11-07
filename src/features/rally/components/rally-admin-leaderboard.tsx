import { requireAdmin } from "@/lib/data/auth";
import { getRallyCompetition, getRallyLeaderboard, getRallySession } from "@/lib/data/rally";
import { notFound } from "next/navigation";
import { RallyFreezeButton } from "@/features/rally/components/rally-freeze-button";
import { RallyLeaderboardTable } from "@/features/rally/components/rally-leaderboard-table";

export async function RallyAdminLeaderboard() {
  await requireAdmin();
  const competition = await getRallyCompetition();
  if (!competition) notFound();

  const [session, rows] = await Promise.all([getRallySession(competition.id), getRallyLeaderboard(competition.id)]);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <RallyFreezeButton competitionId={competition.id} frozen={!!session.leaderboard_frozen_at} />
      </div>
      <RallyLeaderboardTable competitionId={competition.id} initialRows={rows} viewer="admin" frozenAt={session.leaderboard_frozen_at} />
    </div>
  );
}
