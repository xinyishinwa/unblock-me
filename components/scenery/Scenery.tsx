/**
 * Full-screen cartoon countryside backdrop (Amulung, Cagayan): sky, Sierra
 * Madre mountains, rice terraces, a dirt path, bahay kubo houses, palms.
 * Pure SVG – no external assets.
 */

function House({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {/* stilts */}
      <rect x="-34" y="20" width="8" height="30" fill="#6b4220" />
      <rect x="26" y="20" width="8" height="30" fill="#6b4220" />
      <rect x="-4" y="20" width="8" height="30" fill="#6b4220" />
      {/* floor + walls (woven bamboo) */}
      <rect x="-40" y="14" width="80" height="8" rx="2" fill="#8b5a2b" />
      <rect x="-34" y="-12" width="68" height="28" fill="#e6c07b" />
      <path d="M-34 -4H34M-34 4H34M-34 12H34" stroke="#c99a52" strokeWidth="1.5" />
      <rect x="-8" y="-6" width="16" height="20" rx="2" fill="#7a4a22" />
      {/* nipa roof */}
      <path d="M-52 -8 L0 -52 L52 -8 Z" fill="#c9a24a" />
      <path d="M-40 -14 L0 -46 L40 -14" stroke="#a37f2c" strokeWidth="2" fill="none" />
      <path d="M-28 -8 L0 -32 L28 -8" stroke="#a37f2c" strokeWidth="2" fill="none" />
      {/* ladder */}
      <path d="M40 50 L34 18" stroke="#6b4220" strokeWidth="3" />
    </g>
  );
}

