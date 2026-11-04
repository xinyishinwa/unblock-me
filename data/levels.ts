import { BOARD_SIZE, Piece, POT_ID } from "@/lib/game/puzzle-engine";
import type {
  ChapterId,
  MechanicId,
  SpecialConfig,
  StarThresholds,
  ThemeId,
  TutorialInfo,
} from "@/lib/game/special-types";
import { GOLDEN_TRAILS_LEVELS } from "./golden-trails";

export type Difficulty = "Easy" | "Medium" | "Hard" | "Expert";

export interface LogDef {
  id: string;
  x: number;
  y: number;
  length: number;
  orientation: "horizontal" | "vertical";
}

export interface LevelConfig {
  id: number;
  name: string;
  difficulty: Difficulty;
  blurb: string;
  /** Pot of Gold – always horizontal, length 2. */
  pot: { x: number; y: number };
  logs: LogDef[];
  /** Optimal number of moves (verified by BFS in puzzle-validator). */
  minMoves: number;
  /** Chapter this level belongs to (undefined = the original Amulung levels). */
  chapter?: ChapterId;
  /** Background environment (undefined = the classic countryside). */
  theme?: ThemeId;
  /** Special mechanic this level introduces. */
  mechanic?: MechanicId;
  /** Short label for the mechanic badge, e.g. "Bridge Switch". */
  mechanicLabel?: string;
  /** Special objects + mechanic configuration. Absent on Levels 1-5. */
  special?: SpecialConfig;
  tutorial?: TutorialInfo;
  /** Move thresholds for 3 and 2 stars. Absent = derived from `minMoves`. */
  stars?: StarThresholds;
}

const h = "horizontal" as const;
const v = "vertical" as const;

/**
 * Five hand-picked levels. Every one is verified solvable (and `minMoves`
 * verified optimal) by `npm run validate-levels`.
 */
export const CLASSIC_LEVELS: LevelConfig[] = [
  {
    id: 1,
    name: "The Village Trail",
    difficulty: "Easy",
    blurb: "Stroll past the bahay kubo and clear the first logs.",
    pot: { x: 1, y: 2 },
    logs: [
      { id: "a", x: 4, y: 1, length: 3, orientation: v },
      { id: "b", x: 0, y: 1, length: 3, orientation: h },
      { id: "c", x: 2, y: 4, length: 2, orientation: h },
      { id: "d", x: 3, y: 1, length: 3, orientation: v },
      { id: "e", x: 5, y: 1, length: 2, orientation: v },
    ],
    minMoves: 5,
  },
  {
    id: 2,
    name: "The Rice Field",
    difficulty: "Easy",
    blurb: "Slide through the golden-green paddies.",
    pot: { x: 1, y: 2 },
    logs: [
      { id: "a", x: 0, y: 0, length: 3, orientation: h },
      { id: "b", x: 3, y: 1, length: 3, orientation: v },
      { id: "c", x: 0, y: 4, length: 2, orientation: v },
      { id: "d", x: 0, y: 2, length: 2, orientation: v },
      { id: "e", x: 1, y: 4, length: 3, orientation: h },
    ],
    minMoves: 6,
  },
  {
    id: 3,
    name: "The River Crossing",
    difficulty: "Medium",
    blurb: "Logs are piling up by the Cagayan River bank.",
    pot: { x: 0, y: 2 },
    logs: [
      { id: "a", x: 1, y: 5, length: 2, orientation: h },
      { id: "b", x: 4, y: 4, length: 2, orientation: v },
      { id: "c", x: 0, y: 4, length: 3, orientation: h },
      { id: "d", x: 2, y: 1, length: 3, orientation: v },
      { id: "e", x: 5, y: 0, length: 3, orientation: v },
      { id: "f", x: 3, y: 1, length: 2, orientation: h },
    ],
    minMoves: 11,
  },
  {
    id: 4,
    name: "The Mountain Path",
    difficulty: "Medium",
    blurb: "A winding trail beneath the Sierra Madre.",
    pot: { x: 2, y: 2 },
    logs: [
      { id: "a", x: 3, y: 4, length: 2, orientation: h },
      { id: "b", x: 2, y: 3, length: 3, orientation: h },
      { id: "c", x: 5, y: 4, length: 2, orientation: v },
      { id: "d", x: 2, y: 4, length: 2, orientation: v },
      { id: "e", x: 1, y: 2, length: 2, orientation: v },
      { id: "f", x: 4, y: 0, length: 3, orientation: v },
      { id: "g", x: 0, y: 0, length: 3, orientation: h },
      { id: "h", x: 5, y: 0, length: 2, orientation: v },
    ],
    minMoves: 15,
  },
  {
    id: 5,
    name: "The Treasure Route",
    difficulty: "Hard",
    blurb: "Only the cleverest farmer will reach the gold.",
    pot: { x: 1, y: 2 },
    logs: [
      { id: "a", x: 4, y: 3, length: 2, orientation: h },
      { id: "b", x: 0, y: 0, length: 2, orientation: h },
      { id: "c", x: 0, y: 2, length: 2, orientation: v },
      { id: "d", x: 2, y: 3, length: 3, orientation: v },
      { id: "e", x: 0, y: 5, length: 2, orientation: h },
      { id: "f", x: 5, y: 0, length: 3, orientation: v },
      { id: "g", x: 3, y: 3, length: 3, orientation: v },
    ],
    minMoves: 24,
  },
];

/** Every level, in play order: the original five followed by Golden Trails. */
export const LEVELS: LevelConfig[] = [...CLASSIC_LEVELS, ...GOLDEN_TRAILS_LEVELS];

export function getLevel(id: number): LevelConfig | undefined {
  return LEVELS.find((l) => l.id === id);
}

/** Convert a level config into the engine's piece list. */
export function levelToPieces(level: LevelConfig): Piece[] {
  const pot: Piece = {
    id: POT_ID,
    kind: "pot",
    x: level.pot.x,
    y: level.pot.y,
    length: 2,
    orientation: "horizontal",
  };
  const logs: Piece[] = level.logs.map((l) => ({ ...l, kind: "log" }));
  return [pot, ...logs];
}

export { BOARD_SIZE };
