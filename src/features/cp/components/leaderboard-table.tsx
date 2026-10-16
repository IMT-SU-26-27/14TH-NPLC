"use client";

import { TrophyIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDateTime, formatScore } from "@/lib/format";
import { useI18n } from "@/hooks/use-i18n";
import { useLeaderboardRealtime } from "@/hooks/use-leaderboard-realtime";
import { Badge } from "@/components/ui/badge";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { LeaderboardTableProps } from "@/types/cp";

export function LeaderboardTable({ initialRows, competitionId, highlightRegistrationId }: LeaderboardTableProps) {
  const { t, lang } = useI18n();
  const { rows, changedId } = useLeaderboardRealtime(competitionId, initialRows);

  if (rows.length === 0) {
    return (
      <Empty className="border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <TrophyIcon />
          </EmptyMedia>
          <EmptyTitle>{t("cp.noScores")}</EmptyTitle>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="bg-card overflow-hidden rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">{t("cp.rank")}</TableHead>
            <TableHead>{t("cp.team")}</TableHead>
            <TableHead className="text-right">{t("cp.solvedCount")}</TableHead>
            <TableHead className="text-right">{t("cp.totalPoints")}</TableHead>
            <TableHead className="max-sm:hidden">{t("cp.lastImprovement")}</TableHead>
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
              <TableCell className="font-medium">
                {row.team_name}
                {row.registration_id === highlightRegistrationId && (
                  <Badge variant="outline" className="ml-2">
                    {t("cp.yourTeam")}
                  </Badge>
                )}
              </TableCell>
              <TableCell className="text-right tabular-nums">{row.solved}</TableCell>
              <TableCell className="text-right font-semibold tabular-nums">{formatScore(Number(row.total_points), lang)}</TableCell>
              <TableCell className="text-muted-foreground text-xs max-sm:hidden">{formatDateTime(row.last_improved_at, lang)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
