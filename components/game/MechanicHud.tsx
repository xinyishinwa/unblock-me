import { Flame, Hourglass, KeyRound, Lock, LockOpen, Snowflake, Droplets } from "lucide-react";
import type { PuzzleState, SpecialConfig } from "@/lib/game/special-types";

function Chip({
  active,
  tone,
  icon,
  label,
  value,
  testId,
}: {
  active: boolean;
  tone: "sky" | "gold" | "fire" | "ice" | "purple";
  icon: React.ReactNode;
  label: string;
  value: string;
  testId: string;
}) {
  const tones: Record<string, string> = {
    sky: active ? "bg-green-200 border-green-700" : "bg-sky-200 border-sky-700",
    gold: active ? "bg-green-200 border-green-700" : "bg-yellow-200 border-amber-700",
    fire: active ? "bg-orange-200 border-orange-700" : "bg-cyan-100 border-sky-700",
    ice: "bg-cyan-100 border-sky-700",
    purple: "bg-purple-200 border-purple-800",
  };
  return (
    <div
      className={`flex items-center gap-2 rounded-2xl border-[3px] px-3 py-1 text-left shadow ${tones[tone]}`}
      data-testid={testId}
    >
      <span aria-hidden="true">{icon}</span>
      <span className="leading-tight">
        <span className="block text-[10px] font-bold uppercase tracking-wider text-[#7a5430]">{label}</span>
        <span className="block font-display text-base font-extrabold">{value}</span>
      </span>
    </div>
  );
}

interface Props {
  state: PuzzleState;
  special: SpecialConfig;
}

/** Status indicators for whichever special mechanics the level uses. */
export default function MechanicHud({ state, special }: Props) {
  const chips: React.ReactNode[] = [];

  if (special.bridge) {
    chips.push(
      <Chip
        key="bridge"
        testId="hud-bridge"
        tone="sky"
        active={state.bridgeOpen}
        icon={<Droplets size={22} className={state.bridgeOpen ? "text-green-800" : "text-sky-800"} />}
        label="Bridge"
        value={state.bridgeOpen ? "Open" : "Closed"}
      />,
    );
  }
  if (special.key) {
    const Icon = state.gateUnlocked ? LockOpen : Lock;
    chips.push(
      <Chip
        key="key"
        testId="hud-key"
        tone="gold"
        active={state.keyCollected}
        icon={<KeyRound size={22} className={state.keyCollected ? "text-green-800" : "text-amber-700"} />}
        label="Golden Key"
        value={state.keyCollected ? "Collected" : "Not found"}
      />,
      <Chip
        key="gate"
        testId="hud-gate"
        tone="gold"
        active={state.gateUnlocked}
        icon={<Icon size={22} className={state.gateUnlocked ? "text-green-800" : "text-amber-700"} />}
        label="Gate"
        value={state.gateUnlocked ? "Unlocked" : "Locked"}
      />,
    );
  }
  if (special.fire) {
    chips.push(
      <Chip
        key="fire"
        testId="hud-fire"
        tone="fire"
        active={state.fireActive}
        icon={
          state.fireActive ? (
            <Flame size={22} className="text-orange-600" />
          ) : (
            <Snowflake size={22} className="text-sky-700" />
          )
        }
        label="Fire switch"
        value={
          state.fireActive
            ? "Lit — ice melted"
            : `Frozen: ${state.frozen.length} log${state.frozen.length === 1 ? "" : "s"}`
        }
      />,
    );
  }
  if (special.magical) {
    chips.push(
      <Chip
        key="magic"
        testId="hud-magic"
        tone="purple"
        active
        icon={<span className="text-lg font-black text-purple-800">×1</span>}
        label="Magical log"
        value="1 cell per move"
      />,
    );
  }

  if (chips.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center justify-center gap-2" aria-live="polite">
      {chips}
    </div>
  );
}

/** Large remaining-moves counter for limited-move levels. */
export function MovesLeft({ left, limit }: { left: number; limit: number }) {
  const low = left <= 3;
  return (
    <div
      className={`panel flex items-center gap-3 px-5 py-1.5 text-center ${
        low ? "!border-red-700 !bg-red-100" : "!border-purple-800 !bg-purple-100"
      }`}
      data-testid="moves-left-panel"
      role="status"
      aria-label={`${left} moves remaining of ${limit}`}
    >
      <Hourglass size={26} className={low ? "text-red-700" : "text-purple-800"} aria-hidden="true" />
      <div>
        <p className="text-[11px] font-bold uppercase text-[#7a5430]">Moves left</p>
        <p
          className={`font-display text-4xl font-extrabold leading-none ${low ? "text-red-700" : "text-purple-900"}`}
          data-testid="moves-left"
        >
          {left}
          <span className="text-lg text-stone-500"> / {limit}</span>
        </p>
      </div>
    </div>
  );
}
