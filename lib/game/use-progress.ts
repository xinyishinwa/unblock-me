"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import { LEVELS, getLevel } from "@/data/levels";
import {
  CompletionExtras,
  DEFAULT_SNAPSHOT,
  Progress,
  parseProgress,
  readRawProgress,
  recordCompletion,
  subscribeProgress,
} from "./game-storage";
import { starsForMoves } from "./stars";

export interface UseProgress {
  progress: Progress;
  /** False during SSR / first hydration pass, true once localStorage is read. */
  hydrated: boolean;
  completeLevel: (levelId: number, moves: number, extras?: CompletionExtras) => void;
}

const subscribeNoop = () => () => {};

export function useProgress(): UseProgress {
  const raw = useSyncExternalStore(
    subscribeProgress,
    readRawProgress,
    () => DEFAULT_SNAPSHOT,
  );
  const hydrated = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );
  const progress = useMemo(() => parseProgress(raw, LEVELS.length), [raw]);
  const completeLevel = useCallback(
    (levelId: number, moves: number, extras?: CompletionExtras) =>
      recordCompletion(levelId, moves, LEVELS.length, extras),
    [],
  );
  return { progress, hydrated, completeLevel };
}

/**
 * Stars to display for a level: the stored rating, or — for levels finished
 * before ratings existed — one derived from the stored best move count.
 */
export function starsFor(progress: Progress, levelId: number): number {
  const stored = progress.stars[levelId];
  if (stored !== undefined) return stored;
  const best = progress.best[levelId];
  const level = getLevel(levelId);
  return best !== undefined && level ? starsForMoves(level, best) : 0;
}

export function totalStars(progress: Progress, levelIds: readonly number[]): number {
  return levelIds.reduce((sum, id) => sum + starsFor(progress, id), 0);
}
