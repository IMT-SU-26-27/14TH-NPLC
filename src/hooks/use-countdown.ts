"use client";

import { useEffect, useState } from "react";

// Whole seconds until `target` (never negative), ticking every second; null until mounted or without a target.
// offsetMs corrects the device clock (useServerClockOffset), so the countdown follows the server.
export function useCountdown(target: string | null, offsetMs = 0): number | null {
  const [left, setLeft] = useState<number | null>(null);

  useEffect(() => {
    if (!target) return;
    const end = new Date(target).getTime();
    const tick = () => setLeft(Math.max(0, Math.round((end - Date.now() - offsetMs) / 1000)));
    const first = setTimeout(tick, 0);
    const id = setInterval(tick, 1000);
    return () => {
      clearTimeout(first);
      clearInterval(id);
    };
  }, [target, offsetMs]);

  return target ? left : null;
}
