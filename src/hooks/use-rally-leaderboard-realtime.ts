"use client";

import { useEffect, useState } from "react";
import { rankRallyScores } from "@/lib/rally/ranking";
import { subscribeAuthed } from "@/lib/supabase/realtime";
import type { RallyScore } from "@/types/rally";

// Live leaderboard: applies changes to rally_scores as they happen.
// Off for participants while frozen, because they see the snapshot.
export function useRallyLeaderboardRealtime(competitionId: string, initialRows: RallyScore[], enabled: boolean) {
  const [rows, setRows] = useState(() => rankRallyScores(initialRows));
  const [changedId, setChangedId] = useState<string | null>(null);
  const [previousInitial, setPreviousInitial] = useState(initialRows);

  // A refresh from the server (freeze or unfreeze) replaces the list.
  if (previousInitial !== initialRows) {
    setPreviousInitial(initialRows);
    setRows(rankRallyScores(initialRows));
  }

  useEffect(() => {
    if (!enabled) return;
    return subscribeAuthed(`rally-scores:${competitionId}`, (channel) =>
      channel.on(
        "postgres_changes",
        { event: "*", schema: "public", table: "rally_scores", filter: `competition_id=eq.${competitionId}` },
        (payload) => {
          if (payload.eventType === "DELETE") {
            const id = (payload.old as { registration_id: string }).registration_id;
            setRows((current) => current.filter((r) => r.registration_id !== id));
            return;
          }
          const row = payload.new as RallyScore;
          setRows((current) => rankRallyScores([...current.filter((r) => r.registration_id !== row.registration_id), row]));
          setChangedId(row.registration_id);
        },
      ),
    );
  }, [competitionId, enabled]);

  return { rows, changedId };
}
