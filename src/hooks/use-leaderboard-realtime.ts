"use client";

import { useEffect, useState } from "react";
import { subscribeAuthed } from "@/lib/supabase/realtime";
import type { LeaderboardRow } from "@/types/cp";

function rank(rows: LeaderboardRow[]): LeaderboardRow[] {
  return [...rows].sort(
    (a, b) =>
      Number(b.total_points) - Number(a.total_points) ||
      (a.last_improved_at ?? "9999").localeCompare(b.last_improved_at ?? "9999") ||
      a.team_name.localeCompare(b.team_name),
  );
}

// Live leaderboard: applies inserts, updates and deletes on cp_scores as they happen.
export function useLeaderboardRealtime(competitionId: string, initialRows: LeaderboardRow[]) {
  const [rows, setRows] = useState(() => rank(initialRows));
  const [changedId, setChangedId] = useState<string | null>(null);

  useEffect(() => {
    return subscribeAuthed(`cp-scores:${competitionId}`, (channel) =>
      channel.on(
        "postgres_changes",
        { event: "*", schema: "public", table: "cp_scores", filter: `competition_id=eq.${competitionId}` },
        (payload) => {
          if (payload.eventType === "DELETE") {
            const id = (payload.old as { registration_id: string }).registration_id;
            setRows((current) => current.filter((r) => r.registration_id !== id));
            return;
          }
          const row = payload.new as LeaderboardRow;
          setRows((current) => rank([...current.filter((r) => r.registration_id !== row.registration_id), row]));
          setChangedId(row.registration_id);
        },
      ),
    );
  }, [competitionId]);

  return { rows, changedId };
}
