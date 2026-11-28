"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { answerTeamDevice, syncTeamDevice } from "@/lib/actions/team-device";
import type { TeamDeviceState, TeamDeviceStatus } from "@/types/team-device";

// How often each state checks in. The active device's beat also keeps it from counting as offline (90 s on the
// server), and brings in a waiting request; a device waiting for an answer checks often so it gets in quickly.
const INTERVAL_MS: Record<TeamDeviceStatus, number> = {
  active: 10_000,
  waiting: 3_000,
  blocked: 15_000,
  rejected: 15_000,
  expired: 15_000,
  off: 60_000,
};

const UNKNOWN: TeamDeviceState = {
  status: "off",
  holderName: null,
  holderLabel: null,
  holderSince: null,
  requestName: null,
  requestLabel: null,
  requestAt: null,
};

// This browser's hold on its team. state is null until the first answer; a failed check keeps the last state, so a
// network hiccup never locks a device out.
export function useTeamDevice(competitionId: string) {
  const [state, setState] = useState<TeamDeviceState | null>(null);
  const [movedAway, setMovedAway] = useState(false);
  const statusRef = useRef<TeamDeviceStatus | null>(null);

  const apply = useCallback((next: TeamDeviceState) => {
    const before = statusRef.current;
    statusRef.current = next.status;
    if (next.status === "active" || next.status === "off") setMovedAway(false);
    else if (before === "active") setMovedAway(true);
    setState(next);
  }, []);

  const sync = useCallback(
    async (request: boolean) => {
      const result = await syncTeamDevice(competitionId, request).catch(() => null);
      if (result?.ok) apply(result.data);
      // The very first check failed: open the page rather than leave it on a placeholder; Run and Submit are still
      // refused on the server while another device holds the team.
      else if (statusRef.current === null) apply(UNKNOWN);
    },
    [competitionId, apply],
  );

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    let stopped = false;

    const beat = async () => {
      clearTimeout(timer);
      await sync(false);
      if (stopped) return;
      timer = setTimeout(beat, INTERVAL_MS[statusRef.current ?? "active"]);
    };

    // Browsers slow timers in hidden tabs; check in as soon as the page is visible again.
    const onVisible = () => {
      if (!document.hidden) void beat();
    };

    void beat();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      stopped = true;
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [sync]);

  const request = useCallback(() => sync(true), [sync]);

  const answer = useCallback(
    async (approve: boolean) => {
      await answerTeamDevice({ competitionId, approve }).catch(() => null);
      await sync(false);
    },
    [competitionId, sync],
  );

  return { state, movedAway, request, answer };
}
