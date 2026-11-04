/**
 * State-based puzzle engine. Extends the original piece-only engine with the
 * Golden Trails mechanics (bridge, key + gate, move limit, stones, magical and
 * frozen logs, fire switch). Pure functions only — no React, no DOM.
 *
 * Every transition returns a brand-new `PuzzleState`, so snapshotting a state
 * (for Undo) captures *all* mechanic state, and re-using the initial state
 * (for Reset) restores it exactly. A level with an empty `SpecialConfig`
 * behaves exactly like the original Levels 1–5.
 */

import {
  BOARD_SIZE,
  Move,
  POT_ID,
  Piece,
  axisPos,
  buildGrid,
  isHorizontal,
  pieceCells,
} from "./puzzle-engine";
import type { Cell, PuzzleState, SpecialConfig, SwitchTrigger } from "./special-types";

export const NO_SPECIAL: SpecialConfig = {};

export function createInitialState(
  pieces: readonly Piece[],
  special: SpecialConfig = NO_SPECIAL,
): PuzzleState {
  return {
    pieces: [...pieces],
    bridgeOpen: false,
    keyCollected: false,
    gateUnlocked: false,
    fireActive: false,
    frozen: [...(special.fire?.frozen ?? [])],
    movesLeft: special.moveLimit ?? null,
    completed: false,
  };
}

/** True when `trigger.logId` currently covers `trigger.cell`. */
export function triggerCovered(
  pieces: readonly Piece[],
  trigger: SwitchTrigger,
): boolean {
  const log = pieces.find((p) => p.id === trigger.logId);
  if (!log) return false;
  return pieceCells(log).some(([x, y]) => x === trigger.cell[0] && y === trigger.cell[1]);
}

export type BlockerKind = "stone" | "bridge" | "gate";

/** Cells that currently block every piece, with the reason they block. */
export function blockerAt(
  state: PuzzleState,
  special: SpecialConfig,
  x: number,
  y: number,
): BlockerKind | null {
  const hit = (cells: readonly Cell[] | undefined) =>
    !!cells && cells.some(([cx, cy]) => cx === x && cy === y);
  if (hit(special.stones)) return "stone";
  if (special.bridge && !state.bridgeOpen && hit(special.bridge.cells)) return "bridge";
  if (special.key && !state.gateUnlocked && hit(special.key.gate)) return "gate";
  return null;
}

function blockedGrid(state: PuzzleState, special: SpecialConfig): boolean[][] {
  const grid = Array.from({ length: BOARD_SIZE }, () =>
    Array<boolean>(BOARD_SIZE).fill(false),
  );
  const mark = (cells: readonly Cell[] | undefined) => {
    if (!cells) return;
    for (const [x, y] of cells) {
      if (x >= 0 && x < BOARD_SIZE && y >= 0 && y < BOARD_SIZE) grid[y][x] = true;
    }
  };
  mark(special.stones);
  if (special.bridge && !state.bridgeOpen) mark(special.bridge.cells);
  if (special.key && !state.gateUnlocked) mark(special.key.gate);
  return grid;
}

export function isFrozen(state: PuzzleState, id: string): boolean {
  return state.frozen.includes(id);
}

/** True once the move limit is exhausted without the level being completed. */
export function isFailed(state: PuzzleState): boolean {
  return !state.completed && state.movesLeft !== null && state.movesLeft <= 0;
}

interface RangeContext {
  grid: (string | null)[][];
  blocked: boolean[][];
}

function rangeContext(state: PuzzleState, special: SpecialConfig): RangeContext {
  return { grid: buildGrid(state.pieces), blocked: blockedGrid(state, special) };
}

function rangeFor(
  state: PuzzleState,
  special: SpecialConfig,
  piece: Piece,
  ctx: RangeContext,
): { min: number; max: number } {
  const pos = axisPos(piece);
  if (
    state.completed ||
    isFrozen(state, piece.id) ||
    (state.movesLeft !== null && state.movesLeft <= 0)
  ) {
    return { min: pos, max: pos };
  }
  const horizontal = isHorizontal(piece);
  const free = (axis: number): boolean => {
    const cx = horizontal ? axis : piece.x;
    const cy = horizontal ? piece.y : axis;
    if (ctx.blocked[cy][cx]) return false;
    const occupant = ctx.grid[cy][cx];
    return occupant === null || occupant === piece.id;
  };
  let min = pos;
  while (min - 1 >= 0 && free(min - 1)) min--;
  let max = pos;
  while (max + piece.length < BOARD_SIZE && free(max + piece.length)) max++;

  const magic = special.magical?.[piece.id];
  if (magic) {
    min = Math.max(min, pos - magic.maxStep);
    max = Math.min(max, pos + magic.maxStep);
  }
  return { min, max };
}

/** Inclusive range of axis positions a piece may legally slide to right now. */
export function getStateMoveRange(
  state: PuzzleState,
  special: SpecialConfig,
  id: string,
): { min: number; max: number } {
  const piece = state.pieces.find((p) => p.id === id);
  if (!piece) throw new Error(`Unknown piece: ${id}`);
  return rangeFor(state, special, piece, rangeContext(state, special));
}

