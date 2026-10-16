"use client";

import { useEffect, useState } from "react";
import { guideEntryFor, VERDICT_GUIDE_EVENT } from "@/lib/cp/verdict-guide";
import type { CpVerdict, VerdictGuideState } from "@/types/cp";

// Open state of the verdict guide sheet, plus the verdict to jump to when it was opened from a toast.
export function useVerdictGuide(): VerdictGuideState {
  const [open, setOpen] = useState(false);
  const [target, setTarget] = useState<CpVerdict | null>(null);

  useEffect(() => {
    function onRequest(event: Event) {
      const verdict = (event as CustomEvent<CpVerdict | undefined>).detail;
      setTarget(verdict ? guideEntryFor(verdict) : null);
      setOpen(true);
    }
    window.addEventListener(VERDICT_GUIDE_EVENT, onRequest);
    return () => window.removeEventListener(VERDICT_GUIDE_EVENT, onRequest);
  }, []);

  // Scroll the requested entry into view after the sheet's open animation and focus handling,
  // which would otherwise reset the scroll position.
  useEffect(() => {
    if (!open || !target) return;
    const timer = window.setTimeout(() => {
      const entry = document.getElementById(`verdict-guide-${target}`);
      entry?.scrollIntoView({ block: "start" });
      // Move focus too, so keyboard and screen-reader users land on the entry.
      entry?.focus({ preventScroll: true });
    }, 250);
    return () => window.clearTimeout(timer);
  }, [open, target]);

  function onOpenChange(next: boolean) {
    setOpen(next);
    if (!next) setTarget(null);
  }

  return { open, target, onOpenChange };
}
