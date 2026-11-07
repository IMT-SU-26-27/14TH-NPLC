"use client";

import { useRouter } from "next/navigation";
import { SnowflakeIcon, TrophyIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDateTime } from "@/lib/format";
import { RALLY_FINALIST_COUNT } from "@/lib/rally/ranking";
import { useI18n } from "@/hooks/use-i18n";
import { useRallyLeaderboardRealtime } from "@/hooks/use-rally-leaderboard-realtime";
import { useRallySessionRealtime } from "@/hooks/use-rally-session-realtime";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { RallyLeaderboardTableProps } from "@/types/rally";

export function RallyLeaderboardTable({ competitionId, initialRows, viewer, frozenAt, highlightRegistrationId }: RallyLeaderboardTableProps) {
  const { t, lang } = useI18n();
  const router = useRouter();
  const { rows, changedId } = useRallyLeaderboardRealtime(competitionId, initialRows, viewer === "admin" || !frozenAt);

  // A freeze or unfreeze changes which standings this viewer may read, so ask the server again.
  useRallySessionRealtime(competitionId, (session) => {
    if ((session.leaderboard_frozen_at ?? null) !== (frozenAt ?? null)) router.refresh();
  });

  const notice = frozenAt && (
    <Alert>
      <SnowflakeIcon />
      <AlertTitle>{t(viewer === "admin" ? "rally.leaderboard.frozenAdminTitle" : "rally.leaderboard.frozenTitle")}</AlertTitle>
      <AlertDescription>{t(viewer === "admin" ? "rally.leaderboard.frozenAdmin" : "rally.leaderboard.frozen", { date: formatDateTime(frozenAt, lang) })}</AlertDescription>
    </Alert>
  );

  if (rows.length === 0) {
    return (
      <div className="space-y-4">
        {notice}
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <TrophyIcon />
            </EmptyMedia>
            <EmptyTitle>{t("rally.leaderboard.empty")}</EmptyTitle>
          </EmptyHeader>
        </Empty>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {notice}
      <div className="bg-card overflow-hidden rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>{t("rally.results.team")}</TableHead>
              <TableHead className="max-sm:hidden">{t("register.school")}</TableHead>
              <TableHead className="text-right">{t("rally.leaderboard.totalPoints")}</TableHead>
              <TableHead className="text-right">{t("rally.leaderboard.postsFinished")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, i) => (
              <TableRow
                key={row.registration_id}
                data-state={row.registration_id === highlightRegistrationId ? "selected" : undefined}
                className={cn(row.registration_id === changedId && "animate-in fade-in-0 duration-700")}
              >
                <TableCell className="font-medium tabular-nums">{i + 1}</TableCell>
                <TableCell className="font-medium whitespace-normal">
                  {row.team_name}
                  {row.registration_id === highlightRegistrationId && (
                    <Badge variant="outline" className="ml-2">
                      {t("rally.leaderboard.yourTeam")}
                    </Badge>
                  )}
                  {viewer === "admin" && i < RALLY_FINALIST_COUNT && row.posts_finished > 0 && (
                    <Badge className="bg-highlight text-highlight-foreground ml-2">{t("rally.leaderboard.finalist")}</Badge>
                  )}
                  {row.school && <span className="text-muted-foreground block text-xs font-normal sm:hidden">{row.school}</span>}
                </TableCell>
                <TableCell className="whitespace-normal max-sm:hidden">{row.school ?? "—"}</TableCell>
                <TableCell className="text-right font-semibold tabular-nums">{row.total_points}</TableCell>
                <TableCell className="text-right tabular-nums">{row.posts_finished}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
