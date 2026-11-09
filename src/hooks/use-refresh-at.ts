"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Re-renders the page from the server once `at` (an ISO time) has passed, e.g. when the participants' leaderboard
// closes for the last hour. Nothing happens for a time in the past, or one further away than the browser's timer
// can wait (about 24 days); the next page load picks that up.
export function useRefreshAt(at: string | null) {
  const router = useRouter();

  useEffect(() => {
    if (!at) return;
    const ms = new Date(at).getTime() - Date.now();
    if (ms <= 0 || ms > 2_000_000_000) return;
    // One second late, so the server already sees the cut-off as passed.
    const timer = setTimeout(() => router.refresh(), ms + 1000);
    return () => clearTimeout(timer);
  }, [at, router]);
}
