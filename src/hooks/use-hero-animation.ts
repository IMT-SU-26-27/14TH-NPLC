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
const FRAGMENT_CENTER = { left: [70, 90], right: [470, 60] } as const;

const PIECE_EASE = CustomEase.create("hero-piece", "0.2,0.8,0.2,1");

// The orbit ring (SVG units). Its lines use pathLength 1000, so dash values are in thousandths of the ring.
const RING = { cx: 272, cy: 282, rx: 255, ry: 66, rest: -14 } as const;
const PATH = 1000;
const RING_DRAW = { start: 0.2, duration: 1, phoneFade: 0.6 } as const;
// Idle: the ring rocks from -14° to +14° and back; a sheen runs round it and three dots orbit it. Along the
// front (lower) half both move left to right.
const SEESAW = { swing: 14, period: 6 } as const;
const SHEEN_PERIOD = 7;
const DOT_PERIOD = 9;
const DOT_START = Math.PI / 2;
// Idle motion eases in from rest over this many seconds, so nothing jerks when the entrance hands over.
const RAMP = 2;

// The three floating "islands": [amplitude, period s, phase 0–1] for y (px), x (px) and rotation (°). Amplitudes
// are half of the total travel. Periods share no common multiple, so the islands never move in step.
const ISLANDS = {
  cube: { y: [5, 7.0, 0], x: [1.5, 9.4, 0.31], r: [2, 8.3, 0.62] },
  left: { y: [6, 6.2, 0.17], x: [2.5, 8.9, 0.53], r: [4, 7.3, 0.86] },
  right: { y: [5, 7.6, 0.41], x: [2, 10.1, 0.74], r: [5, 6.7, 0.08] },
} as const;

const wave = ([amplitude, period, phase]: readonly [number, number, number], t: number) =>
  amplitude * Math.sin(2 * Math.PI * (t / period + phase));
const smooth = (x: number) => {
  const k = Math.min(Math.max(x, 0), 1);
  return k * k * (3 - 2 * k);
};

// Fades in every [data-hero-item], then assembles the cube in [data-hero-art]: the pieces fly in from the bottom
// up while the ring is drawn as one stroke (behind the cube, then in front), then the two fragments pop in.
// Afterwards the ring rocks and orbits and the cube and both fragments float as three separate islands. Idle
// motion stops while the hero is off screen or the tab is hidden. With reduced motion nothing runs and the art
// shows exactly as it is in the markup.
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
        let stop = () => {};

        // Built in its own task after the hydrated frame has painted, so reading the SVG never adds to React's
        // hydration work; the art stays hidden until then (CSS). context.add keeps the tweens in this
        // matchMedia context for cleanup.
        let timer = 0;
        const frame = requestAnimationFrame(() => {
          timer = window.setTimeout(() =>
            context.add(() => {
              stop = animateCube(root, art, phone);
            }),
          );
        });

        return () => {
          cancelAnimationFrame(frame);
          window.clearTimeout(timer);
          stop();
        };
      });
    },
    { scope },
  );

  return scope;
}

