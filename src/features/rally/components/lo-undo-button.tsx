"use client";

import { Undo2Icon } from "lucide-react";
import { formatDuration } from "@/lib/format";
import { useCountdown } from "@/hooks/use-countdown";
import { useI18n } from "@/hooks/use-i18n";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import type { LoUndoButtonProps } from "@/types/rally";

// Hidden once the window has passed: only an admin can change the result from then on.
export function LoUndoButton({ until, pending, onUndo }: LoUndoButtonProps) {
  const { t, lang } = useI18n();
  const left = useCountdown(until);
  if (left === null || left <= 0) return null;

  return (
    <Button variant="outline" className="w-full tabular-nums" onClick={onUndo} disabled={pending}>
      {pending ? <Spinner /> : <Undo2Icon />}
      {t("rally.lo.undo", { time: formatDuration(left, lang) })}
    </Button>
  );
}
