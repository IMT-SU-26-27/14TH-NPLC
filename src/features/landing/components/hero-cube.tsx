import type { HeroArtProps } from "@/types/hero";

// The hero cube from the design handoff (public/shared/cube-isometric.svg), inline so each layer can animate:
// the back half of the orbit ring, 19 pieces in paint order, then the front half. Gradient ids carry an "hc-"
// prefix so they never collide with the fragments' copies. At rest it is identical to the original file.
export function HeroCube({ className }: HeroArtProps) {
  return (
    <svg viewBox="0 0 540 520" aria-hidden focusable="false" className={className}>
      <defs>
        <linearGradient id="hc-gwt" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#DCE3F7" />
        </linearGradient>
        <linearGradient id="hc-gwl" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#E0E0E0" />
          <stop offset="1" stopColor="#C1C7D9" />
        </linearGradient>
        <linearGradient id="hc-gwr" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#C1C1C1" />
          <stop offset="1" stopColor="#A7ACBB" />
        </linearGradient>
        <linearGradient id="hc-gbt" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#5B7BFF" />
          <stop offset="1" stopColor="#2F55E8" />
        </linearGradient>
        <linearGradient id="hc-gbl" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#506CE0" />
          <stop offset="1" stopColor="#294ACC" />
        </linearGradient>
        <linearGradient id="hc-gbr" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#455DC1" />
          <stop offset="1" stopColor="#2340B0" />
        </linearGradient>
        <linearGradient id="hc-gpt" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#B49BFC" />
          <stop offset="1" stopColor="#8762EE" />
        </linearGradient>
        <linearGradient id="hc-gpl" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#9E88DD" />
          <stop offset="1" stopColor="#7656D1" />
        </linearGradient>
        <linearGradient id="hc-gpr" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#8875BF" />
          <stop offset="1" stopColor="#664AB4" />
        </linearGradient>
        <linearGradient id="hc-glt" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#E8FF7A" />
          <stop offset="1" stopColor="#C4E62A" />
        </linearGradient>
        <linearGradient id="hc-gll" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#CCE06B" />
          <stop offset="1" stopColor="#ACCA24" />
        </linearGradient>
        <linearGradient id="hc-glr" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#B0C15C" />
          <stop offset="1" stopColor="#94AE1F" />
        </linearGradient>
        <linearGradient id="hc-gst" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#B5ECFF" />
          <stop offset="1" stopColor="#6FCDF7" />
        </linearGradient>
        <linearGradient id="hc-gsl" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#9FCFE0" />
          <stop offset="1" stopColor="#61B4D9" />
        </linearGradient>
        <linearGradient id="hc-gsr" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#89B3C1" />
          <stop offset="1" stopColor="#549BBB" />
        </linearGradient>
        <linearGradient id="hc-orb" x1="0" x2="1">
          <stop offset="0" stopColor="#4A6BFF" />
          <stop offset="0.6" stopColor="#A78BFA" />
          <stop offset="1" stopColor="#D8F939" />
        </linearGradient>
        <clipPath id="hc-front">
          <rect x="0" y="282" width="540" height="300" />
        </clipPath>
        <clipPath id="hc-back">
          <rect x="0" y="0" width="540" height="282" />
        </clipPath>
      </defs>
      <g clipPath="url(#hc-back)" data-hero-ring="back">
        <ellipse cx="272" cy="282" rx="255" ry="66" fill="none" stroke="url(#hc-orb)" strokeWidth="1.5" transform="rotate(-14 272 282)" opacity="0.55" pathLength="1000" />
      </g>
      <g data-hero-pieces>
        <g data-hero-piece data-index="0">
          <polygon points="262.0,93.8 307.2,119.9 262.0,146.0 216.8,119.9" fill="url(#hc-gwt)" fillOpacity="0.95" stroke="#FFFFFF" strokeOpacity="0.8" strokeWidth="1.3" strokeLinejoin="round" />
          <polygon points="216.8,119.9 262.0,146.0 262.0,198.2 216.8,172.1" fill="url(#hc-gpl)" fillOpacity="0.95" stroke="#FFFFFF" strokeOpacity="0.8" strokeWidth="1.3" strokeLinejoin="round" />
          <polygon points="307.2,119.9 262.0,146.0 262.0,198.2 307.2,172.1" fill="url(#hc-gpr)" fillOpacity="0.95" stroke="#FFFFFF" strokeOpacity="0.8" strokeWidth="1.3" strokeLinejoin="round" />
          <polyline points="216.8,119.9 262.0,93.8 307.2,119.9" fill="none" stroke="#FFFFFF" strokeWidth="1.8" />
        </g>
        <g data-hero-piece data-index="1">
          <polygon points="161.5,267.8 206.7,293.9 161.5,320.0 116.3,293.9" fill="url(#hc-gbt)" fillOpacity="0.95" stroke="#FFFFFF" strokeOpacity="0.8" strokeWidth="1.3" strokeLinejoin="round" />
          <polygon points="116.3,293.9 161.5,320.0 161.5,372.2 116.3,346.1" fill="url(#hc-gpl)" fillOpacity="0.95" stroke="#FFFFFF" strokeOpacity="0.8" strokeWidth="1.3" strokeLinejoin="round" />
          <polygon points="206.7,293.9 161.5,320.0 161.5,372.2 206.7,346.1" fill="url(#hc-gbr)" fillOpacity="0.95" stroke="#FFFFFF" strokeOpacity="0.8" strokeWidth="1.3" strokeLinejoin="round" />
          <polyline points="116.3,293.9 161.5,267.8 206.7,293.9" fill="none" stroke="#FFFFFF" strokeWidth="1.8" />
        </g>
        <g data-hero-piece data-index="2">
          <polygon points="362.5,267.8 407.7,293.9 362.5,320.0 317.3,293.9" fill="url(#hc-gpt)" fillOpacity="0.95" stroke="#FFFFFF" strokeOpacity="0.8" strokeWidth="1.3" strokeLinejoin="round" />
          <polygon points="317.3,293.9 362.5,320.0 362.5,372.2 317.3,346.1" fill="url(#hc-gll)" fillOpacity="0.95" stroke="#FFFFFF" strokeOpacity="0.8" strokeWidth="1.3" strokeLinejoin="round" />
          <polygon points="407.7,293.9 362.5,320.0 362.5,372.2 407.7,346.1" fill="url(#hc-gwr)" fillOpacity="0.95" stroke="#FFFFFF" strokeOpacity="0.8" strokeWidth="1.3" strokeLinejoin="round" />
          <polyline points="317.3,293.9 362.5,267.8 407.7,293.9" fill="none" stroke="#FFFFFF" strokeWidth="1.8" />
        </g>
        <g data-hero-piece data-index="3">
          <polygon points="211.8,122.8 257.0,148.9 211.8,175.0 166.6,148.9" fill="url(#hc-glt)" fillOpacity="0.95" stroke="#FFFFFF" strokeOpacity="0.8" strokeWidth="1.3" strokeLinejoin="round" />
          <polygon points="166.6,148.9 211.8,175.0 211.8,227.2 166.6,201.1" fill="url(#hc-gll)" fillOpacity="0.95" stroke="#FFFFFF" strokeOpacity="0.8" strokeWidth="1.3" strokeLinejoin="round" />
          <polygon points="257.0,148.9 211.8,175.0 211.8,227.2 257.0,201.1" fill="url(#hc-gbr)" fillOpacity="0.95" stroke="#FFFFFF" strokeOpacity="0.8" strokeWidth="1.3" strokeLinejoin="round" />
          <polyline points="166.6,148.9 211.8,122.8 257.0,148.9" fill="none" stroke="#FFFFFF" strokeWidth="1.8" />
        </g>
        <g data-hero-piece data-index="4">
          <polygon points="161.5,209.8 206.7,235.9 161.5,262.0 116.3,235.9" fill="url(#hc-gwt)" fillOpacity="0.95" stroke="#FFFFFF" strokeOpacity="0.8" strokeWidth="1.3" strokeLinejoin="round" />
          <polygon points="116.3,235.9 161.5,262.0 161.5,314.2 116.3,288.1" fill="url(#hc-gwl)" fillOpacity="0.95" stroke="#FFFFFF" strokeOpacity="0.8" strokeWidth="1.3" strokeLinejoin="round" />
          <polygon points="206.7,235.9 161.5,262.0 161.5,314.2 206.7,288.1" fill="url(#hc-gbr)" fillOpacity="0.95" stroke="#FFFFFF" strokeOpacity="0.8" strokeWidth="1.3" strokeLinejoin="round" />
          <polyline points="116.3,235.9 161.5,209.8 206.7,235.9" fill="none" stroke="#FFFFFF" strokeWidth="1.8" />
        </g>
        <g data-hero-piece data-index="5">
          <polygon points="312.2,122.8 357.4,148.9 312.2,175.0 267.0,148.9" fill="url(#hc-gpt)" fillOpacity="0.95" stroke="#FFFFFF" strokeOpacity="0.8" strokeWidth="1.3" strokeLinejoin="round" />
          <polygon points="267.0,148.9 312.2,175.0 312.2,227.2 267.0,201.1" fill="url(#hc-gwl)" fillOpacity="0.95" stroke="#FFFFFF" strokeOpacity="0.8" strokeWidth="1.3" strokeLinejoin="round" />
          <polygon points="357.4,148.9 312.2,175.0 312.2,227.2 357.4,201.1" fill="url(#hc-gwr)" fillOpacity="0.95" stroke="#FFFFFF" strokeOpacity="0.8" strokeWidth="1.3" strokeLinejoin="round" />
          <polyline points="267.0,148.9 312.2,122.8 357.4,148.9" fill="none" stroke="#FFFFFF" strokeWidth="1.8" />
        </g>
        <g data-hero-piece data-index="6">
          <polygon points="211.8,296.8 257.0,322.9 211.8,349.0 166.6,322.9" fill="url(#hc-gbt)" fillOpacity="0.95" stroke="#FFFFFF" strokeOpacity="0.8" strokeWidth="1.3" strokeLinejoin="round" />
          <polygon points="166.6,322.9 211.8,349.0 211.8,401.2 166.6,375.1" fill="url(#hc-gbl)" fillOpacity="0.95" stroke="#FFFFFF" strokeOpacity="0.8" strokeWidth="1.3" strokeLinejoin="round" />
          <polygon points="257.0,322.9 211.8,349.0 211.8,401.2 257.0,375.1" fill="url(#hc-gwr)" fillOpacity="0.95" stroke="#FFFFFF" strokeOpacity="0.8" strokeWidth="1.3" strokeLinejoin="round" />
          <polyline points="166.6,322.9 211.8,296.8 257.0,322.9" fill="none" stroke="#FFFFFF" strokeWidth="1.8" />
        </g>
        <g data-hero-piece data-index="7">
          <polygon points="362.5,209.8 407.7,235.9 362.5,262.0 317.3,235.9" fill="url(#hc-gpt)" fillOpacity="0.95" stroke="#FFFFFF" strokeOpacity="0.8" strokeWidth="1.3" strokeLinejoin="round" />
          <polygon points="317.3,235.9 362.5,262.0 362.5,314.2 317.3,288.1" fill="url(#hc-gpl)" fillOpacity="0.95" stroke="#FFFFFF" strokeOpacity="0.8" strokeWidth="1.3" strokeLinejoin="round" />
          <polygon points="407.7,235.9 362.5,262.0 362.5,314.2 407.7,288.1" fill="url(#hc-gpr)" fillOpacity="0.95" stroke="#FFFFFF" strokeOpacity="0.8" strokeWidth="1.3" strokeLinejoin="round" />
          <polyline points="317.3,235.9 362.5,209.8 407.7,235.9" fill="none" stroke="#FFFFFF" strokeWidth="1.8" />
        </g>
        <g data-hero-piece data-index="8">
          <polygon points="312.2,296.8 357.4,322.9 312.2,349.0 267.0,322.9" fill="url(#hc-gwt)" fillOpacity="0.95" stroke="#FFFFFF" strokeOpacity="0.8" strokeWidth="1.3" strokeLinejoin="round" />
          <polygon points="267.0,322.9 312.2,349.0 312.2,401.2 267.0,375.1" fill="url(#hc-gbl)" fillOpacity="0.95" stroke="#FFFFFF" strokeOpacity="0.8" strokeWidth="1.3" strokeLinejoin="round" />
          <polygon points="357.4,322.9 312.2,349.0 312.2,401.2 357.4,375.1" fill="url(#hc-glr)" fillOpacity="0.95" stroke="#FFFFFF" strokeOpacity="0.8" strokeWidth="1.3" strokeLinejoin="round" />
          <polyline points="267.0,322.9 312.2,296.8 357.4,322.9" fill="none" stroke="#FFFFFF" strokeWidth="1.8" />
        </g>
        <g data-hero-piece data-index="9">
          <polygon points="262.0,151.8 307.2,177.9 262.0,204.0 216.8,177.9" fill="url(#hc-gpt)" fillOpacity="0.95" stroke="#FFFFFF" strokeOpacity="0.8" strokeWidth="1.3" strokeLinejoin="round" />
          <polygon points="216.8,177.9 262.0,204.0 262.0,256.2 216.8,230.1" fill="url(#hc-gwl)" fillOpacity="0.95" stroke="#FFFFFF" strokeOpacity="0.8" strokeWidth="1.3" strokeLinejoin="round" />
          <polygon points="307.2,177.9 262.0,204.0 262.0,256.2 307.2,230.1" fill="url(#hc-gbr)" fillOpacity="0.95" stroke="#FFFFFF" strokeOpacity="0.8" strokeWidth="1.3" strokeLinejoin="round" />
          <polyline points="216.8,177.9 262.0,151.8 307.2,177.9" fill="none" stroke="#FFFFFF" strokeWidth="1.8" />
        </g>
        <g data-hero-piece data-index="10">
          <polygon points="211.8,238.8 257.0,264.9 211.8,291.0 166.6,264.9" fill="url(#hc-gwt)" fillOpacity="0.95" stroke="#FFFFFF" strokeOpacity="0.8" strokeWidth="1.3" strokeLinejoin="round" />
          <polygon points="166.6,264.9 211.8,291.0 211.8,343.2 166.6,317.1" fill="url(#hc-gwl)" fillOpacity="0.95" stroke="#FFFFFF" strokeOpacity="0.8" strokeWidth="1.3" strokeLinejoin="round" />
          <polygon points="257.0,264.9 211.8,291.0 211.8,343.2 257.0,317.1" fill="url(#hc-gwr)" fillOpacity="0.95" stroke="#FFFFFF" strokeOpacity="0.8" strokeWidth="1.3" strokeLinejoin="round" />
          <polyline points="166.6,264.9 211.8,238.8 257.0,264.9" fill="none" stroke="#FFFFFF" strokeWidth="1.8" />
        </g>
        <g data-hero-piece data-index="11">
          <polygon points="312.2,238.8 357.4,264.9 312.2,291.0 267.0,264.9" fill="url(#hc-gwt)" fillOpacity="0.95" stroke="#FFFFFF" strokeOpacity="0.8" strokeWidth="1.3" strokeLinejoin="round" />
          <polygon points="267.0,264.9 312.2,291.0 312.2,343.2 267.0,317.1" fill="url(#hc-gwl)" fillOpacity="0.95" stroke="#FFFFFF" strokeOpacity="0.8" strokeWidth="1.3" strokeLinejoin="round" />
          <polygon points="357.4,264.9 312.2,291.0 312.2,343.2 357.4,317.1" fill="url(#hc-gpr)" fillOpacity="0.95" stroke="#FFFFFF" strokeOpacity="0.8" strokeWidth="1.3" strokeLinejoin="round" />
          <polyline points="267.0,264.9 312.2,238.8 357.4,264.9" fill="none" stroke="#FFFFFF" strokeWidth="1.8" />
        </g>
        <g data-hero-piece data-index="12">
          <polygon points="262.0,325.8 307.2,351.9 262.0,378.0 216.8,351.9" fill="url(#hc-gwt)" fillOpacity="0.95" stroke="#FFFFFF" strokeOpacity="0.8" strokeWidth="1.3" strokeLinejoin="round" />
          <polygon points="216.8,351.9 262.0,378.0 262.0,430.2 216.8,404.1" fill="url(#hc-gll)" fillOpacity="0.95" stroke="#FFFFFF" strokeOpacity="0.8" strokeWidth="1.3" strokeLinejoin="round" />
          <polygon points="307.2,351.9 262.0,378.0 262.0,430.2 307.2,404.1" fill="url(#hc-gbr)" fillOpacity="0.95" stroke="#FFFFFF" strokeOpacity="0.8" strokeWidth="1.3" strokeLinejoin="round" />
          <polyline points="216.8,351.9 262.0,325.8 307.2,351.9" fill="none" stroke="#FFFFFF" strokeWidth="1.8" />
        </g>
        <g data-hero-piece data-index="13">
          <polygon points="126.4,134.4 171.6,160.5 126.4,186.6 81.2,160.5" fill="url(#hc-gpt)" fillOpacity="0.95" stroke="#FFFFFF" strokeOpacity="0.8" strokeWidth="1.3" strokeLinejoin="round" />
          <polygon points="81.2,160.5 126.4,186.6 126.4,238.8 81.2,212.7" fill="url(#hc-gpl)" fillOpacity="0.95" stroke="#FFFFFF" strokeOpacity="0.8" strokeWidth="1.3" strokeLinejoin="round" />
          <polygon points="171.6,160.5 126.4,186.6 126.4,238.8 171.6,212.7" fill="url(#hc-gwr)" fillOpacity="0.95" stroke="#FFFFFF" strokeOpacity="0.8" strokeWidth="1.3" strokeLinejoin="round" />
          <polyline points="81.2,160.5 126.4,134.4 171.6,160.5" fill="none" stroke="#FFFFFF" strokeWidth="1.8" />
        </g>
        <g data-hero-piece data-index="14">
          <polygon points="402.6,128.6 447.8,154.7 402.6,180.8 357.4,154.7" fill="url(#hc-gwt)" fillOpacity="0.95" stroke="#FFFFFF" strokeOpacity="0.8" strokeWidth="1.3" strokeLinejoin="round" />
          <polygon points="357.4,154.7 402.6,180.8 402.6,233.0 357.4,206.9" fill="url(#hc-gwl)" fillOpacity="0.95" stroke="#FFFFFF" strokeOpacity="0.8" strokeWidth="1.3" strokeLinejoin="round" />
          <polygon points="447.8,154.7 402.6,180.8 402.6,233.0 447.8,206.9" fill="url(#hc-gpr)" fillOpacity="0.95" stroke="#FFFFFF" strokeOpacity="0.8" strokeWidth="1.3" strokeLinejoin="round" />
          <polyline points="357.4,154.7 402.6,128.6 447.8,154.7" fill="none" stroke="#FFFFFF" strokeWidth="1.8" />
        </g>
        <g data-hero-piece data-index="15">
          <polygon points="211.8,180.8 257.0,206.9 211.8,233.0 166.6,206.9" fill="url(#hc-gbt)" fillOpacity="0.95" stroke="#FFFFFF" strokeOpacity="0.8" strokeWidth="1.3" strokeLinejoin="round" />
          <polygon points="166.6,206.9 211.8,233.0 211.8,285.2 166.6,259.1" fill="url(#hc-gwl)" fillOpacity="0.95" stroke="#FFFFFF" strokeOpacity="0.8" strokeWidth="1.3" strokeLinejoin="round" />
          <polygon points="257.0,206.9 211.8,233.0 211.8,285.2 257.0,259.1" fill="url(#hc-gbr)" fillOpacity="0.95" stroke="#FFFFFF" strokeOpacity="0.8" strokeWidth="1.3" strokeLinejoin="round" />
          <polyline points="166.6,206.9 211.8,180.8 257.0,206.9" fill="none" stroke="#FFFFFF" strokeWidth="1.8" />
        </g>
        <g data-hero-piece data-index="16">
          <polygon points="262.0,267.8 307.2,293.9 262.0,320.0 216.8,293.9" fill="url(#hc-gbt)" fillOpacity="0.95" stroke="#FFFFFF" strokeOpacity="0.8" strokeWidth="1.3" strokeLinejoin="round" />
          <polygon points="216.8,293.9 262.0,320.0 262.0,372.2 216.8,346.1" fill="url(#hc-gwl)" fillOpacity="0.95" stroke="#FFFFFF" strokeOpacity="0.8" strokeWidth="1.3" strokeLinejoin="round" />
          <polygon points="307.2,293.9 262.0,320.0 262.0,372.2 307.2,346.1" fill="url(#hc-gwr)" fillOpacity="0.95" stroke="#FFFFFF" strokeOpacity="0.8" strokeWidth="1.3" strokeLinejoin="round" />
          <polyline points="216.8,293.9 262.0,267.8 307.2,293.9" fill="none" stroke="#FFFFFF" strokeWidth="1.8" />
        </g>
        <g data-hero-piece data-index="17">
          <polygon points="324.8,170.7 370.0,196.8 324.8,222.9 279.6,196.8" fill="url(#hc-glt)" fillOpacity="0.95" stroke="#FFFFFF" strokeOpacity="0.8" strokeWidth="1.3" strokeLinejoin="round" />
          <polygon points="279.6,196.8 324.8,222.9 324.8,275.1 279.6,249.0" fill="url(#hc-gpl)" fillOpacity="0.95" stroke="#FFFFFF" strokeOpacity="0.8" strokeWidth="1.3" strokeLinejoin="round" />
          <polygon points="370.0,196.8 324.8,222.9 324.8,275.1 370.0,249.0" fill="url(#hc-glr)" fillOpacity="0.95" stroke="#FFFFFF" strokeOpacity="0.8" strokeWidth="1.3" strokeLinejoin="round" />
          <polyline points="279.6,196.8 324.8,170.7 370.0,196.8" fill="none" stroke="#FFFFFF" strokeWidth="1.8" />
        </g>
        <g data-hero-piece data-index="18">
          <polygon points="272.0,198.2 317.3,224.3 272.0,250.4 226.8,224.3" fill="url(#hc-gpt)" fillOpacity="0.95" stroke="#FFFFFF" strokeOpacity="0.8" strokeWidth="1.3" strokeLinejoin="round" />
          <polygon points="226.8,224.3 272.0,250.4 272.0,302.6 226.8,276.5" fill="url(#hc-gbl)" fillOpacity="0.95" stroke="#FFFFFF" strokeOpacity="0.8" strokeWidth="1.3" strokeLinejoin="round" />
          <polygon points="317.3,224.3 272.0,250.4 272.0,302.6 317.3,276.5" fill="url(#hc-gbr)" fillOpacity="0.95" stroke="#FFFFFF" strokeOpacity="0.8" strokeWidth="1.3" strokeLinejoin="round" />
          <polyline points="226.8,224.3 272.0,198.2 317.3,224.3" fill="none" stroke="#FFFFFF" strokeWidth="1.8" />
        </g>
      </g>
      <g clipPath="url(#hc-front)" data-hero-ring="front">
        <ellipse cx="272" cy="282" rx="255" ry="66" fill="none" stroke="url(#hc-orb)" strokeWidth="2.2" transform="rotate(-14 272 282)" opacity="0.9" pathLength="1000" />
      </g>
    </svg>
  );
}
