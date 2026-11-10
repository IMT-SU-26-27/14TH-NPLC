"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

// Drifts every [data-parallax] layer inside the scope while the scope crosses the viewport, so background
// layers fall behind the content scrolling over them.
//
// The attribute value is that layer's speed: the fraction of its own height it travels in total. 0.2 means it
// moves 10% up and 10% down from where the markup puts it, which is why a parallax layer must be taller than
// the box that clips it or the drift uncovers an edge.
//
// Only `yPercent` is animated (a transform, so it never triggers layout), the tween is scrubbed so the layer
// is tied to scroll position rather than running on its own clock, and `invalidateOnRefresh` re-measures after
// a resize or a font swap. Decorative only: with reduced motion nothing is created and every layer stays
// exactly where the markup puts it.
const DEFAULT_SPEED = 0.2;

export function useParallax<T extends HTMLElement>() {
  const scope = useRef<T>(null);

  useGSAP(
    () => {
      const root = scope.current;
      if (!root) return;

      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        for (const layer of gsap.utils.toArray<HTMLElement>("[data-parallax]", root)) {
          const speed = Number(layer.dataset.parallax) || DEFAULT_SPEED;
          gsap.fromTo(
            layer,
            { yPercent: -50 * speed },
            {
              yPercent: 50 * speed,
              ease: "none",
              scrollTrigger: {
                trigger: root,
                start: "top bottom",
                end: "bottom top",
                scrub: true,
                invalidateOnRefresh: true,
              },
            },
          );
        }
      });
    },
    { scope },
  );

  return scope;
}
