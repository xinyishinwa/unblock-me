"use client";

import { useCallback, useMemo, useState } from "react";
import { LevelConfig, levelToPieces } from "@/data/levels";
import { Move, Piece, applyMove, axisPos, isSolved } from "./puzzle-engine";
import { getHint } from "./puzzle-solver";

interface GameState {
  pieces: Piece[];
  /** Previous board states, oldest first. One entry per completed move. */
  history: Piece[][];
  hint: Move | null;
}

/** Game session state for one level: moves, undo, reset and hints. */
export function useGame(level: LevelConfig) {
  const initial = useMemo(() => levelToPieces(level), [level]);
  const [state, setState] = useState<GameState>({
    pieces: initial,
    history: [],
    hint: null,
  });

  const solved = isSolved(state.pieces);

  const move = useCallback((id: string, to: number) => {
    setState((s) => {
      if (isSolved(s.pieces)) return s;
      const piece = s.pieces.find((p) => p.id === id);
      if (!piece) return s;
      const from = axisPos(piece);
      if (to === from) return s;
      const next = applyMove(s.pieces, { id, from, to });
      if (!next) return s;
      return { pieces: next, history: [...s.history, s.pieces], hint: null };
    });
  }, []);

  const undo = useCallback(() => {
    setState((s) => {
      if (s.history.length === 0) return s;
      return {
        pieces: s.history[s.history.length - 1],
        history: s.history.slice(0, -1),
        hint: null,
      };
    });
  }, []);

  const reset = useCallback(() => {
    setState({ pieces: initial, history: [], hint: null });
  }, [initial]);

  const requestHint = useCallback(() => {
    setState((s) =>
      isSolved(s.pieces) ? s : { ...s, hint: getHint(s.pieces) },
    );
  }, []);

  return {
    pieces: state.pieces,
    moves: state.history.length,
    canUndo: state.history.length > 0 && !solved,
    hint: state.hint,
    solved,
    move,
    undo,
    reset,
    requestHint,
  };
}
