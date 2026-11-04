/**
 * Pure game-session transitions (no React). `use-game` is a thin wrapper, which
 * lets the Undo / Reset / hint / rejection rules be tested directly.
 *
 * `history` stores *complete* previous `PuzzleState`s, so Undo restores
 * everything (pieces, bridge, key, gate, fire, frozen logs, moves left).
 */

import { Move, axisPos } from "./puzzle-engine";
import {
  BlockReason,
  MechanicEvent,
  applyStateMove,
  blockReason,
  diffEvents,
} from "./puzzle-state";
import { getStateHint } from "./state-solver";
import type { PuzzleState, SpecialConfig } from "./special-types";

export interface Session {
  state: PuzzleState;
  /** Complete previous puzzle states, oldest first. One entry per valid move. */
  history: PuzzleState[];
  hint: Move | null;
  /** True when a hint was requested but no winning path exists from here. */
  hintMissing: boolean;
  /** Latest mechanic transitions (cleared on the next move/undo/reset). */
  events: MechanicEvent[];
  /** Increments on every state change so UI can key one-shot effects. */
  tick: number;
  /** Last rejected move, for invalid-move feedback. */
  rejected: { id: string; reason: BlockReason; n: number } | null;
}

export function createSession(initial: PuzzleState): Session {
  return {
    state: initial,
    history: [],
    hint: null,
    hintMissing: false,
    events: [],
    tick: 0,
    rejected: null,
  };
}

/** Try to slide `id` to axis position `to`. Invalid moves never cost a move. */
export function sessionMove(
  s: Session,
  special: SpecialConfig,
  id: string,
  to: number,
): Session {
  const piece = s.state.pieces.find((p) => p.id === id);
  if (!piece || s.state.completed) return s;
  const from = axisPos(piece);
  if (to === from) return s;
  const next = applyStateMove(s.state, special, { id, from, to });
  if (!next) {
    const reason = blockReason(s.state, special, id, to > from ? 1 : -1) ?? "edge";
    return { ...s, rejected: { id, reason, n: (s.rejected?.n ?? 0) + 1 } };
  }
  return {
    state: next,
    history: [...s.history, s.state],
    hint: null,
    hintMissing: false,
    events: diffEvents(s.state, next),
    tick: s.tick + 1,
    rejected: null,
  };
}

/** Record a refused one-cell nudge (keyboard / blocked drag) for feedback only. */
export function sessionReject(
  s: Session,
  special: SpecialConfig,
  id: string,
  dir: -1 | 1,
): Session {
  const reason = blockReason(s.state, special, id, dir);
  if (!reason) return s;
  return { ...s, rejected: { id, reason, n: (s.rejected?.n ?? 0) + 1 } };
}

export function sessionUndo(s: Session): Session {
  if (s.history.length === 0) return s;
  return {
    state: s.history[s.history.length - 1],
    history: s.history.slice(0, -1),
    hint: null,
    hintMissing: false,
    events: [],
    tick: s.tick + 1,
    rejected: null,
  };
}

export function sessionReset(s: Session, initial: PuzzleState): Session {
  return { ...createSession(initial), tick: s.tick + 1 };
}

export function sessionHint(s: Session, special: SpecialConfig): Session {
  if (s.state.completed) return s;
  const hint = getStateHint(s.state, special);
  return { ...s, hint, hintMissing: hint === null };
}