// Entrance and idle motion for the cube art. Returns a function that stops the idle loop and puts every layer
// back as it is in the markup.
function animateCube(root: HTMLElement, art: HTMLElement, phone: boolean): () => void {
  const all = <E extends Element>(selector: string) => [...art.querySelectorAll<E>(selector)];
  const pieces = all<SVGGElement>("[data-hero-piece]");
  const ringHalves = all<SVGGElement>("[data-hero-ring]");
  const tilts = all<SVGGElement>("[data-hero-ring-tilt]");
  const ringClips = all<SVGGElement>("[data-hero-ring-clip]");
  const lines = all<SVGEllipseElement>("[data-hero-ring-line]");
  const extras = all<SVGGElement>("[data-hero-ring-extra]");
  const sheens = all<SVGEllipseElement>("[data-hero-sheen]");
  const dotGroups = all<SVGGElement>("[data-hero-dots]");
  const dots = all<SVGCircleElement>("[data-hero-dot]");
  const float = art.querySelector<HTMLElement>("[data-hero-float]");
  const fragments = {
    left: art.querySelector<SVGGElement>('[data-hero-fragment="left"]'),
    right: art.querySelector<SVGGElement>('[data-hero-fragment="right"]'),
  };
  const shadows = {
    left: art.querySelector<SVGEllipseElement>('[data-hero-shadow="left"]'),
    right: art.querySelector<SVGEllipseElement>('[data-hero-shadow="right"]'),
  };
  const setAll = (els: Element[], name: string, value: string) => els.forEach((el) => el.setAttribute(name, value));

  // The animated ring splits front from back along its own axis, inside the tilt group, so the split tilts with
  // the ring and the dots always pass behind the cube on the far side and in front of it on the near side.
  ringHalves.forEach((half) => half.removeAttribute("clip-path"));
  ringClips.forEach((clip) => clip.setAttribute("clip-path", `url(#hc-${clip.dataset.heroRingClip}-axis)`));

  // --- Idle loop: one ticker callback with its own clock, which only runs while the hero is on screen.
  let ringTime = -1;
  let islandTime = -1;
  let sheenTravel = 0;
  let dotTravel = 0;
  const cube = float
    ? { x: gsap.quickSetter(float, "x", "px"), y: gsap.quickSetter(float, "y", "px"), r: gsap.quickSetter(float, "rotation", "deg") }
    : null;

  const placeSheen = (tip: number) => setAll(sheens, "stroke-dashoffset", String(-(((tip % PATH) + PATH) % PATH)));
  // Dots on the ellipse in the ring's own (untilted) coordinates; the tilt group turns them with the ring.
  const placeDots = (travel: number) =>
    dots.forEach((dot, i) => {
      const theta = DOT_START - travel + ((i % 3) * 2 * Math.PI) / 3;
      const x = RING.cx + RING.rx * Math.cos(theta);
      const y = RING.cy + RING.ry * Math.sin(theta);
      dot.setAttribute("transform", `translate(${x.toFixed(2)} ${y.toFixed(2)})`);
    });
  placeDots(0);

  const tick = (_time: number, deltaMs: number) => {
    const dt = Math.min(deltaMs, 100) / 1000;
    if (ringTime >= 0) {
      ringTime += dt;
      const ease = smooth(ringTime / RAMP);
      const angle = RING.rest + SEESAW.swing * (1 - Math.cos((2 * Math.PI * ringTime) / SEESAW.period));
      setAll(tilts, "transform", `rotate(${angle.toFixed(3)} ${RING.cx} ${RING.cy})`);
      sheenTravel += ((PATH / SHEEN_PERIOD) * ease * dt);
      placeSheen(-sheenTravel);
      if (!phone) {
        dotTravel += ((2 * Math.PI) / DOT_PERIOD) * ease * dt;
        placeDots(dotTravel);
      }
    }
    if (islandTime >= 0) {
      islandTime += dt;
      const ease = smooth(islandTime / RAMP);
      if (cube) {
        cube.x(wave(ISLANDS.cube.x, islandTime) * ease);
        cube.y(wave(ISLANDS.cube.y, islandTime) * ease);
        cube.r(wave(ISLANDS.cube.r, islandTime) * ease);
      }
      (["left", "right"] as const).forEach((side) => {
        const island = ISLANDS[side];
        const [cx, cy] = FRAGMENT_CENTER[side];
        const x = wave(island.x, islandTime) * ease;
        const y = wave(island.y, islandTime) * ease;
        const r = wave(island.r, islandTime) * ease;
        fragments[side]?.setAttribute("transform", `translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${r.toFixed(2)} ${cx} ${cy})`);
        // Shadow on the ground: smaller and fainter the higher the cube floats.
        const lift = (1 - y / island.y[0]) / 2;
        const shadow = shadows[side];
        if (shadow) {
          const cxs = Number(shadow.getAttribute("cx"));
          const cys = Number(shadow.getAttribute("cy"));
          const scale = 1 - 0.25 * lift;
          shadow.setAttribute("transform", `translate(${(x + cxs * (1 - scale)).toFixed(2)} ${(cys * (1 - scale)).toFixed(2)}) scale(${scale.toFixed(3)})`);
          shadow.setAttribute("opacity", ((0.14 - 0.07 * lift) * ease).toFixed(3));
        }
      });
    }
  };

  let onScreen = true;
  let ticking = false;
  const sync = () => {
    const run = onScreen && !document.hidden && (ringTime >= 0 || islandTime >= 0);
    if (run && !ticking) gsap.ticker.add(tick);
    if (!run && ticking) gsap.ticker.remove(tick);
    ticking = run;
  };
  const startRing = () => {
    ringTime = 0;
    sync();
  };
  const startIslands = () => {
    islandTime = 0;
    sync();
  };
  const observer = new IntersectionObserver(([entry]) => {
    onScreen = entry.isIntersecting;
    sync();
  });
  observer.observe(root);
  document.addEventListener("visibilitychange", sync);

  const ready = () => art.setAttribute("data-hero-ready", "");

  // The script came too late (CSS already showed the art after 3 s): no entrance, only the idle motion.
  if (performance.now() > 2900) {
    gsap.set(extras, { attr: { visibility: "visible", opacity: 1 } });
    if (phone) gsap.set(dotGroups, { attr: { opacity: 0 } });
    placeSheen(0);
    ready();
    startRing();
    startIslands();
  } else {
    const entrance = gsap.timeline({
      delay: 0.3,
      onComplete: () => {
        gsap.set(pieces, { clearProps: "willChange" });
        startIslands();
      },
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

    // The ring: hidden at first, then drawn as one stroke starting with the first piece. Ring attributes are
    // written directly (GSAP's CSS rounding would turn 0–1 dash values into a jump).
    gsap.set(dotGroups, { attr: { opacity: 0 } });
    if (phone) {
      // Phones skip the drawing: the ring fades in, then the sheen starts.
      entrance.fromTo(ringHalves, { opacity: 0 }, { opacity: 1, duration: RING_DRAW.phoneFade, ease: "power1.inOut", onComplete: () => {
        placeSheen(0);
        gsap.set(extras, { attr: { visibility: "visible", opacity: 1 } });
        startRing();
      } }, RING_DRAW.start);
    } else {
      setAll(lines, "stroke-dasharray", `${PATH} ${PATH}`);
      setAll(lines, "stroke-dashoffset", String(-PATH));
      placeSheen(PATH);
      const draw = { progress: 0 };
      // The far half is drawn first (along the top, behind the cube), then straight on round the near half; the
      // sheen rides the tip of the stroke and keeps going as the idle sheen.
      entrance.to(
        draw,
        {
          progress: 1,
          duration: RING_DRAW.duration,
          ease: "power1.inOut",
          onUpdate: () => {
            const tip = PATH * (1 - draw.progress);
            setAll(lines, "stroke-dashoffset", String(-tip));
            placeSheen(tip);
          },
          onComplete: () => {
            lines.forEach((line) => {
              line.removeAttribute("stroke-dasharray");
              line.removeAttribute("stroke-dashoffset");
            });
            startRing();
          },
        },
        RING_DRAW.start,
      );
      entrance.fromTo(extras, { attr: { visibility: "visible", opacity: 0 } }, { attr: { opacity: 1 }, duration: 0.2, ease: "none" }, RING_DRAW.start);
      entrance.fromTo(dotGroups, { attr: { opacity: 0 } }, { attr: { opacity: 1 }, duration: 0.6, ease: "power1.out" }, RING_DRAW.start + RING_DRAW.duration);
    }

    (["left", "right"] as const).forEach((side, i) => {
      const body = fragments[side]?.querySelector("[data-hero-fragment-body]");
      if (!body) return;
      const [cx, cy] = FRAGMENT_CENTER[side];
      entrance.from(body, { scale: 0.6, autoAlpha: 0, svgOrigin: `${cx} ${cy}`, duration: 0.4, ease: "back.out(1.7)" }, i === 0 ? 1.1 : 1.25);
    });

    // Every layer now sits at its start, so the art can be shown in this same frame.
    gsap.set(pieces, { willChange: "transform, opacity" });
    ready();
  }

  return () => {
    observer.disconnect();
    document.removeEventListener("visibilitychange", sync);
    gsap.ticker.remove(tick);
    ringHalves.forEach((half) => half.setAttribute("clip-path", `url(#hc-${half.dataset.heroRing})`));
    ringClips.forEach((clip) => clip.removeAttribute("clip-path"));
    setAll(tilts, "transform", `rotate(${RING.rest} ${RING.cx} ${RING.cy})`);
    lines.forEach((line) => {
      line.removeAttribute("stroke-dasharray");
      line.removeAttribute("stroke-dashoffset");
    });
    setAll(extras, "visibility", "hidden");
    extras.forEach((extra) => extra.removeAttribute("opacity"));
    (["left", "right"] as const).forEach((side) => {
      fragments[side]?.removeAttribute("transform");
      shadows[side]?.removeAttribute("transform");
      shadows[side]?.setAttribute("opacity", "0");
    });
    if (float) gsap.set(float, { clearProps: "transform" });
  };
}
