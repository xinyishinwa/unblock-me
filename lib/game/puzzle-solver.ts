import {
  Move,
  Piece,
  applyMove,
  getAllMoves,
  isSolved,
  stateKey,
} from "./puzzle-engine";

export interface SolveResult {
  solvable: boolean;
  /** Optimal sequence of slides (each slide of any distance = 1 move). */
  moves: Move[];
}

/**
 * Breadth-first search over board states. A "move" is one slide of a single
 * piece over any number of cells, matching the in-game move counter.
 * BFS guarantees the returned solution is the shortest possible.
 */
export function solve(start: readonly Piece[]): SolveResult {
  if (isSolved(start)) return { solvable: true, moves: [] };

  interface Node {
    pieces: readonly Piece[];
    parent: Node | null;
    move: Move | null;
  }

  const root: Node = { pieces: start, parent: null, move: null };
  const visited = new Set<string>([stateKey(start)]);
  let frontier: Node[] = [root];

  while (frontier.length > 0) {
    const next: Node[] = [];
    for (const node of frontier) {
      for (const move of getAllMoves(node.pieces)) {
        const pieces = applyMove(node.pieces, move);
        if (!pieces) continue;
        const key = stateKey(pieces);
        if (visited.has(key)) continue;
        visited.add(key);
        const child: Node = { pieces, parent: node, move };
        if (isSolved(pieces)) {
          const moves: Move[] = [];
          for (let n: Node | null = child; n && n.move; n = n.parent) {
            moves.push(n.move);
          }
          return { solvable: true, moves: moves.reverse() };
        }
        next.push(child);
      }
    }
    frontier = next;
  }
  return { solvable: false, moves: [] };
}

/** Next best move from the given state, or null if solved/unsolvable. */
export function getHint(pieces: readonly Piece[]): Move | null {
  const result = solve(pieces);
  return result.solvable && result.moves.length > 0 ? result.moves[0] : null;
}
