"use client";

import { useEffect, useState } from "react";

// Whole seconds until `target` (never negative), ticking every second; null until mounted or without a target.
export function useCountdown(target: string | null): number | null {
  const [left, setLeft] = useState<number | null>(null);

  useEffect(() => {
    if (!target) return;
    const end = new Date(target).getTime();
    const tick = () => setLeft(Math.max(0, Math.round((end - Date.now()) / 1000)));
    const first = setTimeout(tick, 0);
    const id = setInterval(tick, 1000);
    return () => {
      clearTimeout(first);
      clearInterval(id);
    };
  }, [target]);

  return target ? left : null;
}
