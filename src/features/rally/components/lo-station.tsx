"use client";

import { useState } from "react";
import { DoorClosedIcon, HourglassIcon } from "lucide-react";
import { useFeedbackAudioUnlock } from "@/hooks/use-feedback-audio-unlock";
import { useI18n } from "@/hooks/use-i18n";
import { useRallySessionRealtime } from "@/hooks/use-rally-session-realtime";
import { useRallyStation } from "@/hooks/use-rally-station";
import { Badge } from "@/components/ui/badge";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { LoRecentResults } from "@/features/rally/components/lo-recent-results";
import { LoSavedStep } from "@/features/rally/components/lo-saved-step";
import { LoScanStep } from "@/features/rally/components/lo-scan-step";
import { LoTeamStep } from "@/features/rally/components/lo-team-step";
import type { LoStationProps } from "@/types/rally";

export function LoStation({ post, recent, sessionStatus }: LoStationProps) {
  const { t } = useI18n();
  const [status, setStatus] = useState(sessionStatus);
  const { view, error, lookUp, record, undoSaved, undoExisting, reset } = useRallyStation(post.id);
  useFeedbackAudioUnlock();

  // The admin opens and closes the session from their own screen; the LO sees it at once.
  useRallySessionRealtime(post.competition_id, (session) => {
    setStatus(session.status);
    if (session.status !== "open") reset();
  });

  if (status !== "open") {
    const Icon = status === "closed" ? DoorClosedIcon : HourglassIcon;
    return (
      <div className="space-y-8">
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Icon />
            </EmptyMedia>
            <EmptyTitle>{t(`rally.session.status.${status}`)}</EmptyTitle>
            <EmptyDescription>{t(`rally.session.loHint.${status}`)}</EmptyDescription>
          </EmptyHeader>
        </Empty>
        <LoRecentResults results={recent} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-center">
        <Badge>{t("rally.session.status.open")}</Badge>
      </div>
      {(view.step === "scan" || view.step === "looking") && <LoScanStep busy={view.step === "looking"} error={error} onCode={lookUp} />}
      {view.step === "team" && (
        <LoTeamStep post={post} team={view.team} saving={view.saving} error={error} onRecord={record} onUndo={undoExisting} onNext={reset} />
      )}
      {view.step === "saved" && (
        <LoSavedStep team={view.team} result={view.result} undoing={view.undoing} error={error} onUndo={undoSaved} onNext={reset} />
      )}
      {view.step === "scan" && <LoRecentResults results={recent} />}
    </div>
  );
}
