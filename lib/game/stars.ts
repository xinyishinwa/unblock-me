import type { LevelConfig } from "@/data/levels";

export const MAX_STARS = 3;

/**
 * Star rating for finishing `level` in `moves` moves (1–3).
 * Levels with explicit `stars` thresholds use them; the original levels
 * derive thresholds from `minMoves` (perfect = 3, within 50% extra = 2).
 */
export function starsForMoves(level: LevelConfig, moves: number): number {
  const three = level.stars?.three ?? level.minMoves;
  const two = level.stars?.two ?? Math.ceil(level.minMoves * 1.5);
  if (moves <= three) return 3;
  if (moves <= two) return 2;
  return 1;
}

/** Moves still unspent when the level was finished (move-limit levels only). */
export function unusedMoves(level: LevelConfig, moves: number): number {
  const limit = level.special?.moveLimit;
  return limit === undefined ? 0 : Math.max(0, limit - moves);
}

/** Bonus gold coins awarded for unused moves on move-limit levels. */
export const BONUS_PER_UNUSED_MOVE = 25;

export function bonusForMoves(level: LevelConfig, moves: number): number {
  return unusedMoves(level, moves) * BONUS_PER_UNUSED_MOVE;
}
