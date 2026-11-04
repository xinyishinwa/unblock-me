import type { ThemeId } from "@/lib/game/special-types";

/**
 * Full-screen cartoon backdrops for the Golden Trails levels. Each one is an
 * opaque SVG that sits above the classic countryside scenery, keeping the same
 * colourful Amulung look (mountains, rice terraces, palms) in a new setting.
 */

function Sparkles({ colors, count = 14 }: { colors: string[]; count?: number }) {
  return (
    <g>
      {Array.from({ length: count }, (_, i) => (
        <circle
          key={i}
          className="animate-sparkle"
          cx={(i * 137) % 1200}
          cy={60 + ((i * 89) % 520)}
          r={2 + (i % 3)}
          fill={colors[i % colors.length]}
          style={{ animationDelay: `${(i % 7) * 0.4}s` }}
        />
      ))}
    </g>
  );
}

function Pine({ x, y, s = 1, snow = false }: { x: number; y: number; s?: number; snow?: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x="-5" y="-6" width="10" height="26" fill="#6b4220" />
      <path d="M0 -110 L-34 -50 H-18 L-44 -10 H44 L18 -50 H34Z" fill={snow ? "#2f7a5a" : "#2f8f3a"} stroke="#1f5a40" strokeWidth="2" />
      {snow && <path d="M0 -110 L-14 -82 Q0 -76 14 -82Z M-18 -50 L-26 -36 Q-10 -30 0 -38 Q12 -30 26 -36 L18 -50Z" fill="#fff" />}
    </g>
  );
}

function River() {
  return (
    <>
      <defs>
        <linearGradient id="riv-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6fcdf5" />
          <stop offset="1" stopColor="#d8f3fb" />
        </linearGradient>
        <linearGradient id="riv-water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#52b6ec" />
          <stop offset="1" stopColor="#2a7fc4" />
        </linearGradient>
      </defs>
      <rect width="1200" height="800" fill="url(#riv-sky)" />
      <circle cx="170" cy="140" r="56" fill="#ffe97a" />
      <path d="M0 400 L130 290 L240 360 L380 250 L520 370 L650 300 L800 390 L960 280 L1100 360 L1200 330 L1200 470 L0 470Z" fill="#7fb0d6" />
      <path d="M0 450 C200 400 400 440 600 420 C800 400 1000 440 1200 410 L1200 800 L0 800Z" fill="#7cc24a" />
      {/* river winding through the countryside */}
      <path d="M-20 560 C220 500 360 640 600 580 C840 520 980 640 1220 560 L1220 700 C980 780 840 660 600 720 C360 780 220 640 -20 700Z" fill="url(#riv-water)" />
      <g stroke="#fff" strokeWidth="5" strokeLinecap="round" fill="none" opacity="0.6" className="animate-ripple">
        <path d="M80 610 q20 -12 40 0 t40 0" />
        <path d="M420 640 q20 -12 40 0 t40 0" />
        <path d="M760 610 q20 -12 40 0 t40 0" />
        <path d="M1000 640 q20 -12 40 0 t40 0" />
      </g>
      <g fill="#3fae4a" stroke="#2a7a34" strokeWidth="2">
        <ellipse cx="260" cy="670" rx="26" ry="10" />
        <ellipse cx="900" cy="650" rx="22" ry="9" />
        <ellipse cx="640" cy="680" rx="18" ry="7" />
      </g>
      <path d="M0 740 C300 700 500 780 800 740 C1000 715 1100 750 1200 735 L1200 800 L0 800Z" fill="#6cb02f" />
      <g stroke="#3b8a2a" strokeWidth="5" strokeLinecap="round" fill="none">
        <path d="M70 790 l-8 -30 M80 790 l0 -36 M90 790 l9 -28" />
        <path d="M1090 790 l-8 -30 M1100 790 l0 -36 M1110 790 l9 -28" />
      </g>
    </>
  );
}

