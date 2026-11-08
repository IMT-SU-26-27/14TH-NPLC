"use client";

import { useHashScrollOnLoad } from "@/hooks/use-hash-scroll-on-load";

// Renders nothing; makes a direct link such as /id#lomba land on its section.
export function HomeHashScroll() {
  useHashScrollOnLoad();
  return null;
}
