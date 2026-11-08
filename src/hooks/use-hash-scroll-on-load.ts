"use client";

import { useEffect } from "react";
import { documentNavigationType } from "@/lib/navigation-type";

const INPUT_EVENTS = ["wheel", "touchstart", "pointerdown", "keydown"] as const;

// Opening the homepage at /id#lomba: the browser's own jump can run before the streamed sections are in place, or
// be lost during hydration, so jump to the hash once more after the page has loaded. Instant, like the browser's.
// Only while the visitor has not moved: no scroll, click, touch or key since the page opened, and still at the top
// (a page already scrolled was either moved by the visitor before hydration or reached the section itself).
// Only for a fresh visit: on a reload or back/forward the visitor's own position is restored instead.
export function useHashScrollOnLoad() {
  useEffect(() => {
    if (documentNavigationType() !== "navigate") return;
    let touched = false;
    const markTouched = () => {
      touched = true;
    };
    for (const type of INPUT_EVENTS) window.addEventListener(type, markTouched, { passive: true, once: true });

    const jump = () => {
      const id = decodeURIComponent(window.location.hash.slice(1));
      if (!id || touched || window.scrollY !== 0) return;
      document.getElementById(id)?.scrollIntoView({ block: "start" });
    };

    let frame = 0;
    if (document.readyState === "complete") frame = requestAnimationFrame(jump);
    else window.addEventListener("load", jump, { once: true });

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("load", jump);
      for (const type of INPUT_EVENTS) window.removeEventListener(type, markTouched);
    };
  }, []);
}
