import { Move, Piece } from "./puzzle-engine";
import {
  applyStateMove,
  createInitialState,
  getAllStateMoves,
  puzzleStateKey,
} from "./puzzle-state";
import type { PuzzleState, SpecialConfig } from "./special-types";

export interface StateSolveResult {
  solvable: boolean;
  /** Shortest sequence of slides (each slide of any distance = 1 move). */
  moves: Move[];
  /** Every state visited along the solution, `states[0]` being the start. */
  states: PuzzleState[];
  /** Number of distinct states explored (search effort). */
  explored: number;
}

/**
 * Breadth-first search over complete puzzle states. Understands sliding,
 * stones, the bridge, key + gate, frozen logs + fire switch, magical logs and
 * the move limit (a state with no moves left expands no further). Because BFS
 * visits states in order of move count, the first solution is the shortest.
 *
 * `maxExplored` is a safety valve for runaway searches; levels that hit it are
 * reported as unsolved.
 */
export function solveState(
  start: PuzzleState,
  special: SpecialConfig,
  maxExplored = 2_000_000,
): StateSolveResult {
  if (start.completed) {
    return { solvable: true, moves: [], states: [start], explored: 1 };
  }

  interface Node {
    state: PuzzleState;
    parent: Node | null;
    move: Move | null;
  }

  const root: Node = { state: start, parent: null, move: null };
  const visited = new Set<string>([puzzleStateKey(start)]);
  let frontier: Node[] = [root];

  while (frontier.length > 0) {
    const next: Node[] = [];
    for (const node of frontier) {
      for (const move of getAllStateMoves(node.state, special)) {
        const state = applyStateMove(node.state, special, move);
        if (!state) continue;
        const key = puzzleStateKey(state);
        if (visited.has(key)) continue;
        visited.add(key);
        const child: Node = { state, parent: node, move };
        if (state.completed) {
          const moves: Move[] = [];
          const states: PuzzleState[] = [];
          for (let n: Node | null = child; n; n = n.parent) {
            states.push(n.state);
            if (n.move) moves.push(n.move);
          }
          return {
            solvable: true,
            moves: moves.reverse(),
            states: states.reverse(),
            explored: visited.size,
          };
        }
        next.push(child);
        if (visited.size > maxExplored) {
          return { solvable: false, moves: [], states: [], explored: visited.size };
        }
      }
    }
    frontier = next;
  }
  return { solvable: false, moves: [], states: [], explored: visited.size };
}

/** Convenience wrapper: solve from a level's initial pieces + special config. */
export function solveLevel(
  pieces: readonly Piece[],
  special: SpecialConfig,
): StateSolveResult {
  return solveState(createInitialState(pieces, special), special);
}

/**
 * Next best move from the current state, accounting for every mechanic and the
 * remaining move budget. `null` if solved, or if the level can no longer be
 * finished from here (e.g. out of moves).
 */
export function getStateHint(state: PuzzleState, special: SpecialConfig): Move | null {
  if (state.completed) return null;
  const result = solveState(state, special);
  return result.solvable && result.moves.length > 0 ? result.moves[0] : null;
}
