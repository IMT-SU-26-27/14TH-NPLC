"use client";

import { useTeamDevice } from "@/hooks/use-team-device";
import { Skeleton } from "@/components/ui/skeleton";
import { TeamDeviceLockScreen } from "@/features/cp/components/team-device-lock-screen";
import { TeamDeviceRequestDialog } from "@/features/cp/components/team-device-request-dialog";
import type { TeamDeviceGuardProps } from "@/types/team-device";

// One device per team. A device that does not hold the team gets the lock screen in place of the contest pages, and
// its leave-the-page monitor never runs (it would record events for the team). Until the first check answers, the
// pages render hidden and inert behind a placeholder, so they neither flash nor remount once the check is in.
// This is a screen, not the enforcement: Run and Submit are refused on the server for any other device.
export function TeamDeviceGuard({ competitionId, monitor, children }: TeamDeviceGuardProps) {
  const { state, movedAway, request, answer } = useTeamDevice(competitionId);

  if (state !== null && state.status !== "active" && state.status !== "off") {
    return <TeamDeviceLockScreen state={state} movedAway={movedAway} onRequest={request} />;
  }

  const checking = state === null;
  return (
    <>
      {checking && <Skeleton className="mx-auto mt-8 h-96 w-full max-w-6xl" />}
      {!checking && monitor}
      {state?.status === "active" && state.requestAt !== null && <TeamDeviceRequestDialog state={state} onAnswer={answer} />}
      <div className={checking ? "hidden" : "contents"} inert={checking}>
        {children}
      </div>
    </>
  );
}
