"use client";

import { useFeedbackAudioUnlock } from "@/hooks/use-feedback-audio-unlock";
import { useRallyStation } from "@/hooks/use-rally-station";
import { LoRecentResults } from "@/features/rally/components/lo-recent-results";
import { LoSavedStep } from "@/features/rally/components/lo-saved-step";
import { LoScanStep } from "@/features/rally/components/lo-scan-step";
import { LoTeamStep } from "@/features/rally/components/lo-team-step";
import type { LoStationProps } from "@/types/rally";

export function LoStation({ post, recent }: LoStationProps) {
  const { view, error, lookUp, record, undoSaved, undoExisting, reset } = useRallyStation(post.id);
  useFeedbackAudioUnlock();

  return (
    <div className="space-y-8">
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
