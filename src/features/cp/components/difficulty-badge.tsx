import { Badge } from "@/components/ui/badge";
import type { DifficultyBadgeProps } from "@/types/cp";

const DIFFICULTY_CLASS = {
  easy: "border-success/50 text-success",
  medium: "border-warning/50 text-warning",
  hard: "border-destructive/50 text-destructive",
} as const;

// The label is passed in so the badge works in both server (getT) and client (useI18n) components.
export function DifficultyBadge({ difficulty, label }: DifficultyBadgeProps) {
  return (
    <Badge variant="outline" className={DIFFICULTY_CLASS[difficulty]}>
      {label}
    </Badge>
  );
}
