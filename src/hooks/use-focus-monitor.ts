"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { closeOpenFocusEvents, recordFocusLeave, recordFocusReturn } from "@/lib/actions/cp-focus";
import type { CpFocusKind, FocusAwayState } from "@/types/cp";

// Leaving for less than this is a flicker (a dialog of the browser itself, a focus bounce), not a decision.
const SETTLE_MS = 150;

function subscribeFullscreen(onChange: () => void) {
  document.addEventListener("fullscreenchange", onChange);
  return () => document.removeEventListener("fullscreenchange", onChange);
}

// Records every time the participant leaves the contest page while it is enabled (live contest pages only):
// the page hidden (another tab, minimised), the browser losing focus (another app or window), and time spent
// outside fullscreen. The server ignores it unless the team's contest is live, and admins read it in Admin -> CP.
export function useFocusMonitor(enabled: boolean, problemId: string | null, onReturn: (kind: CpFocusKind, ms: number) => void) {
  // Assume fullscreen on the server so the banner never flashes before hydration.
  const fullscreen = useSyncExternalStore(
    subscribeFullscreen,
    () => document.fullscreenElement !== null,
    () => true,
  );

  const problemRef = useRef(problemId);
  const onReturnRef = useRef(onReturn);
  useEffect(() => {
    problemRef.current = problemId;
    onReturnRef.current = onReturn;
  });

  useEffect(() => {
    if (!enabled) return;

    // Close anything left open by an earlier load first, so it cannot close the rows this load opens.
    const ready = closeOpenFocusEvents().catch(() => undefined);
    let away: FocusAwayState | null = null;
    let outsideFullscreen: FocusAwayState | null = null;
    let settle: ReturnType<typeof setTimeout> | undefined;

    const start = (kind: CpFocusKind): FocusAwayState => ({
      kind,
      startedAt: Date.now(),
      id: ready
        .then(() => recordFocusLeave({ kind, problemId: problemRef.current }))
        .then((result) => (result.ok && result.data ? result.data.id : null))
        .catch(() => null),
    });

    const finish = (state: FocusAwayState) => {
      void state.id.then((id) => (id ? recordFocusReturn(id) : undefined)).catch(() => undefined);
      return Date.now() - state.startedAt;
    };

    const check = () => {
      const isAway = document.hidden || !document.hasFocus();
      if (isAway && !away) {
        clearTimeout(settle);
        settle = setTimeout(() => {
          if (!away && (document.hidden || !document.hasFocus())) away = start(document.hidden ? "tab_hidden" : "window_blur");
        }, SETTLE_MS);
      } else if (!isAway && away) {
        const left = away;
        away = null;
        onReturnRef.current(left.kind, finish(left));
      } else if (!isAway) {
        clearTimeout(settle);
      }
    };

    const checkFullscreen = () => {
      if (document.fullscreenElement && outsideFullscreen) {
        finish(outsideFullscreen);
        outsideFullscreen = null;
      } else if (!document.fullscreenElement && !outsideFullscreen) {
        outsideFullscreen = start("fullscreen_exit");
      }
    };

    checkFullscreen();
    check();
    document.addEventListener("visibilitychange", check);
    window.addEventListener("blur", check);
    window.addEventListener("focus", check);
    document.addEventListener("fullscreenchange", checkFullscreen);

    return () => {
      clearTimeout(settle);
      document.removeEventListener("visibilitychange", check);
      window.removeEventListener("blur", check);
      window.removeEventListener("focus", check);
      document.removeEventListener("fullscreenchange", checkFullscreen);
      if (away) finish(away);
      if (outsideFullscreen) finish(outsideFullscreen);
    };
  }, [enabled]);

  return {
    fullscreen,
    enterFullscreen: () => document.documentElement.requestFullscreen().catch(() => undefined),
  };
}
