"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import { LEVELS } from "@/data/levels";
import {
  DEFAULT_SNAPSHOT,
  Progress,
  parseProgress,
  readRawProgress,
  recordCompletion,
  subscribeProgress,
} from "./game-storage";

export interface UseProgress {
  progress: Progress;
  /** False during SSR / first hydration pass, true once localStorage is read. */
  hydrated: boolean;
  completeLevel: (levelId: number, moves: number) => void;
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
    (levelId: number, moves: number) =>
      recordCompletion(levelId, moves, LEVELS.length),
    [],
  );
  return { progress, hydrated, completeLevel };
}
