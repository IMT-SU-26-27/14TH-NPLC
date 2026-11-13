import type { ContestBarStatus, CpSession } from "@/types/cp";

// The contest bar's status badge for a session (and the viewer's team).
export function contestBarStatus(
  session: Pick<CpSession, "status" | "scheduled_start_at">,
  disqualified = false,
): ContestBarStatus {
  if (disqualified) return "disqualified";
  if (session.status === "scheduled") return session.scheduled_start_at ? "scheduled" : "unscheduled";
  return session.status;
}
