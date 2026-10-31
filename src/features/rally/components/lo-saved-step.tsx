"use client";

import { ArrowRightIcon, CheckCircle2Icon, OctagonXIcon } from "lucide-react";
import { useI18n } from "@/hooks/use-i18n";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { LoOutcomeBadge } from "@/features/rally/components/lo-outcome-badge";
import { LoUndoButton } from "@/features/rally/components/lo-undo-button";
import type { LoSavedStepProps } from "@/types/rally";

export function LoSavedStep({ team, result, undoing, error, onUndo, onNext }: LoSavedStepProps) {
  const { t } = useI18n();

  return (
    <div className="space-y-6 text-center" aria-live="polite">
      <div className="flex flex-col items-center gap-3">
        <CheckCircle2Icon className="text-success size-16" />
        <p className="font-heading text-2xl font-bold">{t("rally.lo.saved")}</p>
        <p className="font-heading text-xl font-semibold break-words">{team.team_name}</p>
        <LoOutcomeBadge outcome={result.outcome} points={result.points} />
      </div>

      {error && (
        <Alert variant="destructive" className="text-left">
          <OctagonXIcon />
          <AlertTitle>{t(error)}</AlertTitle>
        </Alert>
      )}

      <div className="flex flex-col gap-3">
        <Button className="h-14 w-full text-base" onClick={onNext}>
          {t("rally.lo.nextTeam")}
          <ArrowRightIcon />
        </Button>
        <div className="flex justify-center">
          <LoUndoButton until={result.undo_until} pending={undoing} onUndo={onUndo} />
        </div>
      </div>
    </div>
  );
}
