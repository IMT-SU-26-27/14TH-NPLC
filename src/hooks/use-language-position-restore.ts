"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useI18n } from "@/hooks/use-i18n";
import { languagePositionHash, languagePositionTop, takeLanguagePosition } from "@/lib/language-switch";

const INPUT_EVENTS = ["wheel", "touchstart", "pointerdown", "keydown"] as const;
// Streamed sections can still grow after the page opens; keep the place for this long, unless the visitor moves.
const SETTLE_MS = 3000;

// After a language switch, puts the visitor back where they were: the same homepage section and offset (#lomba ↔
// #competitions), or the same fraction of any other page. Instant, no animation. The hash is swapped to the new
// language with replaceState, so the homepage's own hash handling (#38) has nothing to jump to.
export function useLanguagePositionRestore() {
  const pathname = usePathname();
  const { lang } = useI18n();

  useEffect(() => {
    const position = takeLanguagePosition(pathname);
    if (!position) return;

    const hash = languagePositionHash(position, lang);
    if (hash) window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}${hash}`);

    let touched = false;
    const markTouched = () => {
      touched = true;
    };
    for (const type of INPUT_EVENTS) window.addEventListener(type, markTouched, { passive: true, once: true });

    const apply = () => {
      if (touched) return;
      const top = languagePositionTop(position, lang);
      if (top !== null && Math.abs(window.scrollY - top) > 1) window.scrollTo({ top, behavior: "instant" });
    };
    apply();
    const observer = new ResizeObserver(apply);
    observer.observe(document.body);
    const stop = window.setTimeout(() => observer.disconnect(), SETTLE_MS);

    return () => {
      observer.disconnect();
      window.clearTimeout(stop);
      for (const type of INPUT_EVENTS) window.removeEventListener(type, markTouched);
    };
  }, [pathname, lang]);
}
