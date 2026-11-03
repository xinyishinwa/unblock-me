import type { Piece } from "@/lib/game/puzzle-engine";

/** Wood palettes – each log gets one so neighbouring logs are distinguishable. */
const PALETTES = [
  { bark: "#8a5428", barkDark: "#5e3718", barkLight: "#a8693a", core: "#efc98c", ring: "#b9803f" },
  { bark: "#7a4a2a", barkDark: "#4f2f18", barkLight: "#97603a", core: "#e9bf80", ring: "#a8733a" },
  { bark: "#9a6431", barkDark: "#6b4220", barkLight: "#b97b42", core: "#f3d39b", ring: "#c08a4a" },
  { bark: "#6f4a30", barkDark: "#47301f", barkLight: "#8c6140", core: "#e2b878", ring: "#a07040" },
];

function paletteFor(id: string) {
  let h = 0;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return PALETTES[h % PALETTES.length];
}

interface Props {
  piece: Piece;
}

/** Cartoon log drawn in a viewBox where one grid cell = 100 units. */
export default function LogBlock({ piece }: Props) {
  const pal = paletteFor(piece.id);
  const horizontal = piece.orientation === "horizontal";
  const L = piece.length * 100;
  const gid = `log-${piece.id}`;

  if (horizontal) {
    const bx = 20;
    const bw = L - 40;
    const lines = [30, 44, 58, 72];
    return (
      <svg viewBox={`0 0 ${L} 100`} className="block h-full w-full" aria-hidden="true">
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={pal.barkLight} />
            <stop offset="0.5" stopColor={pal.bark} />
            <stop offset="1" stopColor={pal.barkDark} />
          </linearGradient>
        </defs>
        <rect x={bx} y="13" width={bw} height="74" rx="8" fill={`url(#${gid})`} stroke={pal.barkDark} strokeWidth="3" />
        {lines.map((y, i) => (
          <path
            key={y}
            d={`M${bx + 14 + i * 9} ${y} H${bx + bw - 18 - ((i * 13) % 30)}`}
            stroke={pal.barkDark}
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity="0.55"
          />
        ))}
        <ellipse cx={L / 2} cy="26" rx="10" ry="4" fill={pal.barkLight} opacity="0.7" />
        {/* cut ends */}
        {[bx, L - bx].map((cx) => (
          <g key={cx}>
            <ellipse cx={cx} cy="50" rx="15" ry="37" fill={pal.core} stroke={pal.barkDark} strokeWidth="3" />
            <ellipse cx={cx} cy="50" rx="10" ry="26" fill="none" stroke={pal.ring} strokeWidth="2.5" />
            <ellipse cx={cx} cy="50" rx="5" ry="14" fill="none" stroke={pal.ring} strokeWidth="2.5" />
            <circle cx={cx} cy="50" r="2.5" fill={pal.ring} />
          </g>
        ))}
      </svg>
    );
  }

  const by = 20;
  const bh = L - 40;
  const lines = [28, 42, 58, 72];
  return (
    <svg viewBox={`0 0 100 ${L}`} className="block h-full w-full" aria-hidden="true">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={pal.barkLight} />
          <stop offset="0.5" stopColor={pal.bark} />
          <stop offset="1" stopColor={pal.barkDark} />
        </linearGradient>
      </defs>
      <rect x="13" y={by} width="74" height={bh} rx="8" fill={`url(#${gid})`} stroke={pal.barkDark} strokeWidth="3" />
      {lines.map((x, i) => (
        <path
          key={x}
          d={`M${x} ${by + 14 + i * 9} V${by + bh - 16 - ((i * 17) % 34)}`}
          stroke={pal.barkDark}
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0.55"
        />
      ))}
      {/* knot */}
      <ellipse cx="62" cy={L / 2} rx="7" ry="10" fill={pal.barkDark} opacity="0.55" />
      <ellipse cx="62" cy={L / 2} rx="3" ry="5" fill={pal.bark} />
      {/* top cut end (rings) */}
      <ellipse cx="50" cy={by} rx="37" ry="15" fill={pal.core} stroke={pal.barkDark} strokeWidth="3" />
      <ellipse cx="50" cy={by} rx="26" ry="10" fill="none" stroke={pal.ring} strokeWidth="2.5" />
      <ellipse cx="50" cy={by} rx="14" ry="5" fill="none" stroke={pal.ring} strokeWidth="2.5" />
      <circle cx="50" cy={by} r="2.5" fill={pal.ring} />
      {/* bottom end */}
      <ellipse cx="50" cy={L - by} rx="37" ry="15" fill={pal.core} stroke={pal.barkDark} strokeWidth="3" />
      <ellipse cx="50" cy={L - by} rx="26" ry="10" fill="none" stroke={pal.ring} strokeWidth="2.5" />
      <ellipse cx="50" cy={L - by} rx="14" ry="5" fill="none" stroke={pal.ring} strokeWidth="2.5" />
      <circle cx="50" cy={L - by} r="2.5" fill={pal.ring} />
    </svg>
  );
}
