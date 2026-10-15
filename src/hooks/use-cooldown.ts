"use client";

import { useEffect, useState } from "react";

// Seconds left before the next submission is allowed; start(n) begins a new wait.
export function useCooldown() {
  const [left, setLeft] = useState(0);

  useEffect(() => {
    if (left <= 0) return;
    const id = setTimeout(() => setLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearTimeout(id);
  }, [left]);

  return { left, start: (seconds: number) => setLeft(seconds) };
}