function TreasureGate() {
  return (
    <>
      <defs>
        <linearGradient id="tg-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffb86b" />
          <stop offset="0.55" stopColor="#ffe29a" />
          <stop offset="1" stopColor="#fff3c4" />
        </linearGradient>
      </defs>
      <rect width="1200" height="800" fill="url(#tg-sky)" />
      <circle cx="980" cy="170" r="70" fill="#fff0a0" opacity="0.9" />
      <path d="M0 470 L140 350 L260 420 L400 300 L540 430 L700 340 L860 440 L1020 330 L1200 440 L1200 520 L0 520Z" fill="#c79a74" />
      <path d="M0 520 C200 470 420 520 640 490 C860 460 1040 510 1200 485 L1200 800 L0 800Z" fill="#8fbf5a" />
      {/* old stone arch gate */}
      <g transform="translate(600 560)">
        <rect x="-300" y="-190" width="90" height="250" fill="#a5a8ad" stroke="#5a5d62" strokeWidth="4" />
        <rect x="210" y="-190" width="90" height="250" fill="#a5a8ad" stroke="#5a5d62" strokeWidth="4" />
        <path d="M-320 -190 Q0 -330 320 -190 L320 -150 Q0 -290 -320 -150Z" fill="#b8bbc0" stroke="#5a5d62" strokeWidth="4" />
        <g stroke="#7d8085" strokeWidth="3">
          <path d="M-300 -130 H-210 M-300 -70 H-210 M-300 -10 H-210 M210 -130 H300 M210 -70 H300 M210 -10 H300" />
        </g>
        <path d="M-300 -190 q20 40 0 90 M300 -190 q-20 40 0 90" stroke="#3f9d3f" strokeWidth="8" fill="none" />
        <circle cx="0" cy="-262" r="22" fill="#ffd21f" stroke="#a86f00" strokeWidth="4" />
      </g>
      <path d="M0 700 C300 660 500 740 800 700 C1000 676 1100 710 1200 695 L1200 800 L0 800Z" fill="#6cb02f" />
      <path d="M520 800 C560 740 520 720 560 690 L700 690 C730 720 700 750 760 800Z" fill="#d7a766" />
      <Sparkles colors={["#fff6b0", "#ffd21f"]} />
    </>
  );
}

function Enchanted() {
  return (
    <>
      <defs>
        <linearGradient id="en-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1d1450" />
          <stop offset="0.6" stopColor="#4a2a8c" />
          <stop offset="1" stopColor="#8a56c8" />
        </linearGradient>
        <radialGradient id="en-moon" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fff3b0" />
          <stop offset="1" stopColor="#fff3b0" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="1200" height="800" fill="url(#en-sky)" />
      <circle cx="930" cy="170" r="150" fill="url(#en-moon)" />
      <circle cx="930" cy="170" r="58" fill="#ffe97a" />
      <path d="M0 470 L130 350 L260 420 L400 320 L540 440 L700 350 L860 450 L1020 340 L1200 450 L1200 540 L0 540Z" fill="#3b2a7a" />
      <path d="M0 520 C200 470 420 520 640 490 C860 460 1040 510 1200 485 L1200 800 L0 800Z" fill="#2f6b52" />
      {[90, 250, 420, 790, 960, 1120].map((x, i) => (
        <g key={x} transform={`translate(${x} ${620 + (i % 3) * 30}) scale(${1 + (i % 3) * 0.2})`}>
          <rect x="-8" y="-60" width="16" height="70" fill="#4a2f66" />
          <circle cx="0" cy="-90" r="42" fill="#5b3aa0" />
          <circle cx="-26" cy="-68" r="28" fill="#6c47b8" />
          <circle cx="26" cy="-68" r="28" fill="#4f318f" />
          <circle cx="-8" cy="-100" r="12" fill="#c8a8ff" opacity="0.6" />
        </g>
      ))}
      <path d="M0 720 C300 690 500 760 800 720 C1000 696 1100 730 1200 715 L1200 800 L0 800Z" fill="#244f40" />
      <Sparkles colors={["#ffd21f", "#e0aaff", "#fff3b0"]} count={26} />
    </>
  );
}

function Frozen() {
  return (
    <>
      <defs>
        <linearGradient id="fr-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8fd0f3" />
          <stop offset="1" stopColor="#eaf8ff" />
        </linearGradient>
      </defs>
      <rect width="1200" height="800" fill="url(#fr-sky)" />
      <path d="M0 440 L130 300 L250 380 L390 240 L540 400 L700 300 L860 410 L1020 280 L1200 400 L1200 500 L0 500Z" fill="#a6c8e6" />
      <path d="M390 240 L430 300 L395 290 L360 315Z M1020 280 L1060 340 L1025 330 L990 350Z M130 300 L160 345 L135 338 L108 352Z" fill="#fff" />
      <path d="M0 500 C200 460 420 510 640 480 C860 450 1040 500 1200 475 L1200 800 L0 800Z" fill="#f4fbff" />
      <path d="M0 600 C300 570 520 640 820 600 C1000 575 1100 610 1200 595 L1200 800 L0 800Z" fill="#e3f3fb" />
      {[70, 210, 330, 880, 1010, 1130].map((x, i) => (
        <Pine key={x} x={x} y={600 + (i % 3) * 36} s={1 + (i % 3) * 0.25} snow />
      ))}
      {/* ice crystals */}
      {[[150, 700], [540, 740], [1040, 720]].map(([x, y]) => (
        <g key={x} transform={`translate(${x} ${y})`} fill="#bfe9ff" stroke="#5aa6d6" strokeWidth="3">
          <path d="M0 -50 L12 -10 L0 0 L-12 -10Z" />
          <path d="M-30 -30 L-8 -6 L-14 6 L-34 -10Z" />
          <path d="M30 -30 L8 -6 L14 6 L34 -10Z" />
        </g>
      ))}
      {/* falling snow */}
      <g fill="#fff">
        {Array.from({ length: 22 }, (_, i) => (
          <circle
            key={i}
            className="animate-snow"
            cx={(i * 113) % 1200}
            cy={0}
            r={2.5 + (i % 3)}
            style={{ animationDelay: `${(i % 9) * -1}s`, animationDuration: `${7 + (i % 5)}s` }}
          />
        ))}
      </g>
    </>
  );
}

