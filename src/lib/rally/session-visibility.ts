import type { RallySessionStatus } from "@/types/rally";

// What participants see of the Rally, by session status. The one place these rules live: the dashboard and the
// proxy both use them. Admins and LOs are not affected.

// The team QR is only needed while LOs scan at the posts, i.e. while the session is open.
export function rallyQrVisible(status: RallySessionStatus | null): boolean {
  return status === "open";
}

// The leaderboard opens with the session and stays open after it closes, for the final standings.
export function rallyLeaderboardOpen(status: RallySessionStatus | null): boolean {
  return status !== null && status !== "not_open";
}
