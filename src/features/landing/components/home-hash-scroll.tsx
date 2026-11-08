"use client";

import { useHashScrollOnLoad } from "@/hooks/use-hash-scroll-on-load";
import { useScrollRestoreOnReload } from "@/hooks/use-scroll-restore-on-reload";

// Renders nothing. A direct link such as /id#lomba lands on its section; a reload keeps the visitor's place.
export function HomeHashScroll() {
  useHashScrollOnLoad();
  useScrollRestoreOnReload();
  return null;
}
