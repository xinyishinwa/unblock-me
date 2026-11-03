"use client";

import {
  CSSProperties,
  PointerEvent as ReactPointerEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp } from "lucide-react";
import {
  BOARD_SIZE,
  Move,
  POT_ID,
  Piece,
  axisPos,
  canMoveTo,
  getMoveRange,
  isHorizontal,
} from "@/lib/game/puzzle-engine";
import LogBlock from "./LogBlock";
import PotOfGold from "./PotOfGold";

interface Props {
  pieces: readonly Piece[];
  hint: Move | null;
  solved: boolean;
  /** Blocks all input (paused, or win screen showing). */
  disabled: boolean;
  onMove: (id: string, to: number) => void;
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
  min: number;
  max: number;
  cell: number;
  horizontal: boolean;
  pos: number;
}

const PCT = 100 / BOARD_SIZE;
const EXIT_ROW = 2;

function pieceLabel(p: Piece): string {
  if (p.id === POT_ID) return "Pot of Gold. Slide it right to the exit.";
  return `${p.orientation} log, ${p.length} cells long`;
}

export default function GameBoard({ pieces, hint, solved, disabled, onMove }: Props) {
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
      if (canMoveTo(pieces, piece.id, to)) onMove(piece.id, to);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [disabled, pieces, selectedId, onMove]);

  const handleDown = (e: ReactPointerEvent<HTMLDivElement>, piece: Piece) => {
    setSelectedId(piece.id);
    if (disabled || !fieldRef.current) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const horizontal = isHorizontal(piece);
    const cell = fieldRef.current.getBoundingClientRect().width / BOARD_SIZE;
    const { min, max } = getMoveRange(pieces, piece.id);
    const startPos = axisPos(piece);
    sessionRef.current = {
      pointerId: e.pointerId,
      id: piece.id,
      startPointer: horizontal ? e.clientX : e.clientY,
      startPos,
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
              const tint = exitRow
                ? (row + col) % 2 === 0
                  ? "#e0b676"
                  : "#d9ad6b"
                : (row + col) % 2 === 0
                  ? "#8fd05a"
                  : "#83c750";
              return (
                <div
                  key={i}
                  className="border border-black/10"
                  style={{ background: tint }}
                />
              );
            })}
          </div>

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
            return (
              <div
                key={p.id}
                role="button"
                tabIndex={disabled ? -1 : 0}
                aria-label={pieceLabel(p)}
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
                  } ${selected ? "ring-4 ring-white/90" : ""} ${hinted ? "animate-hint ring-4 ring-yellow-300" : ""}`}
                >
                  {isPot ? <PotOfGold /> : <LogBlock piece={p} />}
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
