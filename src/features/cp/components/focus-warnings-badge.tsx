import { Badge } from "@/components/ui/badge";
import { CP_FOCUS_WARNING_LIMIT } from "@/lib/validations/cp";
import type { FocusWarningsBadgeProps } from "@/types/cp";

// A team's warnings on Admin -> CP -> Activity: red once the limit is reached, amber below it.
export function FocusWarningsBadge({ count, label }: FocusWarningsBadgeProps) {
  if (count === 0) return <span className="text-muted-foreground tabular-nums">0</span>;
  if (count >= CP_FOCUS_WARNING_LIMIT) return <Badge variant="destructive">{label}</Badge>;
  return (
    <Badge variant="outline" className="border-warning/40 text-warning">
      {label}
    </Badge>
  );
}
