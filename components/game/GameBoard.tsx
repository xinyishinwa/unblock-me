"use client";

import {
  CSSProperties,
  PointerEvent as ReactPointerEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Flame, KeyRound, Snowflake, ToggleRight } from "lucide-react";
import {
  BOARD_SIZE,
  Move,
  POT_ID,
  Piece,
  axisPos,
  isHorizontal,
} from "@/lib/game/puzzle-engine";
import {
  canStateMoveTo,
  getStateMoveRange,
  isFrozen,
} from "@/lib/game/puzzle-state";
import type { PuzzleState, SpecialConfig, ThemeId } from "@/lib/game/special-types";
import BoardDecor from "./BoardDecor";
import LogBlock from "./LogBlock";
import PotOfGold from "./PotOfGold";
import { CLASSIC_TILES, THEMES } from "./themes";

interface Props {
  state: PuzzleState;
  special: SpecialConfig;
  theme?: ThemeId;
  hint: Move | null;
  solved: boolean;
  /** Blocks all input (paused, or win screen showing). */
  disabled: boolean;
  onMove: (id: string, to: number) => void;
  /** A slide was refused (blocked, frozen, ...): lets the screen explain why. */
  onReject: (id: string, dir: -1 | 1) => void;
  /** Piece id to shake (invalid-move feedback) and a counter to retrigger it. */
  shake?: { id: string; n: number } | null;
}

interface DragState {
  id: string;
  /** Fractional position along the piece's axis while dragging. */
  pos: number;
}

interface DragSession {
  pointerId: number;
  id: string;
  startPointer: number;
  startPos: number;
  attempt: -1 | 0 | 1;
  min: number;
  max: number;
  cell: number;
  horizontal: boolean;
  pos: number;
}

const PCT = 100 / BOARD_SIZE;
const EXIT_ROW = 2;

type Carrier = "bridge" | "key" | "fire";

function pieceLabel(p: Piece, frozen: boolean, carrier: Carrier | undefined, magical: boolean): string {
  if (p.id === POT_ID) return "Pot of Gold. Slide it right to the exit.";
  const extras = [
    frozen ? "frozen, cannot move" : "",
    carrier === "bridge" ? "bridge switch log" : "",
    carrier === "key" ? "key-carrying log" : "",
    carrier === "fire" ? "fire-carrying log" : "",
    magical ? "magical log, moves one cell at a time" : "",
  ].filter(Boolean);
  return `${p.orientation} log, ${p.length} cells long${extras.length ? ", " + extras.join(", ") : ""}`;
}

const CARRIER_STYLE: Record<Carrier, { bg: string; Icon: typeof Flame }> = {
  bridge: { bg: "bg-sky-500", Icon: ToggleRight },
  key: { bg: "bg-yellow-400 text-amber-950", Icon: KeyRound },
  fire: { bg: "bg-orange-500", Icon: Flame },
};

