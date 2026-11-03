/**
 * Core sliding-puzzle engine. Pure functions only – no React, no DOM.
 *
 * Coordinates: `x` = column (0..BOARD_SIZE-1), `y` = row (0..BOARD_SIZE-1).
 * A piece is anchored at its top-left cell and extends right (horizontal)
 * or down (vertical) for `length` cells.
 */

export const BOARD_SIZE = 6;

export type Orientation = "horizontal" | "vertical";
export type PieceKind = "log" | "pot";

export interface Piece {
  id: string;
  kind: PieceKind;
  x: number;
  y: number;
  length: number;
  orientation: Orientation;
}

export interface Move {
  id: string;
  /** Position along the piece's axis before the move. */
  from: number;
  /** Position along the piece's axis after the move. */
  to: number;
}

export const POT_ID = "pot";

export function isHorizontal(p: Piece): boolean {
  return p.orientation === "horizontal";
}

/** Position of the piece along its movement axis. */
export function axisPos(p: Piece): number {
  return isHorizontal(p) ? p.x : p.y;
}

/** Cells occupied by a piece. */
export function pieceCells(p: Piece): Array<[number, number]> {
  const cells: Array<[number, number]> = [];
  for (let i = 0; i < p.length; i++) {
    cells.push(isHorizontal(p) ? [p.x + i, p.y] : [p.x, p.y + i]);
  }
  return cells;
}

/** Grid of piece ids (or null) for the given pieces. */
export function buildGrid(pieces: readonly Piece[]): (string | null)[][] {
  const grid: (string | null)[][] = Array.from({ length: BOARD_SIZE }, () =>
    Array<string | null>(BOARD_SIZE).fill(null),
  );
  for (const p of pieces) {
    for (const [cx, cy] of pieceCells(p)) {
      if (cx >= 0 && cx < BOARD_SIZE && cy >= 0 && cy < BOARD_SIZE) {
        grid[cy][cx] = p.id;
      }
    }
  }
  return grid;
}

/**
 * Inclusive range of axis positions a piece can legally slide to,
 * stopping at the first obstacle or board edge in either direction.
 */
export function getMoveRange(
  pieces: readonly Piece[],
  id: string,
): { min: number; max: number } {
  const piece = pieces.find((p) => p.id === id);
  if (!piece) throw new Error(`Unknown piece: ${id}`);
  const grid = buildGrid(pieces);
  const horizontal = isHorizontal(piece);
  const pos = axisPos(piece);

  const free = (axis: number): boolean => {
    const cx = horizontal ? axis : piece.x;
    const cy = horizontal ? piece.y : axis;
    const occupant = grid[cy][cx];
    return occupant === null || occupant === id;
  };

  let min = pos;
  while (min - 1 >= 0 && free(min - 1)) min--;
  let max = pos;
  while (max + piece.length < BOARD_SIZE && free(max + piece.length)) max++;
  return { min, max };
}

/** True if the piece can legally slide to `to` along its axis. */
export function canMoveTo(
  pieces: readonly Piece[],
  id: string,
  to: number,
): boolean {
  const { min, max } = getMoveRange(pieces, id);
  return Number.isInteger(to) && to >= min && to <= max;
}

/** Returns a new piece array with the piece moved, or null if illegal. */
export function applyMove(
  pieces: readonly Piece[],
  move: Move,
): Piece[] | null {
  if (!canMoveTo(pieces, move.id, move.to)) return null;
  return pieces.map((p) =>
    p.id !== move.id
      ? p
      : isHorizontal(p)
        ? { ...p, x: move.to }
        : { ...p, y: move.to },
  );
}

/** Every legal slide (to any reachable position) from the given state. */
export function getAllMoves(pieces: readonly Piece[]): Move[] {
  const moves: Move[] = [];
  for (const p of pieces) {
    const { min, max } = getMoveRange(pieces, p.id);
    const from = axisPos(p);
    for (let to = min; to <= max; to++) {
      if (to !== from) moves.push({ id: p.id, from, to });
    }
  }
  return moves;
}

/** The pot reaches the exit when its right edge touches the right wall. */
export function isSolved(pieces: readonly Piece[]): boolean {
  const pot = pieces.find((p) => p.id === POT_ID);
  return !!pot && pot.x + pot.length === BOARD_SIZE;
}

/** Compact, order-independent key identifying a board state. */
export function stateKey(pieces: readonly Piece[]): string {
  return [...pieces]
    .sort((a, b) => (a.id < b.id ? -1 : 1))
    .map((p) => `${p.id}${isHorizontal(p) ? p.x : p.y}`)
    .join("|");
}
