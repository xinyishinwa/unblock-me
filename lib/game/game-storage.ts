/**
 * Local progress persistence (localStorage). Safe to import on the server:
 * every browser access is guarded.
 *
 * The storage key and the original `highestUnlocked` / `best` fields are
 * unchanged, so progress saved by earlier versions loads as-is. The Golden
 * Trails data (`stars`, `bonus`, `chapters`) is purely additive and optional.
 */

export const STORAGE_KEY = "amulung-pot-of-gold:progress:v1";
const CHANGE_EVENT = "amulung-progress-change";

export interface Progress {
  /** Highest level id the player may play (level 1 is always unlocked). */
  highestUnlocked: number;
  /** Best (lowest) move count per completed level id. */
  best: Record<number, number>;
  /** Best star rating (1–3) per completed level id. Optional in old saves. */
  stars: Record<number, number>;
  /** Best bonus coins earned per level id (move-limit levels). */
  bonus: Record<number, number>;
  /** Chapters the player has finished. */
  chapters: Record<string, boolean>;
}

export const DEFAULT_PROGRESS: Progress = {
  highestUnlocked: 1,
  best: {},
  stars: {},
  bonus: {},
  chapters: {},
};

/** Serialized default — stable value for useSyncExternalStore snapshots. */
export const DEFAULT_SNAPSHOT = JSON.stringify(DEFAULT_PROGRESS);

function hasStorage(): boolean {
  try {
    return typeof window !== "undefined" && !!window.localStorage;
  } catch {
    return false;
  }
}

function readLevelMap(
  value: unknown,
  totalLevels: number,
  min: number,
  max: number,
): Record<number, number> {
  const out: Record<number, number> = {};
  if (value && typeof value === "object") {
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      const id = Number(k);
      const n = Number(v);
      if (Number.isInteger(id) && id >= 1 && id <= totalLevels && n >= min && n <= max) {
        out[id] = n;
      }
    }
  }
  return out;
}

/** Parse + sanitise a raw stored value. Never throws. */
export function parseProgress(raw: string | null, totalLevels: number): Progress {
  if (!raw) return DEFAULT_PROGRESS;
  try {
    const data = JSON.parse(raw) as Partial<Progress>;
    const unlocked = Number(data.highestUnlocked);
    const best = readLevelMap(data.best, totalLevels, 1, Infinity);
    const stars = readLevelMap(data.stars, totalLevels, 1, 3);
    const bonus = readLevelMap(data.bonus, totalLevels, 0, Infinity);
    const chapters: Record<string, boolean> = {};
    if (data.chapters && typeof data.chapters === "object") {
      for (const [k, v] of Object.entries(data.chapters)) {
        if (v === true) chapters[k] = true;
      }
    }
    // Migration: saves made when the game had fewer levels capped
    // `highestUnlocked` at the old last level. Completing level N always
    // unlocks N + 1, so repair it from the completion record.
    const completedMax = Math.max(0, ...Object.keys(best).map(Number));
    const highestUnlocked = Math.min(
      totalLevels,
      Math.max(
        1,
        Number.isFinite(unlocked) ? Math.floor(unlocked) : 1,
        completedMax + 1,
      ),
    );
    return { highestUnlocked, best, stars, bonus, chapters };
  } catch {
    return DEFAULT_PROGRESS;
  }
}

/** Raw snapshot used by `useSyncExternalStore`. */
export function readRawProgress(): string {
  if (!hasStorage()) return DEFAULT_SNAPSHOT;
  try {
    return window.localStorage.getItem(STORAGE_KEY) ?? DEFAULT_SNAPSHOT;
  } catch {
    return DEFAULT_SNAPSHOT;
  }
}

export function subscribeProgress(callback: () => void): () => void {
  window.addEventListener("storage", callback);
  window.addEventListener(CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(CHANGE_EVENT, callback);
  };
}

function write(progress: Progress): void {
  if (!hasStorage()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    /* storage full / blocked — progress simply won't persist */
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export interface CompletionExtras {
  /** Star rating earned this run (1–3). */
  stars?: number;
  /** Bonus coins earned this run. */
  bonus?: number;
  /** Set when this completion finishes a chapter. */
  chapterCompleted?: string;
}

/** Record a finished level: keep best score and unlock the next level. */
export function recordCompletion(
  levelId: number,
  moves: number,
  totalLevels: number,
  extras: CompletionExtras = {},
): void {
  const current = parseProgress(readRawProgress(), totalLevels);
  const prevBest = current.best[levelId];
  const prevStars = current.stars[levelId] ?? 0;
  const prevBonus = current.bonus[levelId] ?? 0;
  write({
    highestUnlocked: Math.min(
      totalLevels,
      Math.max(current.highestUnlocked, levelId + 1),
    ),
    best: {
      ...current.best,
      [levelId]: prevBest === undefined ? moves : Math.min(prevBest, moves),
    },
    stars:
      extras.stars === undefined
        ? current.stars
        : { ...current.stars, [levelId]: Math.max(prevStars, extras.stars) },
    bonus:
      extras.bonus === undefined
        ? current.bonus
        : { ...current.bonus, [levelId]: Math.max(prevBonus, extras.bonus) },
    chapters: extras.chapterCompleted
      ? { ...current.chapters, [extras.chapterCompleted]: true }
      : current.chapters,
  });
}

export function resetProgress(): void {
  if (!hasStorage()) return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}
