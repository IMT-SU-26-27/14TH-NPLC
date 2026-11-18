"use client";

import { useEffect, useState } from "react";
import { serverClockOffset } from "@/lib/cp/server-clock";

// Milliseconds the server clock is ahead of this device; 0 until measured.
export function useServerClockOffset(): number {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    let active = true;
    void serverClockOffset().then((value) => {
      if (active) setOffset(value);
    });
    return () => {
      active = false;
    };
  }, []);

  return offset;
}
