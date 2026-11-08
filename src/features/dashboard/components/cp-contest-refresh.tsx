"use client";

import { useRouter } from "next/navigation";
import { useCpSessionRealtime } from "@/hooks/use-cp-session-realtime";
import type { CpContestRefreshProps } from "@/types/registration";

// Renders nothing. While the contest has not started, refreshes the dashboard as soon as the admin starts it, so
// the "Go to contest" button appears without a reload.
export function CpContestRefresh({ competitionId }: CpContestRefreshProps) {
  const router = useRouter();
  useCpSessionRealtime(competitionId, (status) => {
    if (status !== "scheduled") router.refresh();
  });
  return null;
}
