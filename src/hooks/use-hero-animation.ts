"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

// Fades in every [data-hero-item] inside the returned ref, one after another, and lets [data-hero-float]
// bob slowly. Both only run when the visitor has not asked for reduced motion.
export function useHeroAnimation<T extends HTMLElement>() {
  const scope = useRef<T>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from("[data-hero-item]", {
          y: 24,
          autoAlpha: 0,
          duration: 0.8,
          stagger: 0.12,
          ease: "power3.out",
        });
        gsap.to("[data-hero-float]", { y: -14, duration: 3.2, ease: "sine.inOut", yoyo: true, repeat: -1 });
      });
    },
    { scope },
  );

  return scope;
}
