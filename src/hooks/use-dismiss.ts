"use client";

import { useEffect, useRef, type RefObject } from "react";

// Closes an open panel on Escape (focus goes back to `returnFocus`) or on a press outside every element in `inside`.
export function useDismiss(open: boolean, onDismiss: () => void, inside: RefObject<HTMLElement | null>[], returnFocus?: RefObject<HTMLElement | null>) {
  const callback = useRef(onDismiss);
  useEffect(() => {
    callback.current = onDismiss;
  });

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      callback.current();
      returnFocus?.current?.focus();
    };
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (inside.some((ref) => ref.current?.contains(target))) return;
      callback.current();
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open, inside, returnFocus]);
}
