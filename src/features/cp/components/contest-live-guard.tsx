"use client";

import { toast } from "sonner";
import { useCpSessionRealtime } from "@/hooks/use-cp-session-realtime";
import { useI18n } from "@/hooks/use-i18n";
import type { ContestStatusProps } from "@/types/cp";

// Renders nothing; sends everyone back to the waiting room the moment the admin pauses, ends or resets the contest.
// Editor drafts are kept in localStorage (use-code-editor), so nothing typed is lost.
export function ContestLiveGuard({ competitionId }: ContestStatusProps) {
  const { t, href } = useI18n();

  useCpSessionRealtime(competitionId, (status) => {
    if (status !== "live") {
      toast.info(t(status === "paused" ? "cp.waiting.pausedToast" : "cp.waiting.endedToast"));
      // Full page load so the proxy re-checks the contest status instead of a cached route.
      window.location.replace(href("/cp/waiting"));
    }
  });

  return null;
}
