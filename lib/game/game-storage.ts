/**
 * Local progress persistence (localStorage). Safe to import on the server:
 * every browser access is guarded.
 */

export const STORAGE_KEY = "amulung-pot-of-gold:progress:v1";
const CHANGE_EVENT = "amulung-progress-change";

export interface Progress {
  /** Highest level id the player may play (level 1 is always unlocked). */
  highestUnlocked: number;
  /** Best (lowest) move count per completed level id. */
  best: Record<number, number>;
}

export const DEFAULT_PROGRESS: Progress = { highestUnlocked: 1, best: {} };

/** Serialized default – stable value for useSyncExternalStore snapshots. */
export const DEFAULT_SNAPSHOT = JSON.stringify(DEFAULT_PROGRESS);

function hasStorage(): boolean {
  try {
    return typeof window !== "undefined" && !!window.localStorage;
  } catch {
    return false;
  }
}

/** Parse + sanitise a raw stored value. Never throws. */
export function parseProgress(raw: string | null, totalLevels: number): Progress {
  if (!raw) return DEFAULT_PROGRESS;
  try {
    const data = JSON.parse(raw) as Partial<Progress>;
    const unlocked = Number(data.highestUnlocked);
    const best: Record<number, number> = {};
    if (data.best && typeof data.best === "object") {
      for (const [k, v] of Object.entries(data.best)) {
        const id = Number(k);
        const moves = Number(v);
        if (Number.isInteger(id) && id >= 1 && id <= totalLevels && moves > 0) {
          best[id] = moves;
        }
      }
    }
    const highestUnlocked = Math.min(
      totalLevels,
      Math.max(1, Number.isFinite(unlocked) ? Math.floor(unlocked) : 1),
    );
    return { highestUnlocked, best };
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
    /* storage full / blocked – progress simply won't persist */
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

/** Record a finished level: keep best score and unlock the next level. */
export function recordCompletion(
  levelId: number,
  moves: number,
  totalLevels: number,
): void {
  const current = parseProgress(readRawProgress(), totalLevels);
  const prevBest = current.best[levelId];
  write({
    highestUnlocked: Math.min(
      totalLevels,
      Math.max(current.highestUnlocked, levelId + 1),
    ),
    best: {
      ...current.best,
      [levelId]: prevBest === undefined ? moves : Math.min(prevBest, moves),
    },
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
