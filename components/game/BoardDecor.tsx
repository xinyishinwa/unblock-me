import { Flame, KeyRound, Lock, LockOpen, ToggleRight } from "lucide-react";
import { BOARD_SIZE } from "@/lib/game/puzzle-engine";
import type { Cell, PuzzleState, SpecialConfig } from "@/lib/game/special-types";

const PCT = 100 / BOARD_SIZE;

function CellBox({
  cell,
  z = 5,
  children,
  className = "",
}: {
  cell: Cell;
  z?: number;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`pointer-events-none absolute ${className}`}
      style={{
        left: `${cell[0] * PCT}%`,
        top: `${cell[1] * PCT}%`,
        width: `${PCT}%`,
        height: `${PCT}%`,
        zIndex: z,
      }}
    >
      {children}
    </div>
  );
}

function Water({ shallow = false }: { shallow?: boolean }) {
  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{
        background: shallow
          ? "linear-gradient(180deg,#9be0f7,#6cc6ee)"
          : "linear-gradient(180deg,#3d9ad8,#1f6fb5)",
      }}
    >
      <svg viewBox="0 0 100 100" className="h-full w-full animate-ripple" aria-hidden="true">
        <path d="M8 30 q10 -8 20 0 t20 0 t20 0" stroke="#fff" strokeWidth="4" fill="none" opacity="0.55" strokeLinecap="round" />
        <path d="M18 62 q10 -8 20 0 t20 0 t20 0" stroke="#fff" strokeWidth="4" fill="none" opacity="0.4" strokeLinecap="round" />
        <path d="M4 86 q10 -8 20 0 t20 0" stroke="#fff" strokeWidth="3" fill="none" opacity="0.3" strokeLinecap="round" />
      </svg>
    </div>
  );
}

export function Stone() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full p-[6%] drop-shadow-md" aria-hidden="true">
      <path
        d="M14 78 C6 56 18 28 40 20 C60 12 86 24 90 50 C93 68 82 84 60 86 C40 88 20 88 14 78Z"
        fill="#9aa3ab"
        stroke="#5a636b"
        strokeWidth="4"
      />
      <path d="M26 40 C32 28 46 24 58 26" stroke="#d3d9de" strokeWidth="6" strokeLinecap="round" fill="none" opacity="0.8" />
      <path d="M30 70 L44 58 L52 66 M62 50 L72 62" stroke="#6c757d" strokeWidth="3" strokeLinecap="round" fill="none" />
      <ellipse cx="68" cy="78" rx="14" ry="6" fill="#5fae4a" opacity="0.85" />
    </svg>
  );
}

function BridgeCell({ open, first }: { open: boolean; first: boolean }) {
  return (
    <>
      <Water />
      {/* wooden deck – lowers (grows) when the bridge opens */}
      <div
        className="absolute inset-x-0 top-[18%] bottom-[18%] origin-center transition-all duration-700 ease-out"
        style={{
          transform: open ? "scaleY(1)" : "scaleY(0.06)",
          opacity: open ? 1 : 0.9,
        }}
      >
        <div className="h-full w-full border-y-4 border-[#4f2f18] bg-[repeating-linear-gradient(90deg,#b97b42_0_14%,#8a5428_14%_16%)]" />
      </div>
      {/* raised leaf standing at the bank while closed */}
      <div
        className="absolute bottom-[22%] top-[22%] w-[12%] origin-bottom rounded-sm bg-[#8a5428] ring-2 ring-[#4f2f18] transition-all duration-700 ease-out"
        style={{
          [first ? "left" : "right"]: "2%",
          opacity: open ? 0 : 1,
          transform: open ? "scaleY(0.2)" : "scaleY(1)",
        }}
      />
    </>
  );
}

