"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SnowflakeIcon, TrophyIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDateTime, formatScore } from "@/lib/format";
import { useCpSessionRealtime } from "@/hooks/use-cp-session-realtime";
import { useI18n } from "@/hooks/use-i18n";
import { useLeaderboardRealtime } from "@/hooks/use-leaderboard-realtime";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TablePagination } from "@/components/shared/table-pagination";
import type { LeaderboardTableProps } from "@/types/cp";

const PAGE_SIZE = 10;

export function LeaderboardTable({ initialRows, competitionId, highlightRegistrationId, viewer, frozenAt }: LeaderboardTableProps) {
  const { t, lang, href } = useI18n();
  const router = useRouter();
  const participantFrozen = viewer === "participant" && !!frozenAt;
  const { rows, changedId } = useLeaderboardRealtime(competitionId, initialRows, !participantFrozen);

  // Start on the page that holds the viewer's own team.
  const [page, setPage] = useState(() => {
    const own = initialRows.findIndex((r) => r.registration_id === highlightRegistrationId);
    return own < 0 ? 1 : Math.floor(own / PAGE_SIZE) + 1;
  });

  // Freeze, unfreeze or the end of the contest: reload the standings from the server.
  // Participants leave once the contest ends, because the final standings are not shown to them.
  useCpSessionRealtime(competitionId, (status) => {
    if (viewer === "participant" && status === "ended") window.location.replace(href("/cp/waiting"));
    else router.refresh();
  });

  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const current = Math.min(page, pageCount);
  const start = (current - 1) * PAGE_SIZE;
  const visible = rows.slice(start, start + PAGE_SIZE);

  const notice = frozenAt && (
    <Alert>
      <SnowflakeIcon />
      <AlertTitle>{viewer === "admin" ? t("cp.frozenAdminTitle") : t("cp.frozenTitle")}</AlertTitle>
      <AlertDescription>
        {t(viewer === "admin" ? "cp.frozenAdmin" : "cp.frozen", { date: formatDateTime(frozenAt, lang) })}
      </AlertDescription>
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
            <EmptyTitle>{t("cp.noScores")}</EmptyTitle>
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
              <TableHead className="w-12">{t("cp.rank")}</TableHead>
              <TableHead>{t("cp.team")}</TableHead>
              <TableHead className="text-right">{t("cp.solvedCount")}</TableHead>
              <TableHead className="text-right">{t("cp.totalPoints")}</TableHead>
              <TableHead className="max-sm:hidden">{t("cp.lastImprovement")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.map((row, i) => (
              <TableRow
                key={row.registration_id}
                data-state={row.registration_id === highlightRegistrationId ? "selected" : undefined}
                className={cn(row.registration_id === changedId && "animate-in fade-in-0 duration-700")}
              >
                <TableCell className="font-medium tabular-nums">{start + i + 1}</TableCell>
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
      <TablePagination
        page={current}
        pageCount={pageCount}
        hrefFor={(p) => `?page=${p}`}
        onSelect={setPage}
        summary={t("cp.leaderboardSummary", { count: rows.length, page: current, pages: pageCount })}
        previousLabel={t("common.previous")}
        nextLabel={t("common.next")}
      />
    </div>
  );
}
