"use client";

import { useEffect, useRef } from "react";
import { subscribeAuthed } from "@/lib/supabase/realtime";
import type { CpSessionStatus } from "@/types/cp";

// Calls `onStatus` whenever the admin starts, ends or resets this competition's contest.
export function useCpSessionRealtime(competitionId: string, onStatus: (status: CpSessionStatus) => void) {
  const callback = useRef(onStatus);
  useEffect(() => {
    callback.current = onStatus;
  });

  useEffect(() => {
    return subscribeAuthed(`cp-session:${competitionId}`, (channel) =>
      channel.on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "cp_sessions", filter: `competition_id=eq.${competitionId}` },
        (payload) => callback.current((payload.new as { status: CpSessionStatus }).status),
      ),
    );
  }, [competitionId]);
}
