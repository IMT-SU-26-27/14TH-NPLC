import { AppWindowIcon, PanelsTopLeftIcon, ShrinkIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { FocusKindBadgeProps } from "@/types/cp";

const ICONS = {
  tab_hidden: PanelsTopLeftIcon,
  window_blur: AppWindowIcon,
  fullscreen_exit: ShrinkIcon,
} as const;

// Neutral on purpose: leaving the page is a record for the committee to judge, not a verdict.
export function FocusKindBadge({ kind, label }: FocusKindBadgeProps) {
  const Icon = ICONS[kind];
  return (
    <Badge variant="outline">
      <Icon />
      {label}
    </Badge>
  );
}
