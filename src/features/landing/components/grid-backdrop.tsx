"use client";

import { useParallax } from "@/hooks/use-parallax";
import type { GridBackdropProps } from "@/types/landing";

// The navy bands' 48px grid (--band-grid in globals.css, shared with PageBand). Decorative only.
//
// The grid drifts slower than the page, so the band reads as sitting behind the content scrolling over it.
// The outer box clips to the band; the inner layer is 40% taller than it, so the drift never uncovers an edge
// at either end. With reduced motion the hook creates nothing and the grid sits exactly where it does now.
export function GridBackdrop({ speed = 0.18 }: GridBackdropProps) {
  const scope = useParallax<HTMLDivElement>();

  return (
    <div ref={scope} aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div data-parallax={speed} className="absolute inset-x-0 -inset-y-[20%] [background:var(--band-grid)]" />
    </div>
  );
}
