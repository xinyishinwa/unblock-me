import type { Piece } from "./puzzle-engine";

/** Board cell as `[x, y]` (column, row). */
export type Cell = readonly [number, number];

export type ChapterId = "golden-trails";

export type ThemeId =
  | "river"
  | "treasure-gate"
  | "enchanted"
  | "frozen"
  | "cagayan";

export type MechanicId =
  | "bridge"
  | "key"
  | "limited-moves"
  | "frozen"
  | "combo";

/** A designated log that activates something by covering a board cell. */
export interface SwitchTrigger {
  logId: string;
  cell: Cell;
}

/**
 * Optional special-mechanic configuration for a level. A level without it
 * behaves exactly like the original Levels 1–5.
 */
export interface SpecialConfig {
  /** Immovable stone obstacles (always block). */
  stones?: Cell[];
  /** Bridge cells block everyone until `trigger` is covered by its log. */
  bridge?: { cells: Cell[]; trigger: SwitchTrigger };
  /** Gate cells block until the key is collected at `trigger.cell`. */
  key?: { trigger: SwitchTrigger; gate: Cell[] };
  /** Frozen logs cannot move until `trigger` (the fire switch) is covered. */
  fire?: { trigger: SwitchTrigger; frozen: string[] };
  /** Maximum number of valid moves. */
  moveLimit?: number;
  /** Magical logs: may only slide `maxStep` cells per move. */
  magical?: Record<string, { maxStep: number }>;
  /** Purely visual shallow-water tiles (never block). */
  shallows?: Cell[];
  /** Extra exit conditions on top of "pot touches the right wall". */
  exitRequires?: Array<"bridge" | "gate">;
}

/**
 * The complete, centralized puzzle state. Every field is plain data, so
 * snapshotting the whole object makes Undo and Reset exact.
 */
export interface PuzzleState {
  /** Pot of Gold + every log. */
  pieces: Piece[];
  bridgeOpen: boolean;
  keyCollected: boolean;
  gateUnlocked: boolean;
  fireActive: boolean;
  /** Ids of logs that are still frozen (empty once the fire is lit). */
  frozen: string[];
  /** Remaining moves, or `null` when the level has no move limit. */
  movesLeft: number | null;
  /** True once the Pot of Gold has legally reached the exit. */
  completed: boolean;
}

export interface TutorialInfo {
  title: string;
  steps: string[];
}

export interface StarThresholds {
  /** Finish in at most this many moves for three stars. */
  three: number;
  /** Finish in at most this many moves for two stars. */
  two: number;
}
