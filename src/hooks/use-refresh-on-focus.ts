"use client";

import { useCallback, useEffect, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { RefreshOnFocus } from "@/types/system";

// Light replacement for realtime on registration pages: fresh server data when the tab becomes visible again (at most
// once every `minIntervalMs`), plus a manual refresh. No polling while the tab stays open.
export function useRefreshOnFocus(minIntervalMs = 30_000): RefreshOnFocus {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const lastRefresh = useRef(0);

  const refresh = useCallback(() => {
    lastRefresh.current = Date.now();
    startTransition(() => router.refresh());
  }, [router]);

  useEffect(() => {
    // The page was just rendered on the server, so it counts as a refresh.
    lastRefresh.current = Date.now();
    const onVisible = () => {
      if (document.visibilityState === "visible" && Date.now() - lastRefresh.current >= minIntervalMs) refresh();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [minIntervalMs, refresh]);

  return { refresh, pending };
}