export function canStateMoveTo(
  state: PuzzleState,
  special: SpecialConfig,
  id: string,
  to: number,
): boolean {
  const { min, max } = getStateMoveRange(state, special, id);
  return Number.isInteger(to) && to >= min && to <= max;
}

/** Every legal slide from the given state. */
export function getAllStateMoves(state: PuzzleState, special: SpecialConfig): Move[] {
  const ctx = rangeContext(state, special);
  const moves: Move[] = [];
  for (const p of state.pieces) {
    const { min, max } = rangeFor(state, special, p, ctx);
    const from = axisPos(p);
    for (let to = min; to <= max; to++) {
      if (to !== from) moves.push({ id: p.id, from, to });
    }
  }
  return moves;
}

/** Pot touches the right wall AND every required exit condition is met. */
export function exitConditionsMet(
  pieces: readonly Piece[],
  state: Pick<PuzzleState, "bridgeOpen" | "gateUnlocked">,
  special: SpecialConfig,
): boolean {
  const pot = pieces.find((p) => p.id === POT_ID);
  if (!pot || pot.x + pot.length !== BOARD_SIZE) return false;
  const req = special.exitRequires ?? [];
  if (req.includes("bridge") && !state.bridgeOpen) return false;
  if (req.includes("gate") && !state.gateUnlocked) return false;
  return true;
}

/**
 * Apply one slide. Returns the full next state (flags, frozen logs, move
 * counter and completion all updated) or `null` if the move is illegal.
 */
export function applyStateMove(
  state: PuzzleState,
  special: SpecialConfig,
  move: Move,
): PuzzleState | null {
  if (!canStateMoveTo(state, special, move.id, move.to) || move.to === move.from) {
    return null;
  }
  const pieces = state.pieces.map((p) =>
    p.id !== move.id ? p : isHorizontal(p) ? { ...p, x: move.to } : { ...p, y: move.to },
  );

  let bridgeOpen = state.bridgeOpen;
  let keyCollected = state.keyCollected;
  let gateUnlocked = state.gateUnlocked;
  let fireActive = state.fireActive;
  let frozen = state.frozen;

  if (special.bridge && !bridgeOpen && triggerCovered(pieces, special.bridge.trigger)) {
    bridgeOpen = true;
  }
  if (special.key && !keyCollected && triggerCovered(pieces, special.key.trigger)) {
    keyCollected = true;
    gateUnlocked = true;
  }
  if (special.fire && !fireActive && triggerCovered(pieces, special.fire.trigger)) {
    fireActive = true;
    frozen = [];
  }

  return {
    pieces,
    bridgeOpen,
    keyCollected,
    gateUnlocked,
    fireActive,
    frozen,
    movesLeft: state.movesLeft === null ? null : state.movesLeft - 1,
    completed: exitConditionsMet(pieces, { bridgeOpen, gateUnlocked }, special),
  };
}

/** Compact key identifying a puzzle state (move counter excluded; see solver). */
export function puzzleStateKey(state: PuzzleState): string {
  let key = "";
  for (const p of state.pieces) key += (isHorizontal(p) ? p.x : p.y) + ",";
  return (
    key +
    (state.bridgeOpen ? "b" : "") +
    (state.keyCollected ? "k" : "") +
    (state.fireActive ? "f" : "")
  );
}

export type MechanicEvent = "bridge-opened" | "key-collected" | "fire-lit";

/** Which one-way mechanics switched on between two consecutive states. */
export function diffEvents(prev: PuzzleState, next: PuzzleState): MechanicEvent[] {
  const events: MechanicEvent[] = [];
  if (!prev.bridgeOpen && next.bridgeOpen) events.push("bridge-opened");
  if (!prev.keyCollected && next.keyCollected) events.push("key-collected");
  if (!prev.fireActive && next.fireActive) events.push("fire-lit");
  return events;
}

export type BlockReason =
  | "done"
  | "no-moves"
  | "frozen"
  | "stone"
  | "bridge"
  | "gate"
  | "log"
  | "magic"
  | "edge";

/**
 * Why a one-cell slide of `id` in direction `dir` (-1 = left/up, +1 = right/down)
 * is not allowed, or `null` if it is allowed. Used for invalid-move feedback.
 */
export function blockReason(
  state: PuzzleState,
  special: SpecialConfig,
  id: string,
  dir: -1 | 1,
): BlockReason | null {
  const piece = state.pieces.find((p) => p.id === id);
  if (!piece) return "edge";
  if (state.completed) return "done";
  if (state.movesLeft !== null && state.movesLeft <= 0) return "no-moves";
  if (isFrozen(state, id)) return "frozen";

  const pos = axisPos(piece);
  const horizontal = isHorizontal(piece);
  const target = dir > 0 ? pos + piece.length : pos - 1;
  if (target < 0 || target >= BOARD_SIZE) return "edge";
  const cx = horizontal ? target : piece.x;
  const cy = horizontal ? piece.y : target;
  const blocker = blockerAt(state, special, cx, cy);
  if (blocker) return blocker;
  const occupant = buildGrid(state.pieces)[cy][cx];
  if (occupant !== null && occupant !== id) return "log";
  if (!canStateMoveTo(state, special, id, pos + dir)) return "magic";
  return null;
}
