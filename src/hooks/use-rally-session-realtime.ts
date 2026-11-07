"use client";

import { useEffect, useRef } from "react";
import { subscribeAuthed } from "@/lib/supabase/realtime";
import type { RallySession } from "@/types/rally";

// Calls `onChange` whenever an admin opens or closes the session, or freezes the leaderboard.
export function useRallySessionRealtime(competitionId: string, onChange: (session: RallySession) => void) {
  const callback = useRef(onChange);
  useEffect(() => {
    callback.current = onChange;
  });

  useEffect(() => {
    return subscribeAuthed(`rally-session:${competitionId}`, (channel) =>
      channel.on(
        "postgres_changes",
        { event: "*", schema: "public", table: "rally_sessions", filter: `competition_id=eq.${competitionId}` },
        (payload) => {
          if (payload.eventType !== "DELETE") callback.current(payload.new as RallySession);
        },
      ),
    );
  }, [competitionId]);
}
