"use client";

import { useSyncExternalStore } from "react";

const MINUTE = 60_000;

function subscribe(onChange: () => void) {
  const id = window.setInterval(onChange, MINUTE);
  return () => window.clearInterval(id);
}

// Whole days until `endsAt` (1 on the last day, 0 after it), or null while server rendering
// so the server and the first client render agree.
export function useDaysLeft(endsAt: string): number | null {
  return useSyncExternalStore(
    subscribe,
    () => {
      const ms = new Date(endsAt).getTime() - Date.now();
      return ms < 0 ? 0 : Math.ceil(ms / 86_400_000);
    },
    () => null,
  );
}
