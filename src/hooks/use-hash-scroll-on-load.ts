"use client";

import { useEffect } from "react";

// Opening the homepage at /id#lomba: the browser's own jump can run before the streamed sections are in place, or
// be lost during hydration, so jump to the hash once more after the page has loaded. Instant, like the browser's.
export function useHashScrollOnLoad() {
  useEffect(() => {
    const jump = () => {
      const id = decodeURIComponent(window.location.hash.slice(1));
      if (id) document.getElementById(id)?.scrollIntoView({ block: "start" });
    };
    if (document.readyState === "complete") {
      const frame = requestAnimationFrame(jump);
      return () => cancelAnimationFrame(frame);
    }
    window.addEventListener("load", jump, { once: true });
    return () => window.removeEventListener("load", jump);
  }, []);
}
