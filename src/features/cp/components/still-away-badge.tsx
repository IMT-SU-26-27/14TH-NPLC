import { Badge } from "@/components/ui/badge";
import type { StillAwayBadgeProps } from "@/types/cp";

// A participant who left the contest page and has not come back yet.
export function StillAwayBadge({ label }: StillAwayBadgeProps) {
  return (
    <Badge variant="outline" className="border-warning/40 text-warning">
      {label}
    </Badge>
  );
}