function Palm({ x, y, s = 1, lean = 1 }: { x: number; y: number; s?: number; lean?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s * lean} ${s})`}>
      <path d="M0 0 C6 -50 -4 -90 10 -130" stroke="#7a4f27" strokeWidth="9" fill="none" strokeLinecap="round" />
      <g transform="translate(10 -130)" fill="#2f8f3a" stroke="#1f6b2b" strokeWidth="1.5">
        <path d="M0 0 C-20 -26 -50 -22 -70 -4 C-46 -12 -22 -10 0 0Z" />
        <path d="M0 0 C20 -26 50 -22 70 -4 C46 -12 22 -10 0 0Z" />
        <path d="M0 0 C-10 -34 -34 -48 -56 -46 C-34 -36 -16 -24 0 0Z" />
        <path d="M0 0 C10 -34 34 -48 56 -46 C34 -36 16 -24 0 0Z" />
        <path d="M0 0 C-4 -36 4 -54 0 -64 C12 -50 8 -26 0 0Z" />
        <circle cx="-4" cy="4" r="5" fill="#8a5a2b" stroke="none" />
        <circle cx="5" cy="5" r="5" fill="#8a5a2b" stroke="none" />
      </g>
    </g>
  );
}

function Tree({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x="-5" y="-30" width="10" height="34" rx="3" fill="#7a4f27" />
      <circle cx="0" cy="-48" r="26" fill="#3f9d3f" />
      <circle cx="-18" cy="-36" r="18" fill="#4cae4a" />
      <circle cx="18" cy="-36" r="18" fill="#379337" />
      <circle cx="-6" cy="-58" r="10" fill="#63c15a" opacity="0.7" />
    </g>
  );
}

function Cloud({ x, y, s = 1, className = "" }: { x: number; y: number; s?: number; className?: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <g className={className}>
        <ellipse cx="0" cy="0" rx="60" ry="20" fill="#fff" opacity="0.95" />
        <ellipse cx="-24" cy="-14" rx="28" ry="20" fill="#fff" opacity="0.95" />
        <ellipse cx="18" cy="-18" rx="32" ry="24" fill="#fff" opacity="0.95" />
      </g>
    </g>
  );
}

export default function Scenery() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
      <svg
        viewBox="0 0 1200 800"
        preserveAspectRatio="xMidYMax slice"
        className="h-full w-full"
      >
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#5fc3f0" />
            <stop offset="0.6" stopColor="#bfe9f7" />
            <stop offset="1" stopColor="#fff3c4" />
          </linearGradient>
          <radialGradient id="sun" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#fff7b0" stopOpacity="1" />
            <stop offset="0.45" stopColor="#ffe066" stopOpacity="0.8" />
            <stop offset="1" stopColor="#ffe066" stopOpacity="0" />
          </radialGradient>
          <pattern id="rice" width="14" height="14" patternUnits="userSpaceOnUse">
            <path d="M2 14 L4 4 M7 14 L7 3 M12 14 L10 5" stroke="#4d9a1f" strokeWidth="1.6" strokeLinecap="round" />
          </pattern>
        </defs>

        <rect width="1200" height="800" fill="url(#sky)" />
        <circle cx="960" cy="150" r="130" fill="url(#sun)" />
        <circle cx="960" cy="150" r="52" fill="#ffe97a" />

        <Cloud x={220} y={120} s={1.1} className="animate-drift" />
        <Cloud x={600} y={80} s={0.8} className="animate-drift-slow" />
        <Cloud x={1050} y={230} s={0.9} className="animate-drift" />

        {/* far Sierra Madre ridge */}
        <path
          d="M0 470 L110 330 L190 400 L320 250 L450 410 L560 330 L700 440 L820 300 L950 420 L1080 340 L1200 430 L1200 520 L0 520Z"
          fill="#7aa5cf"
        />
        <path d="M320 250 L350 300 L325 290 L300 310Z M820 300 L845 345 L822 335 L800 350Z" fill="#e8f3fb" opacity="0.85" />
        {/* near green hills */}
        <path
          d="M0 500 C120 420 240 430 360 480 C480 420 600 410 720 470 C840 410 1000 420 1200 490 L1200 560 L0 560Z"
          fill="#4f9a56"
        />

        {/* rice terraces */}
        <path d="M0 520 C200 495 400 540 600 515 C800 490 1000 535 1200 510 L1200 800 L0 800Z" fill="#9bd14a" />
        <path d="M0 520 C200 495 400 540 600 515 C800 490 1000 535 1200 510 L1200 800 L0 800Z" fill="url(#rice)" opacity="0.7" />
        <path d="M0 585 C220 555 420 610 640 580 C860 550 1030 600 1200 575 L1200 800 L0 800Z" fill="#7fbf35" />
        <path d="M0 585 C220 555 420 610 640 580 C860 550 1030 600 1200 575 L1200 800 L0 800Z" fill="url(#rice)" opacity="0.8" />
        <path d="M0 655 C240 625 460 680 700 648 C900 622 1060 665 1200 645 L1200 800 L0 800Z" fill="#a8dc55" />
        <path d="M0 655 C240 625 460 680 700 648 C900 622 1060 665 1200 645 L1200 800 L0 800Z" fill="url(#rice)" opacity="0.8" />
        <path d="M0 730 C260 700 480 750 760 722 C960 702 1100 735 1200 720 L1200 800 L0 800Z" fill="#6cb02f" />

        {/* dirt path */}
        <path
          d="M560 520 C600 560 520 600 580 640 C660 690 480 720 440 800 L760 800 C720 730 800 700 700 650 C640 620 680 580 620 520Z"
          fill="#d7a766"
        />
        <path d="M580 640 C650 690 510 720 480 800" stroke="#bf8a4a" strokeWidth="3" fill="none" opacity="0.6" />

        {/* houses */}
        <House x={170} y={510} s={0.8} />
        <House x={1040} y={560} s={1} />
        <House x={880} y={512} s={0.55} />

        {/* trees & palms */}
        <Palm x={60} y={640} s={1.1} />
        <Palm x={330} y={575} s={0.7} lean={-1} />
        <Palm x={1140} y={650} s={1.2} lean={-1} />
        <Palm x={780} y={590} s={0.6} />
        <Tree x={270} y={535} s={0.7} />
        <Tree x={960} y={540} s={0.6} />
        <Tree x={20} y={720} s={1.2} />

        {/* foreground grass tufts */}
        <g stroke="#3b8a2a" strokeWidth="4" strokeLinecap="round" fill="none">
          <path d="M120 790 l-8 -26 M128 790 l0 -32 M136 790 l9 -24" />
          <path d="M980 785 l-8 -26 M988 785 l0 -32 M996 785 l9 -24" />
          <path d="M380 795 l-6 -20 M388 795 l1 -26 M396 795 l8 -20" />
        </g>
        {/* sparkles near the horizon */}
        <g fill="#fff9c4">
          <circle className="animate-sparkle" cx="600" cy="500" r="4" />
          <circle className="animate-sparkle [animation-delay:0.7s]" cx="640" cy="480" r="3" />
        </g>
      </svg>
    </div>
  );
}
