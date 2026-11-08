"use client";

import { useRouter } from "next/navigation";
import { useRallySessionRealtime } from "@/hooks/use-rally-session-realtime";
import type { RallySessionRefreshProps } from "@/types/registration";

// Renders nothing. When the admin opens or closes the Rally session, refreshes the dashboard so the team QR and the
// leaderboard button appear (or go) without a reload.
export function RallySessionRefresh({ competitionId, status }: RallySessionRefreshProps) {
  const router = useRouter();
  useRallySessionRealtime(competitionId, (session) => {
    if (session.status !== status) router.refresh();
  });
  return null;
}
