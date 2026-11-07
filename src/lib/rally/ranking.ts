import type { RallyScore } from "@/types/rally";

// Temporary rules until the Divisi Event decides. This is the only place the order is defined.
export const RALLY_FINALIST_COUNT = 4;

// Total points, then posts finished, then the earlier last result. The name only keeps the order stable.
export function rankRallyScores<T extends RallyScore>(rows: T[]): T[] {
  return [...rows].sort(
    (a, b) =>
      b.total_points - a.total_points ||
      b.posts_finished - a.posts_finished ||
      (a.last_result_at ?? "9999").localeCompare(b.last_result_at ?? "9999") ||
      a.team_name.localeCompare(b.team_name),
  );
}