function GateCell({ open }: { open: boolean }) {
  const Icon = open ? LockOpen : Lock;
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#d9ad6b]">
      {/* stone posts */}
      <div className="absolute inset-y-0 left-0 w-[14%] bg-[#8d8f94] ring-1 ring-[#555]" />
      <div className="absolute inset-y-0 right-0 w-[14%] bg-[#8d8f94] ring-1 ring-[#555]" />
      {/* iron bars slide up when unlocked */}
      <div
        className="absolute inset-y-[6%] left-[14%] right-[14%] transition-all duration-700 ease-in-out"
        style={{ transform: open ? "translateY(-88%)" : "translateY(0)", opacity: open ? 0.15 : 1 }}
      >
        <div className="h-full w-full bg-[repeating-linear-gradient(90deg,#3b3f45_0_14%,transparent_14%_30%)] ring-2 ring-[#2a2d31]" />
        <div className="absolute inset-x-0 top-[40%] h-[10%] bg-[#2a2d31]" />
      </div>
      <div
        className={`absolute left-1/2 top-1/2 flex h-[46%] w-[46%] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 transition-colors duration-500 ${
          open ? "border-green-800 bg-green-400 text-green-950" : "border-amber-800 bg-yellow-300 text-amber-950"
        }`}
      >
        <Icon className="h-[70%] w-[70%]" strokeWidth={3} aria-hidden="true" />
      </div>
    </div>
  );
}

type PadKind = "bridge" | "key" | "fire";

const PAD_STYLE: Record<PadKind, { ring: string; bg: string; on: string; Icon: typeof Flame; label: string }> = {
  bridge: { ring: "ring-sky-300", bg: "bg-sky-500/70", on: "bg-green-400/80", Icon: ToggleRight, label: "bridge switch" },
  key: { ring: "ring-yellow-300", bg: "bg-yellow-400/70", on: "bg-green-400/80", Icon: KeyRound, label: "key collection area" },
  fire: { ring: "ring-orange-300", bg: "bg-orange-500/70", on: "bg-orange-400/90", Icon: Flame, label: "fire switch" },
};

/** Glowing target pad that a designated log must cover. */
function Pad({ kind, active }: { kind: PadKind; active: boolean }) {
  const s = PAD_STYLE[kind];
  const Icon = s.Icon;
  return (
    <div
      className={`absolute inset-[8%] flex items-center justify-center rounded-xl ring-4 ${s.ring} ${
        active ? s.on : `${s.bg} animate-glow`
      }`}
      role="img"
      aria-label={`${s.label}${active ? " (activated)" : ""}`}
    >
      <Icon className="h-[60%] w-[60%] text-white drop-shadow" strokeWidth={2.6} aria-hidden="true" />
    </div>
  );
}

interface Props {
  special: SpecialConfig;
  state: PuzzleState;
}

/** Special board objects, drawn beneath the pieces. */
export default function BoardDecor({ special, state }: Props) {
  const bridgeCells = special.bridge?.cells ?? [];
  return (
    <>
      {special.shallows?.map((c) => (
        <CellBox key={`sh${c}`} cell={c} z={2} className="overflow-hidden">
          <Water shallow />
        </CellBox>
      ))}

      {bridgeCells.map((c, i) => (
        <CellBox key={`br${c}`} cell={c} z={4} className="overflow-hidden">
          <BridgeCell open={state.bridgeOpen} first={i === 0} />
        </CellBox>
      ))}

      {special.key?.gate.map((c) => (
        <CellBox key={`gt${c}`} cell={c} z={4}>
          <GateCell open={state.gateUnlocked} />
        </CellBox>
      ))}

      {special.stones?.map((c) => (
        <CellBox key={`st${c}`} cell={c} z={4}>
          <Stone />
        </CellBox>
      ))}

      {special.bridge && (
        <CellBox cell={special.bridge.trigger.cell} z={3}>
          <Pad kind="bridge" active={state.bridgeOpen} />
        </CellBox>
      )}
      {special.key && (
        <CellBox cell={special.key.trigger.cell} z={3}>
          <Pad kind="key" active={state.keyCollected} />
        </CellBox>
      )}
      {special.fire && (
        <CellBox cell={special.fire.trigger.cell} z={3}>
          <Pad kind="fire" active={state.fireActive} />
        </CellBox>
      )}
    </>
  );
}