export default function GameBoard({
  state,
  special,
  theme,
  hint,
  solved,
  disabled,
  onMove,
  onReject,
  shake,
}: Props) {
  const pieces = state.pieces;
  const tiles = theme ? THEMES[theme].tiles : CLASSIC_TILES;
  const carriers: Record<string, Carrier> = {};
  if (special.bridge) carriers[special.bridge.trigger.logId] = "bridge";
  if (special.key) carriers[special.key.trigger.logId] = "key";
  if (special.fire) carriers[special.fire.trigger.logId] = "fire";
  const everFrozen = special.fire?.frozen ?? [];
  const fieldRef = useRef<HTMLDivElement>(null);
  const sessionRef = useRef<DragSession | null>(null);
  const [drag, setDrag] = useState<DragState | null>(null);
  const [selectedId, setSelectedId] = useState<string>(POT_ID);

  // Keyboard: arrow keys slide the selected log one cell.
  useEffect(() => {
    if (disabled) return;
    const onKey = (e: KeyboardEvent) => {
      const keys: Record<string, [boolean, number]> = {
        ArrowLeft: [true, -1],
        ArrowRight: [true, 1],
        ArrowUp: [false, -1],
        ArrowDown: [false, 1],
      };
      const entry = keys[e.key];
      if (!entry) return;
      e.preventDefault();
      const piece = pieces.find((p) => p.id === selectedId);
      if (!piece) return;
      const [horizontalKey, delta] = entry;
      if (horizontalKey !== isHorizontal(piece)) return;
      const to = axisPos(piece) + delta;
      if (canStateMoveTo(state, special, piece.id, to)) onMove(piece.id, to);
      else onReject(piece.id, delta > 0 ? 1 : -1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [disabled, pieces, state, special, selectedId, onMove, onReject]);

  const handleDown = (e: ReactPointerEvent<HTMLDivElement>, piece: Piece) => {
    setSelectedId(piece.id);
    if (disabled || !fieldRef.current) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const horizontal = isHorizontal(piece);
    const cell = fieldRef.current.getBoundingClientRect().width / BOARD_SIZE;
    const { min, max } = getStateMoveRange(state, special, piece.id);
    const startPos = axisPos(piece);
    sessionRef.current = {
      pointerId: e.pointerId,
      id: piece.id,
      startPointer: horizontal ? e.clientX : e.clientY,
      startPos,
      attempt: 0,
      min,
      max,
      cell,
      horizontal,
      pos: startPos,
    };
  };

  const handleMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const s = sessionRef.current;
    if (!s || s.pointerId !== e.pointerId) return;
    const current = s.horizontal ? e.clientX : e.clientY;
    const raw = s.startPos + (current - s.startPointer) / s.cell;
    if (Math.abs(raw - s.startPos) > 0.3) s.attempt = raw > s.startPos ? 1 : -1;
    s.pos = Math.min(s.max, Math.max(s.min, raw));
    setDrag({ id: s.id, pos: s.pos });
  };

  const handleUp = (e: ReactPointerEvent<HTMLDivElement>, commit: boolean) => {
    const s = sessionRef.current;
    if (!s || s.pointerId !== e.pointerId) return;
    sessionRef.current = null;
    setDrag(null);
    const target = Math.min(s.max, Math.max(s.min, Math.round(s.pos)));
    if (commit && target !== s.startPos) onMove(s.id, target);
    else if (commit && s.attempt !== 0) onReject(s.id, s.attempt);
  };

  const hintDelta = hint ? hint.to - hint.from : 0;

  return (
    <div
      className="flex items-start"
      style={{ ["--board" as string]: "max(220px, min(calc(100vw - 7.5rem), 58vh, 520px))" }}
    >
      {/* wooden frame */}
      <div className="relative rounded-2xl border-4 border-[#3d2410] bg-gradient-to-b from-[#8b5a2b] to-[#6b4220] p-3 shadow-2xl">
        {/* the opening in the frame – the exit */}
        <div
          className="absolute z-10 bg-[#d9ad6b]"
          style={{
            right: -4,
            width: 16,
            top: "calc(0.75rem + var(--board) / 3)",
            height: "calc(var(--board) / 6)",
          }}
        />

        <div
          ref={fieldRef}
          className="relative select-none overflow-visible rounded-lg"
          style={{ width: "var(--board)", height: "var(--board)" }}
        >
          {/* grid cells */}
          <div
            className="absolute inset-0 grid overflow-hidden rounded-lg"
            style={{
              gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)`,
              gridTemplateRows: `repeat(${BOARD_SIZE}, 1fr)`,
            }}
          >
            {Array.from({ length: BOARD_SIZE * BOARD_SIZE }, (_, i) => {
              const row = Math.floor(i / BOARD_SIZE);
              const col = i % BOARD_SIZE;
              const exitRow = row === EXIT_ROW;
              const even = (row + col) % 2 === 0;
              const tint = exitRow ? (even ? tiles[2] : tiles[3]) : even ? tiles[0] : tiles[1];
              return (
                <div
                  key={i}
                  className="border border-black/10"
                  style={{ background: tint }}
                />
              );
            })}
          </div>

          <BoardDecor special={special} state={state} />

          {/* pieces */}
          {pieces.map((p) => {
            const isPot = p.id === POT_ID;
            const horizontal = isHorizontal(p);
            const dragging = drag?.id === p.id;
            let pos = dragging ? drag.pos : axisPos(p);
            if (isPot && solved) pos = BOARD_SIZE + 1; // roll out through the exit
            const style: CSSProperties = {
              left: `${(horizontal ? pos : p.x) * PCT}%`,
              top: `${(horizontal ? p.y : pos) * PCT}%`,
              width: `${(horizontal ? p.length : 1) * PCT}%`,
              height: `${(horizontal ? 1 : p.length) * PCT}%`,
              zIndex: dragging ? 40 : isPot ? 30 : 20,
              touchAction: "none",
              transition: dragging
                ? "none"
                : isPot && solved
                  ? "left 1s ease-in, opacity 1s ease-in"
                  : "left 160ms ease-out, top 160ms ease-out",
              opacity: isPot && solved ? 0 : 1,
            };
            const selected = selectedId === p.id && !disabled;
            const hinted = hint?.id === p.id;
            const frozen = isFrozen(state, p.id);
            const meltable = everFrozen.includes(p.id);
            const carrier = carriers[p.id];
            const magical = !!special.magical?.[p.id];
            const shaking = shake?.id === p.id;
            return (
              <div
                key={p.id}
                role="button"
                tabIndex={disabled ? -1 : 0}
                aria-label={pieceLabel(p, frozen, carrier, magical)}
                data-piece={p.id}
                onFocus={() => setSelectedId(p.id)}
                onPointerDown={(e) => handleDown(e, p)}
                onPointerMove={handleMove}
                onPointerUp={(e) => handleUp(e, true)}
                onPointerCancel={(e) => handleUp(e, false)}
                className={`absolute p-[3px] outline-none ${
                  disabled ? "cursor-default" : dragging ? "cursor-grabbing" : "cursor-grab"
                }`}
                style={style}
              >
                <div
                  className={`relative h-full w-full rounded-lg ${
                    dragging ? "scale-[1.03] drop-shadow-2xl" : "drop-shadow-md"
                  } ${selected ? "ring-4 ring-white/90" : ""} ${hinted ? "animate-hint ring-4 ring-yellow-300" : ""} ${
                    magical ? "shadow-[0_0_14px_4px_rgba(192,132,252,0.95)]" : ""
                  }`}
                >
                  <div key={shaking ? shake.n : 0} className={`h-full w-full ${shaking ? "animate-shake" : ""}`}>
                    {isPot ? <PotOfGold /> : <LogBlock piece={p} />}
                  </div>
                  {meltable && (
                    <div
                      aria-hidden="true"
                      className={`pointer-events-none absolute inset-0 flex items-center justify-center rounded-lg border-[3px] border-white/90 bg-gradient-to-b from-sky-100/90 via-cyan-200/80 to-sky-300/85 ${
                        frozen ? "" : "animate-melt"
                      }`}
                    >
                      <Snowflake className="h-[45%] max-h-8 w-auto text-sky-700 drop-shadow" strokeWidth={2.6} />
                    </div>
                  )}
                  {carrier && !frozen && (
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white text-white shadow ${CARRIER_STYLE[carrier].bg}`}
                    >
                      {(() => {
                        const I = CARRIER_STYLE[carrier].Icon;
                        return <I size={14} strokeWidth={3} />;
                      })()}
                    </span>
                  )}
                  {magical && (
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute -left-1 -top-1 rounded-full border-2 border-white bg-purple-600 px-1 text-[10px] font-extrabold leading-4 text-white shadow"
                    >
                      ×1
                    </span>
                  )}
                  {hinted && (
                    <span className="pointer-events-none absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-0.5 rounded-full bg-yellow-300 px-2 py-1 text-xs font-extrabold text-amber-950 shadow-lg">
                      {horizontal ? (
                        hintDelta > 0 ? <ArrowRight size={16} /> : <ArrowLeft size={16} />
                      ) : hintDelta > 0 ? (
                        <ArrowDown size={16} />
                      ) : (
                        <ArrowUp size={16} />
                      )}
                      {Math.abs(hintDelta)}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* exit lane */}
      <div
        className="relative w-[44px] shrink-0"
        style={{
          marginTop: "calc(16px + var(--board) / 3)",
          height: "calc(var(--board) / 6)",
        }}
      >
        <div className="absolute inset-y-0 left-0 right-0 rounded-r-xl bg-[#d9ad6b] shadow-inner" />
        <div className="absolute -top-7 left-0 right-0 flex justify-center">
          <span className="rounded-full bg-green-600 px-2 py-0.5 font-display text-[11px] font-extrabold uppercase tracking-wider text-white shadow">
            Exit
          </span>
        </div>
        <div className="absolute inset-0 flex items-center justify-center text-green-800">
          <ArrowRight className="animate-nudge" size={26} strokeWidth={3.5} />
        </div>
      </div>
    </div>
  );
}
