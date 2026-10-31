"use client";

import { ArrowRightIcon, CheckIcon, EqualIcon, OctagonXIcon, XIcon } from "lucide-react";
import { useI18n } from "@/hooks/use-i18n";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { LoOutcomeBadge } from "@/features/rally/components/lo-outcome-badge";
import { LoUndoButton } from "@/features/rally/components/lo-undo-button";
import type { LoTeamStepProps } from "@/types/rally";

const BIG = "h-16 w-full text-lg [&_svg]:size-5";

export function LoTeamStep({ post, team, saving, error, onRecord, onUndo, onNext }: LoTeamStepProps) {
  const { t } = useI18n();
  const busy = saving !== null;

  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center">
        <p className="text-muted-foreground text-sm">{t("rally.lo.confirmTeam")}</p>
        <p className="font-heading text-3xl font-bold tracking-tight break-words">{team.team_name}</p>
        {team.school && <p className="text-lg">{team.school}</p>}
      </div>

      {error && (
        <Alert variant="destructive">
          <OctagonXIcon />
          <AlertTitle>{t(error)}</AlertTitle>
        </Alert>
      )}

      {team.result_id && team.outcome && team.points !== null ? (
        <>
          <Alert>
            <CheckIcon />
            <AlertTitle>{t("rally.lo.alreadyTitle")}</AlertTitle>
            <AlertDescription className="space-y-2">
              <p>{t(team.undo_until ? "rally.lo.alreadyOwn" : "rally.lo.alreadyOther")}</p>
              <LoOutcomeBadge outcome={team.outcome} points={team.points} />
            </AlertDescription>
          </Alert>
          <div className="flex flex-wrap justify-center gap-2">
            {team.undo_until && <LoUndoButton until={team.undo_until} pending={false} onUndo={() => onUndo(team.result_id!)} />}
            <Button onClick={onNext}>
              {t("rally.lo.nextTeam")}
              <ArrowRightIcon />
            </Button>
          </div>
        </>
      ) : (
        <>
          <div className="grid gap-3">
            <Button className={BIG} disabled={busy} onClick={() => onRecord("win")}>
              {saving === "win" ? <Spinner /> : <CheckIcon />}
              {t("rally.outcome.win")} · {t("rally.lo.points", { points: post.points_win })}
            </Button>
            <Button className={BIG} variant="destructive" disabled={busy} onClick={() => onRecord("lose")}>
              {saving === "lose" ? <Spinner /> : <XIcon />}
              {t("rally.outcome.lose")} · {t("rally.lo.points", { points: post.points_lose })}
            </Button>
            {post.allow_draw && (
              <Button className={BIG} variant="secondary" disabled={busy} onClick={() => onRecord("draw")}>
                {saving === "draw" ? <Spinner /> : <EqualIcon />}
                {t("rally.outcome.draw")} · {t("rally.lo.points", { points: post.points_draw })}
              </Button>
            )}
          </div>
          <Button variant="ghost" className="w-full" disabled={busy} onClick={onNext}>
            {t("rally.lo.wrongTeam")}
          </Button>
        </>
      )}
    </div>
  );
}
