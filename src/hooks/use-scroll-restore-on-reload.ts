"use client";

import { useEffect } from "react";
import { documentNavigationType } from "@/lib/navigation-type";

const KEY = "nplc:scroll:";
const INPUT_EVENTS = ["wheel", "touchstart", "pointerdown", "keydown"] as const;

// Keeps the visitor's place when they reload the homepage. The browser restores the position itself, but on this
// streamed page it can do so while the sections are still placeholders and land at the top or past the spot. The
// last position is kept per page in sessionStorage and put back once the page has loaded, only if the browser
// missed it and the visitor has not moved since. Back/forward is left to the browser.
export function useScrollRestoreOnReload() {
  useEffect(() => {
    const key = KEY + window.location.pathname + window.location.search;
    const save = () => {
      try {
        sessionStorage.setItem(key, String(Math.round(window.scrollY)));
      } catch {
        // Storage blocked (private mode): the browser's own restore still applies.
      }
    };
    window.addEventListener("pagehide", save);

    let saved: number | null = null;
    if (documentNavigationType() === "reload") {
      try {
        const raw = sessionStorage.getItem(key);
        saved = raw === null ? null : Number(raw);
      } catch {
        saved = null;
      }
    }

    let touched = false;
    const markTouched = () => {
      touched = true;
    };
    const restore = () => {
      if (saved === null || !Number.isFinite(saved) || touched) return;
      if (Math.abs(window.scrollY - saved) > 2) window.scrollTo({ top: saved, behavior: "instant" });
    };

    let frame = 0;
    if (saved !== null) {
      for (const type of INPUT_EVENTS) window.addEventListener(type, markTouched, { passive: true, once: true });
      if (document.readyState === "complete") frame = requestAnimationFrame(restore);
      else window.addEventListener("load", restore, { once: true });
    }

    return () => {
      window.removeEventListener("pagehide", save);
      cancelAnimationFrame(frame);
      window.removeEventListener("load", restore);
      for (const type of INPUT_EVENTS) window.removeEventListener(type, markTouched);
    };
  }, []);
}
