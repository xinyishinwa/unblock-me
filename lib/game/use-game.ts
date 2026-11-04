"use client";

import { useCallback, useMemo, useState } from "react";
import { LevelConfig, levelToPieces } from "@/data/levels";
import { createInitialState, isFailed } from "./puzzle-state";
import {
  createSession,
  sessionHint,
  sessionMove,
  sessionReject,
  sessionReset,
  sessionUndo,
} from "./game-session";
import type { SpecialConfig } from "./special-types";

const NO_SPECIAL: SpecialConfig = {};

/**
 * Game session for one level (React wrapper over the pure transitions in
 * `game-session`). The whole `PuzzleState` is snapshotted on every valid move,
 * so Undo restores everything and Reset returns to the exact initial state.
 */
export function useGame(level: LevelConfig) {
  const special = level.special ?? NO_SPECIAL;
  const initial = useMemo(
    () => createInitialState(levelToPieces(level), special),
    [level, special],
  );
  const [session, setSession] = useState(() => createSession(initial));

  const move = useCallback(
    (id: string, to: number) => setSession((s) => sessionMove(s, special, id, to)),
    [special],
  );
  const reject = useCallback(
    (id: string, dir: -1 | 1) => setSession((s) => sessionReject(s, special, id, dir)),
    [special],
  );
  const undo = useCallback(() => setSession(sessionUndo), []);
  const reset = useCallback(() => setSession((s) => sessionReset(s, initial)), [initial]);
  const requestHint = useCallback(
    () => setSession((s) => sessionHint(s, special)),
    [special],
  );

  const { state } = session;
  return {
    state,
    pieces: state.pieces,
    moves: session.history.length,
    movesLeft: state.movesLeft,
    canUndo: session.history.length > 0 && !state.completed,
    hint: session.hint,
    hintMissing: session.hintMissing,
    solved: state.completed,
    failed: isFailed(state),
    events: session.events,
    tick: session.tick,
    rejected: session.rejected,
    move,
    reject,
    undo,
    reset,
    requestHint,
  };
}
