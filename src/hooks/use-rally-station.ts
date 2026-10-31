"use client";

import { useState, useTransition } from "react";
import { lookupRallyTeam, recordRallyResult, undoRallyResult } from "@/lib/actions/rally";
import { feedbackError, feedbackRead, feedbackSaved, feedbackUndone } from "@/lib/rally/feedback";
import type { RallyOutcome, RallyStationView } from "@/types/rally";

// The LO's flow at one post: scan, confirm the team, record, then undo or move to the next team.
// The request id stays the same for one team, so retrying after a dropped connection can't record twice.
export function useRallyStation(postId: string) {
  const [view, setView] = useState<RallyStationView>({ step: "scan" });
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function fail(message: string) {
    feedbackError();
    setError(message);
  }

  function reset() {
    setError(null);
    setView({ step: "scan" });
  }

  function lookUp(code: string) {
    if (view.step !== "scan") return;
    feedbackRead();
    setError(null);
    setView({ step: "looking" });
    startTransition(async () => {
      try {
        const found = await lookupRallyTeam({ postId, code });
        if (found.ok) setView({ step: "team", team: found.data, requestId: crypto.randomUUID(), saving: null });
        else {
          fail(found.message);
          setView({ step: "scan" });
        }
      } catch {
        fail("rally.lo.connectionError");
        setView({ step: "scan" });
      }
    });
  }

  function record(outcome: RallyOutcome) {
    if (view.step !== "team" || view.saving) return;
    const current = view;
    setError(null);
    setView({ ...current, saving: outcome });
    startTransition(async () => {
      try {
        const saved = await recordRallyResult({ postId, registrationId: current.team.registration_id, outcome, clientRequestId: current.requestId });
        if (saved.ok) {
          feedbackSaved();
          setView({ step: "saved", team: current.team, result: saved.data, undoing: false });
        } else {
          fail(saved.message);
          setView(current);
        }
      } catch {
        fail("rally.lo.connectionError");
        setView(current);
      }
    });
  }

  function undoSaved() {
    if (view.step !== "saved" || view.undoing) return;
    const current = view;
    setError(null);
    setView({ ...current, undoing: true });
    startTransition(async () => {
      try {
        const undone = await undoRallyResult(current.result.result_id);
        if (undone.ok) {
          feedbackUndone();
          // Back to the same team with a new request id, so the LO can press the right button.
          setView({ step: "team", team: { ...current.team, result_id: null, outcome: null, points: null, recorded_at: null, undo_until: null }, requestId: crypto.randomUUID(), saving: null });
        } else {
          fail(undone.message);
          setView(current);
        }
      } catch {
        fail("rally.lo.connectionError");
        setView(current);
      }
    });
  }

  // Undo a result found by scanning again, or from the list of latest results.
  function undoExisting(resultId: string) {
    setError(null);
    startTransition(async () => {
      try {
        const undone = await undoRallyResult(resultId);
        if (undone.ok) {
          feedbackUndone();
          setView((now) =>
            now.step === "team" && now.team.result_id === resultId
              ? { ...now, team: { ...now.team, result_id: null, outcome: null, points: null, recorded_at: null, undo_until: null }, requestId: crypto.randomUUID() }
              : now,
          );
        } else fail(undone.message);
      } catch {
        fail("rally.lo.connectionError");
      }
    });
  }

  return { view, error, lookUp, record, undoSaved, undoExisting, reset };
}
