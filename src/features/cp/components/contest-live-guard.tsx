"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useCpSessionRealtime } from "@/hooks/use-cp-session-realtime";
import { useI18n } from "@/hooks/use-i18n";
import type { ContestStatusProps } from "@/types/cp";

// Renders nothing; sends everyone back to the waiting room the moment the admin ends or resets the contest.
export function ContestLiveGuard({ competitionId }: ContestStatusProps) {
  const router = useRouter();
  const { t, href } = useI18n();

  useCpSessionRealtime(competitionId, (status) => {
    if (status !== "live") {
      toast.info(t("cp.waiting.endedToast"));
      router.replace(href("/cp/waiting"));
    }
  });

  return null;
}
