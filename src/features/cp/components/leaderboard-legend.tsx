"use client";

import { cn } from "@/lib/utils";
import { useI18n } from "@/hooks/use-i18n";
import { LeaderboardProblemCell } from "@/features/cp/components/leaderboard-problem-cell";
import type { LeaderboardLegendProps } from "@/types/cp";

const EXAMPLE_WRONG_BEFORE = 2;
const EXAMPLE_WRONG = 3;

// Key for the per-problem cells, shown under the leaderboard.
export function LeaderboardLegend({ size = "default", className }: LeaderboardLegendProps) {
  const { t } = useI18n();
  const items = [
    { status: { solved: true, wrong: 0 }, label: t("cp.contest.legend.solved") },
    { status: { solved: true, wrong: EXAMPLE_WRONG_BEFORE }, label: t("cp.contest.legend.solvedAfter", { count: EXAMPLE_WRONG_BEFORE }) },
    { status: { solved: false, wrong: EXAMPLE_WRONG }, label: t("cp.contest.legend.wrongOnly", { count: EXAMPLE_WRONG }) },
    { status: null, label: t("cp.contest.legend.notTried") },
  ];

  return (
    <ul
      aria-label={t("cp.contest.legend.label")}
      className={cn(
        "text-muted-foreground flex flex-wrap items-center gap-x-5 gap-y-2",
        size === "lg" ? "text-base" : "text-xs",
        className,
      )}
    >
      {items.map((item) => (
        <li key={item.label} className="inline-flex items-center gap-2">
          <span aria-hidden className="contents">
            <LeaderboardProblemCell status={item.status} size={size} />
          </span>
          {item.label}
        </li>
      ))}
    </ul>
  );
}
