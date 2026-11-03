/** The golden treasure pot – brimming with coins, glowing, unmistakable. */
export default function PotOfGold({ glow = true }: { glow?: boolean }) {
  return (
    <svg viewBox="0 0 200 100" className="block h-full w-full overflow-visible" aria-hidden="true">
      <defs>
        <linearGradient id="pot-body" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffe680" />
          <stop offset="0.45" stopColor="#f5b800" />
          <stop offset="1" stopColor="#b97800" />
        </linearGradient>
        <radialGradient id="pot-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fff3a0" stopOpacity="0.95" />
          <stop offset="1" stopColor="#ffd84d" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="coin" cx="0.35" cy="0.35" r="0.8">
          <stop offset="0" stopColor="#fff6b0" />
          <stop offset="0.6" stopColor="#ffd21f" />
          <stop offset="1" stopColor="#d99a00" />
        </radialGradient>
      </defs>

      {glow && <ellipse cx="100" cy="50" rx="98" ry="48" fill="url(#pot-glow)" className="animate-sparkle" />}

      {/* ground shadow */}
      <ellipse cx="100" cy="90" rx="62" ry="7" fill="#000" opacity="0.25" />

      {/* heap of coins */}
      <g stroke="#a86f00" strokeWidth="2">
        <ellipse cx="62" cy="38" rx="17" ry="8" fill="url(#coin)" transform="rotate(-18 62 38)" />
        <ellipse cx="138" cy="38" rx="17" ry="8" fill="url(#coin)" transform="rotate(18 138 38)" />
        <ellipse cx="82" cy="28" rx="18" ry="9" fill="url(#coin)" transform="rotate(-8 82 28)" />
        <ellipse cx="120" cy="28" rx="18" ry="9" fill="url(#coin)" transform="rotate(10 120 28)" />
        <ellipse cx="100" cy="20" rx="19" ry="10" fill="url(#coin)" />
        <ellipse cx="100" cy="20" rx="9" ry="4.5" fill="none" stroke="#c98a00" strokeWidth="1.5" />
      </g>

      {/* handles */}
      <path d="M44 56 C26 52 26 74 48 72" fill="none" stroke="#8a5a00" strokeWidth="6" strokeLinecap="round" />
      <path d="M156 56 C174 52 174 74 152 72" fill="none" stroke="#8a5a00" strokeWidth="6" strokeLinecap="round" />

      {/* belly */}
      <path
        d="M40 44 C32 70 48 90 100 90 C152 90 168 70 160 44 Z"
        fill="url(#pot-body)"
        stroke="#8a5a00"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      {/* rim */}
      <rect x="34" y="38" width="132" height="14" rx="7" fill="#ffd633" stroke="#8a5a00" strokeWidth="3.5" />
      {/* decoration band */}
      <path d="M52 66 Q100 78 148 66" fill="none" stroke="#8a5a00" strokeWidth="2.5" opacity="0.7" />
      <g fill="#8a5a00" opacity="0.7">
        <circle cx="70" cy="70" r="2.5" />
        <circle cx="100" cy="75" r="2.5" />
        <circle cx="130" cy="70" r="2.5" />
      </g>
      {/* shine */}
      <path d="M52 58 C50 66 54 76 62 82" fill="none" stroke="#fff8c9" strokeWidth="5" strokeLinecap="round" opacity="0.85" />

      {/* sparkles */}
      <g fill="#fffbe0" stroke="#f2b800" strokeWidth="1">
        <path className="animate-sparkle origin-center [transform-box:fill-box]" d="M168 14 l3 8 8 3 -8 3 -3 8 -3 -8 -8 -3 8 -3z" />
        <path className="animate-sparkle [animation-delay:0.9s] origin-center [transform-box:fill-box]" d="M28 20 l2 6 6 2 -6 2 -2 6 -2 -6 -6 -2 6 -2z" />
      </g>
    </svg>
  );
}
