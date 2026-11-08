"use client";

import { useRef } from "react";
import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, CustomEase);

// Where each of the 19 cube pieces flies in from: [x, y, rotation°], by piece index (paint order). A fixed table,
// not Math.random, so every visit looks the same. Pieces come from 20–48px away, a little turned.
const PIECE_FROM: readonly (readonly [number, number, number])[] = [
  [-28, -40, -6], [-44, -24, 5], [36, -36, -4], [-24, 44, 6], [42, 22, -5], [-48, 8, 4], [20, -48, 6],
  [46, -12, -6], [-32, 32, -3], [28, 40, 5], [-20, -46, 3], [40, 34, -6], [-46, -30, 5], [32, -26, -4],
  [-36, 42, 6], [24, 46, -5], [-40, -16, 3], [48, 10, -4], [-22, 36, 5],
];

// Measured once from the SVG so the page never has to (no getBBox on load): the pieces from the bottom of the
// cube up, and the centre of each piece and fragment in the 540×520 viewBox, used as its turning point.
const PIECE_ORDER = [12, 6, 8, 1, 2, 16, 10, 11, 4, 7, 18, 15, 17, 9, 13, 14, 3, 5, 0] as const;
const PIECE_CENTER: readonly (readonly [number, number])[] = [
  [262, 146], [161.5, 320], [362.5, 320], [211.8, 175], [161.5, 262], [312.2, 175], [211.8, 349], [362.5, 262],
  [312.2, 349], [262, 204], [211.8, 291], [312.2, 291], [262, 378], [126.4, 186.6], [402.6, 180.8], [211.8, 233],
  [262, 320], [324.8, 222.9], [272.1, 250.4],
];
const FRAGMENT_CENTER = ["70 90", "470 60"] as const;

const PIECE_EASE = CustomEase.create("hero-piece", "0.2,0.8,0.2,1");

// Fades in every [data-hero-item], then assembles the cube in [data-hero-art]: back ring, pieces from the bottom
// up, front ring, then the two fragments. Afterwards the cube floats as before and each fragment drifts on its
// own; that idle loop pauses while the hero is off screen. With reduced motion nothing runs and the art shows
// exactly as it is in the markup.
export function useHeroAnimation<T extends HTMLElement>() {
  const scope = useRef<T>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", (context) => {
        gsap.from("[data-hero-item]", {
          y: 24,
          autoAlpha: 0,
          duration: 0.8,
          stagger: 0.12,
          ease: "power3.out",
        });

        const root = scope.current;
        const art = root?.querySelector<HTMLElement>("[data-hero-art]");
        if (!root || !art) return;
        // Read once, so turning a phone does not replay the entrance.
        const phone = window.matchMedia("(max-width: 639px)").matches;
        let observer: IntersectionObserver | null = null;

        // Built in its own task after the hydrated frame has painted, so reading the SVG never adds to React's
        // hydration work; the art stays hidden until then. context.add keeps these tweens in the matchMedia
        // context for cleanup.
        let timer = 0;
        const frame = requestAnimationFrame(() => {
          timer = window.setTimeout(() =>
            context.add(() => {
              observer = assembleCube(root, art, phone);
            }),
          );
        });

        return () => {
          cancelAnimationFrame(frame);
          window.clearTimeout(timer);
          observer?.disconnect();
        };
      });
    },
    { scope },
  );

  return scope;
}

// The entrance timeline and the idle loop for the cube art. Returns the observer that pauses the idle loop.
function assembleCube(root: HTMLElement, art: HTMLElement, phone: boolean): IntersectionObserver {
  const rings = gsap.utils.toArray<SVGGElement>("[data-hero-ring]", art);
  const pieces = gsap.utils.toArray<SVGGElement>("[data-hero-piece]", art);
  const [left, right] = gsap.utils.toArray<SVGGElement>("[data-hero-fragment]", art);

  // Idle loop, started once the cube is assembled: the cube and its ring keep the old float, and the fragments
  // drift on their own periods so they never move in step.
  const idle = gsap.timeline({ paused: true });
  idle.to(art.querySelector("[data-hero-float]"), { y: -14, duration: 3.2, ease: "sine.inOut", yoyo: true, repeat: -1 }, 0);
  if (left) idle.to(left, { y: -8, rotation: -6, svgOrigin: FRAGMENT_CENTER[0], duration: 2.25, ease: "sine.inOut", yoyo: true, repeat: -1 }, 0);
  if (right) idle.to(right, { y: -6, rotation: 6, svgOrigin: FRAGMENT_CENTER[1], duration: 2.75, ease: "sine.inOut", yoyo: true, repeat: -1 }, 0.9);

  let visible = true;
  const entrance = gsap.timeline({
    delay: 0.3,
    onComplete: () => {
      gsap.set(pieces, { clearProps: "willChange" });
      if (visible) idle.play();
    },
  });

  rings.forEach((ring, i) => {
    const at = i === 0 ? 0.15 : 0.9;
    const duration = i === 0 ? 0.7 : 0.6;
    const line = ring.querySelector("ellipse");
    if (phone || !line) {
      // Phones skip the stroke drawing: the ring only fades in.
      entrance.from(ring, { autoAlpha: 0, duration, ease: "power1.inOut" }, at);
      return;
    }
    entrance.fromTo(
      line,
      { strokeDasharray: 1, strokeDashoffset: 1 },
      { strokeDashoffset: 0, duration, ease: "power1.inOut", clearProps: "strokeDasharray,strokeDashoffset" },
      at,
    );
  });

  // Bottom pieces first, so the cube stacks up.
  PIECE_ORDER.forEach((index, order) => {
    const piece = pieces[index];
    if (!piece) return;
    const [x, y, rotation] = PIECE_FROM[index];
    const [cx, cy] = PIECE_CENTER[index];
    entrance.from(
      piece,
      { x, y, rotation, scale: 0.9, autoAlpha: 0, svgOrigin: `${cx} ${cy}`, duration: 0.45, ease: PIECE_EASE },
      0.2 + order * (phone ? 0.02 : 0.035),
    );
  });

  [left, right].forEach((fragment, i) => {
    if (!fragment) return;
    entrance.from(fragment, { scale: 0.6, autoAlpha: 0, svgOrigin: FRAGMENT_CENTER[i], duration: 0.4, ease: "back.out(1.7)" }, i === 0 ? 1.1 : 1.25);
  });

  // Every layer now sits at its start, so the art can be shown in this same frame.
  gsap.set(pieces, { willChange: "transform, opacity" });
  gsap.set(art, { visibility: "visible" });

  // The idle loop stops while the hero is off screen and picks up again when it scrolls back.
  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (entrance.progress() < 1) return;
    if (visible) idle.play();
    else idle.pause();
  });
  observer.observe(root);
  return observer;
}
