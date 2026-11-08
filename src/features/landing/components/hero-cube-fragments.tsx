import type { HeroArtProps } from "@/types/hero";

// The two small cubes beside the hero cube (public/landing/hero-cube-fragments.svg), inline so each can float on
// its own. Same 540×520 box as the cube, so they line up when stacked. Gradient ids carry an "hf-" prefix.
export function HeroCubeFragments({ className }: HeroArtProps) {
  return (
    <svg viewBox="0 0 540 520" aria-hidden focusable="false" className={className}>
      <defs>
        <linearGradient id="hf-gbt" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#5B7BFF" />
          <stop offset="1" stopColor="#2F55E8" />
        </linearGradient>
        <linearGradient id="hf-gbr" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#4158B7" />
          <stop offset="1" stopColor="#213DA7" />
        </linearGradient>
        <linearGradient id="hf-gpl" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#9A85D8" />
          <stop offset="1" stopColor="#7454CC" />
        </linearGradient>
        <linearGradient id="hf-glt" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#E8FF7A" />
          <stop offset="1" stopColor="#C4E62A" />
        </linearGradient>
        <linearGradient id="hf-gll" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#C7DB68" />
          <stop offset="1" stopColor="#A8C524" />
        </linearGradient>
        <linearGradient id="hf-glr" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#A7B757" />
          <stop offset="1" stopColor="#8DA51E" />
        </linearGradient>
      </defs>
      <g data-hero-fragment="left">
        <polygon points="70,74 83.86,82.0 70,90 56.14,82.0" fill="url(#hf-gbt)" stroke="#fff" strokeOpacity=".8" />
        <polygon points="56.14,82.0 70,90 70,106 56.14,98.0" fill="url(#hf-gpl)" stroke="#fff" strokeOpacity=".8" />
        <polygon points="70,90 83.86,82.0 83.86,98.0 70,106" fill="url(#hf-gbr)" stroke="#fff" strokeOpacity=".8" />
      </g>
      <g data-hero-fragment="right">
        <polygon points="470,48 480.39,54.0 470,60 459.61,54.0" fill="url(#hf-glt)" stroke="#fff" strokeOpacity=".8" />
        <polygon points="459.61,54.0 470,60 470,72 459.61,66.0" fill="url(#hf-gll)" stroke="#fff" strokeOpacity=".8" />
        <polygon points="470,60 480.39,54.0 480.39,66.0 470,72" fill="url(#hf-glr)" stroke="#fff" strokeOpacity=".8" />
      </g>
    </svg>
  );
}