function Cagayan() {
  return (
    <>
      <defs>
        <linearGradient id="cg-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4fb8f0" />
          <stop offset="0.55" stopColor="#ffd98a" />
          <stop offset="1" stopColor="#fff3c4" />
        </linearGradient>
        <radialGradient id="cg-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fff6b0" stopOpacity="0.95" />
          <stop offset="1" stopColor="#ffd21f" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="1200" height="800" fill="url(#cg-sky)" />
      <g className="origin-center animate-rays [transform-box:fill-box]" opacity="0.35">
        {Array.from({ length: 12 }, (_, i) => (
          <path key={i} d="M600 330 L560 -200 L640 -200Z" fill="#fff6b0" transform={`rotate(${i * 30} 600 330)`} />
        ))}
      </g>
      <circle cx="600" cy="330" r="230" fill="url(#cg-glow)" className="animate-glow" />
      {/* Sierra Madre peaks */}
      <path d="M0 520 L120 380 L220 450 L360 270 L500 440 L600 360 L700 450 L840 250 L980 440 L1100 360 L1200 450 L1200 560 L0 560Z" fill="#5f9fcf" />
      <path d="M360 270 L400 340 L362 328 L325 350Z M840 250 L885 325 L845 312 L805 338Z" fill="#fff" opacity="0.9" />
      <path d="M0 540 C150 470 300 480 440 530 C560 470 720 470 860 530 C980 480 1100 490 1200 520 L1200 620 L0 620Z" fill="#3f8f4a" />
      {/* rice terraces */}
      <path d="M0 600 C200 570 420 620 640 590 C860 560 1030 610 1200 585 L1200 800 L0 800Z" fill="#9bd14a" />
      <path d="M0 670 C240 640 460 695 700 662 C900 636 1060 680 1200 660 L1200 800 L0 800Z" fill="#7fbf35" />
      <path d="M0 740 C260 710 480 760 760 732 C960 712 1100 745 1200 730 L1200 800 L0 800Z" fill="#6cb02f" />
      {/* hidden treasure cave */}
      <g transform="translate(600 620)">
        <path d="M-120 20 Q-110 -90 0 -100 Q110 -90 120 20Z" fill="#6b5a4a" stroke="#3d2f24" strokeWidth="4" />
        <path d="M-70 20 Q-66 -55 0 -62 Q66 -55 70 20Z" fill="#ffd21f" opacity="0.9" className="animate-glow" />
        <g fill="#ffe680" stroke="#a86f00" strokeWidth="2">
          <ellipse cx="-24" cy="10" rx="14" ry="6" />
          <ellipse cx="6" cy="2" rx="16" ry="7" />
          <ellipse cx="30" cy="12" rx="13" ry="6" />
        </g>
      </g>
      {/* palms */}
      {[[90, 700, 1], [1110, 710, -1]].map(([x, y, lean]) => (
        <g key={x} transform={`translate(${x} ${y}) scale(${lean * 1.1} 1.1)`}>
          <path d="M0 0 C6 -50 -4 -90 10 -130" stroke="#7a4f27" strokeWidth="9" fill="none" strokeLinecap="round" />
          <g transform="translate(10 -130)" fill="#2f8f3a" stroke="#1f6b2b" strokeWidth="1.5">
            <path d="M0 0 C-20 -26 -50 -22 -70 -4 C-46 -12 -22 -10 0 0Z" />
            <path d="M0 0 C20 -26 50 -22 70 -4 C46 -12 22 -10 0 0Z" />
            <path d="M0 0 C-10 -34 -34 -48 -56 -46 C-34 -36 -16 -24 0 0Z" />
            <path d="M0 0 C10 -34 34 -48 56 -46 C34 -36 16 -24 0 0Z" />
          </g>
        </g>
      ))}
      <Sparkles colors={["#fff6b0", "#ffd21f", "#fff"]} count={24} />
    </>
  );
}

const BACKDROPS: Record<ThemeId, () => React.JSX.Element> = {
  river: River,
  "treasure-gate": TreasureGate,
  enchanted: Enchanted,
  frozen: Frozen,
  cagayan: Cagayan,
};

export default function ThemeBackdrop({ theme }: { theme: ThemeId }) {
  const Scene = BACKDROPS[theme];
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden" aria-hidden="true" data-theme-backdrop={theme}>
      <svg viewBox="0 0 1200 800" preserveAspectRatio="xMidYMax slice" className="h-full w-full">
        <Scene />
      </svg>
    </div>
  );
}
