import { getCurrentUser } from "@/lib/data/auth";
import { getOwnCpCompetitionId } from "@/lib/data/cp";
import { ContestFocusMonitor } from "@/features/cp/components/contest-focus-monitor";
import { TeamDeviceGuard } from "@/features/cp/components/team-device-guard";
import type { ContestAccessGateProps } from "@/types/team-device";

// Participants get the leave-the-page monitor and, with an accepted team, the one-device-per-team lock; admins
// previewing the contest get neither.
export async function ContestAccessGate({ children }: ContestAccessGateProps) {
  const user = await getCurrentUser();
  if (!user || user.role === "admin") return children;

  const competitionId = await getOwnCpCompetitionId();
  if (!competitionId) {
    return (
      <>
        <ContestFocusMonitor />
        {children}
      </>
    );
  }
  return (
    <TeamDeviceGuard competitionId={competitionId} monitor={<ContestFocusMonitor />}>
      {children}
    </TeamDeviceGuard>
  );
}
